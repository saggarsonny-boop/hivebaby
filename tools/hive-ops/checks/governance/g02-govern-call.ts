// G02 — engine calls govern() at least once.
//
// The package being declared (G01) doesn't prove it's used. G02 greps
// engine source for an actual import + call. We don't run a full AST
// pass — a regex grep is sufficient to detect the canonical patterns
// without pulling in @typescript-eslint/parser or ts-morph.
//
// What we look for, in order of preference:
//   1. import { govern } from "@queen-bee/client"
//      then a govern( call somewhere in the same file or another.
//   2. import * as QB from "@queen-bee/client" + QB.govern( call.
//   3. require("@queen-bee/client") fallback (CommonJS engines).
//
// Search scope: app/api/**/route.ts, app/api/**/route.tsx, src/app/api/**.
// Engines that handle user input or AI output exclusively in route
// handlers — the canonical Hive engine shape per CLAUDE.md C10. Engines
// with handlers elsewhere (server-actions, lib/, edge middleware) can
// add an override pointing at the actual call site.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";
import type { RuleDefinition, RuleContext } from "../../types.js";

const ROUTE_DIRS = ["app/api", "src/app/api"];
const ROUTE_FILE = /\/route\.tsx?$/;

interface CallSite {
  file: string;
  line: number;
  text: string;
}

function* walk(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function findRouteFiles(engineRoot: string): string[] {
  const out: string[] = [];
  for (const d of ROUTE_DIRS) {
    const root = join(engineRoot, d);
    for (const f of walk(root)) {
      if (ROUTE_FILE.test(f.replace(/\\/g, "/"))) out.push(f);
    }
  }
  return out;
}

function findCallSites(files: string[]): CallSite[] {
  const sites: CallSite[] = [];
  // Two patterns we count as a real call:
  //   1. Bare-name invocation: `govern(` after a named import.
  //   2. Namespaced invocation: `<ns>.govern(` after `import * as <ns>`.
  // We require BOTH the import (somewhere in the file) AND a call site
  // (in the same file). This avoids false positives from comments
  // mentioning "govern" without a real consumption path.
  for (const file of files) {
    let text: string;
    try { text = readFileSync(file, "utf8"); } catch { continue; }

    const importsNamed = /import\s*\{[^}]*\bgovern\b[^}]*\}\s*from\s*["']@queen-bee\/client["']/.test(text);
    const importsNamespaced = /import\s*\*\s*as\s+(\w+)\s+from\s*["']@queen-bee\/client["']/.exec(text);
    const requiresPkg = /require\(\s*["']@queen-bee\/client["']\s*\)/.test(text);

    let callRegex: RegExp | null = null;
    if (importsNamed) {
      callRegex = /\bgovern\s*\(/;
    } else if (importsNamespaced) {
      const ns = importsNamespaced[1];
      callRegex = new RegExp(`\\b${ns}\\.govern\\s*\\(`);
    } else if (requiresPkg) {
      // CommonJS — accept any ".govern(" or "govern(" preceded by a
      // const destructure of govern.
      if (/\bconst\s*\{[^}]*\bgovern\b[^}]*\}\s*=\s*require/.test(text)) {
        callRegex = /\bgovern\s*\(/;
      } else {
        callRegex = /\.govern\s*\(/;
      }
    }

    if (!callRegex) continue;

    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (callRegex.test(lines[i] ?? "")) {
        sites.push({ file, line: i + 1, text: (lines[i] ?? "").trim().slice(0, 120) });
      }
    }
  }
  return sites;
}

export const G02_governCall: RuleDefinition = {
  id: "G02",
  title: "engine calls govern() in at least one route handler",
  category: "GOVERNANCE",
  severity: "MANDATORY",
  async check(ctx: RuleContext) {
    const files = findRouteFiles(ctx.engineRoot);
    if (files.length === 0) {
      // No route handlers at all — engine may be static-html or has
      // routes outside app/api. Don't fail; the applicability matrix
      // already filters static-html engines out of G02. For a Next.js
      // engine that genuinely has no /api routes, this means there's
      // nowhere for govern() to live, which IS a problem worth WARNing.
      return {
        status: "fail",
        message: `no route.ts(x) files found under ${ROUTE_DIRS.join(" or ")}. If govern() lives in server actions / middleware / lib helpers, add a HiveOps override pointing at the call site.`,
      };
    }

    const sites = findCallSites(files);
    if (sites.length === 0) {
      return {
        status: "fail",
        message: `${files.length} route handler(s) scanned; none import + call govern() from @queen-bee/client. See packages/queen-bee-client/WIRING.md §4.`,
      };
    }

    const summary = sites
      .slice(0, 3)
      .map((s) => `${s.file.split(sep).slice(-3).join("/")}:${s.line}`)
      .join(", ");
    return {
      status: "pass",
      message: `${sites.length} govern() call site(s) found across ${files.length} route handler(s). Examples: ${summary}.`,
    };
  },
};
