#!/usr/bin/env tsx
// Cross-repo HiveOps audit. Clones each engine listed in
// tools/hive-ops/external-engines.json and runs runHiveOps against the
// fresh clone, then emits a Markdown summary suitable for the daily-
// sweep issue body. Optionally inserts hive_alerts rows on FAIL.
//
// Why this exists: dailySweep.ts only sees apps/<engine>/ENGINE_GRAMMAR.md
// in the hivebaby monorepo. External-repo engines (UD Converter,
// HiveEngineBuilder, HiveAdminSupport, UniversalDocumentInc, …) were
// invisible to the sweep — verdict drift went undetected for days at a
// time. This orchestrator closes that gap by cloning each external
// engine repo and running the SAME runHiveOps() the in-tree sweep uses,
// so verdicts are computed identically across repos.
//
// Usage:
//   tsx tools/hive-ops/crossRepoAudit.ts [--registry PATH] [--clone-dir PATH]
//                                        [--out PATH] [--dry-run]
//
// Exit codes:
//   0 — every external engine ran (verdict may be PASS/WARN/FAIL — that's
//       reported in the output, not the exit code)
//   2 — tooling error (registry parse failure, clone failure, etc.)

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runHiveOps, resolveEngineRoot } from "./runner.js";
import type { EngineReport } from "./types.js";

const AGENT = "hive-ops-cross-repo";

interface ExternalEngine {
  slug: string;
  engine_name: string;
  repo: string;            // owner/name
  default_branch: string;
  subdir_pattern: "monorepo" | "root";
  domain?: string;
}

interface ExternalRegistry {
  version: number;
  engines: ExternalEngine[];
}

interface CrossRepoArgs {
  registry: string;
  cloneDir: string;
  out: string | null;
  dryRun: boolean;
}

interface ExternalResult {
  engine: ExternalEngine;
  /** undefined = clone or audit failed before producing a report */
  report?: EngineReport;
  errorMessage?: string;
  durationMs: number;
}

function parseArgs(argv: string[]): CrossRepoArgs | null {
  const here = dirname(fileURLToPath(import.meta.url));
  const args: CrossRepoArgs = {
    registry: resolve(here, "external-engines.json"),
    cloneDir: process.env.RUNNER_TEMP ? join(process.env.RUNNER_TEMP, "hive-ops-clones") : "/tmp/hive-ops-clones",
    out: null,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--registry") { args.registry = resolve(argv[++i] ?? ""); continue; }
    if (a === "--clone-dir") { args.cloneDir = resolve(argv[++i] ?? ""); continue; }
    if (a === "--out") { args.out = resolve(argv[++i] ?? ""); continue; }
    if (a === "--dry-run") { args.dryRun = true; continue; }
    if (a === "-h" || a === "--help") return null;
    return null;
  }
  return args;
}

function loadRegistry(path: string): ExternalRegistry {
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw) as ExternalRegistry;
  if (!parsed || typeof parsed !== "object") throw new Error(`registry malformed: ${path}`);
  if (!Array.isArray(parsed.engines)) throw new Error(`registry missing engines[]: ${path}`);
  for (const e of parsed.engines) {
    if (!e.slug || !e.repo || !e.default_branch || !e.subdir_pattern) {
      throw new Error(`registry entry missing required fields: ${JSON.stringify(e)}`);
    }
    if (e.subdir_pattern !== "monorepo" && e.subdir_pattern !== "root") {
      throw new Error(`registry entry has invalid subdir_pattern: ${e.subdir_pattern}`);
    }
  }
  return parsed;
}

/** Fresh clone of repo into `<cloneDir>/<repo-basename>`. Replaces any
 *  existing clone at that path. Uses GITHUB_TOKEN if present (so private
 *  repos work in CI); otherwise falls back to anonymous HTTPS. */
function cloneRepo(engine: ExternalEngine, cloneDir: string): string {
  const repoBasename = engine.repo.split("/").pop()!;
  const dest = join(cloneDir, repoBasename);
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  mkdirSync(cloneDir, { recursive: true });
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const url = token
    ? `https://x-access-token:${token}@github.com/${engine.repo}.git`
    : `https://github.com/${engine.repo}.git`;
  execFileSync(
    "git",
    ["clone", "--depth", "1", "--branch", engine.default_branch, url, dest],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  return dest;
}

function verdictOf(report: EngineReport): "pass" | "warn" | "fail" {
  // Same calculus the runner uses: any fail → fail; any warn → warn;
  // otherwise pass.
  let hasWarn = false;
  for (const r of report.rules) {
    if (r.status === "fail") return "fail";
    if (r.status === "warn") hasWarn = true;
  }
  return hasWarn ? "warn" : "pass";
}

interface Tally { pass: number; warn: number; fail: number; skip: number; override: number; "n/a": number; }

function tallyOf(report: EngineReport): Tally {
  const t: Tally = { pass: 0, warn: 0, fail: 0, skip: 0, override: 0, "n/a": 0 };
  for (const r of report.rules) (t as Record<string, number>)[r.status] = ((t as Record<string, number>)[r.status] ?? 0) + 1;
  return t;
}

async function auditOne(
  engine: ExternalEngine,
  cloneDir: string,
): Promise<ExternalResult> {
  const start = Date.now();
  let cloneRoot: string;
  try {
    cloneRoot = cloneRepo(engine, cloneDir);
  } catch (err) {
    return {
      engine,
      errorMessage: `clone failed: ${err instanceof Error ? err.message : String(err)}`,
      durationMs: Date.now() - start,
    };
  }

  const engineRoot = resolveEngineRoot(cloneRoot, engine.slug);
  if (!engineRoot) {
    return {
      engine,
      errorMessage: `runner could not find engine "${engine.slug}" under ${cloneRoot} (subdir_pattern=${engine.subdir_pattern})`,
      durationMs: Date.now() - start,
    };
  }

  try {
    const report = await runHiveOps(engineRoot);
    return { engine, report, durationMs: Date.now() - start };
  } catch (err) {
    return {
      engine,
      errorMessage: `audit threw: ${err instanceof Error ? err.message : String(err)}`,
      durationMs: Date.now() - start,
    };
  }
}

/** Markdown section appended to the daily-sweep issue body. Always
 *  emitted, even when every engine PASSes — the visibility is the point. */
export function formatCrossRepoSection(results: ExternalResult[]): string {
  const lines: string[] = [];
  lines.push("");
  lines.push(`## External-repo engines (${results.length})`);
  lines.push("");
  if (results.length === 0) {
    lines.push("_Registry is empty. Add entries to `tools/hive-ops/external-engines.json`._");
    return lines.join("\n");
  }
  lines.push("| Engine | Repo | Verdict | Tally (pass/warn/fail/skip/override) | Notes |");
  lines.push("|---|---|---|---|---|");
  for (const r of results) {
    const repoLink = `[\`${r.engine.repo}\`](https://github.com/${r.engine.repo})`;
    if (r.errorMessage) {
      lines.push(`| **${r.engine.engine_name}** (\`${r.engine.slug}\`) | ${repoLink} | 🚧 ERROR | — | ${escapeCell(r.errorMessage)} |`);
      continue;
    }
    const v = verdictOf(r.report!);
    const t = tallyOf(r.report!);
    const glyph = v === "pass" ? "✅" : v === "warn" ? "⚠️" : "❌";
    const notes = (r.report!.warnModeRules.length > 0)
      ? `WARN: ${r.report!.warnModeRules.map(w => `${w.id}→${w.warnUntil}`).join(", ")}`
      : (v === "fail" ? "see repo audit log for failing rules" : "");
    lines.push(`| **${r.engine.engine_name}** (\`${r.engine.slug}\`) | ${repoLink} | ${glyph} ${v.toUpperCase()} | ${t.pass}/${t.warn}/${t.fail}/${t.skip}/${t.override} | ${escapeCell(notes)} |`);
  }
  lines.push("");
  const fails = results.filter(r => r.report && verdictOf(r.report) === "fail");
  if (fails.length > 0) {
    lines.push(`> **${fails.length} external engine${fails.length === 1 ? "" : "s"} FAILing.** Each FAIL row above has had a tier-2 \`hive_alerts\` regression entry inserted with a cross-link to the engine repo.`);
  }
  return lines.join("\n");
}

function escapeCell(s: string): string { return s.replace(/\|/g, "\\|").replace(/\n/g, " "); }

/** Insert a tier-2 hive_alerts row for an external engine FAIL. Best-
 *  effort: psql + DATABASE_URL; otherwise prints. */
function insertFailAlert(r: ExternalResult): void {
  if (!r.report) return;
  const dbUrl = process.env.DATABASE_URL;
  const subject = `HiveOps: external engine ${r.engine.engine_name} regressed to FAIL`;
  const t = tallyOf(r.report);
  const body = [
    `Engine:     ${r.engine.engine_name} (${r.engine.slug})`,
    `Repo:       https://github.com/${r.engine.repo}`,
    `Tally:      pass=${t.pass} warn=${t.warn} fail=${t.fail} skip=${t.skip} override=${t.override} n/a=${t["n/a"]}`,
    "",
    "Cross-repo daily sweep detected a verdict regression. The engine's",
    "previous verdict was not WARN/FAIL on the prior sweep; this run",
    "found at least one rule in `fail`. See the engine repo for failing-",
    "rule detail (or run `tsx tools/hive-ops/cli.ts <slug> --repo <clone>`",
    "locally).",
    "",
    "Action: investigate the regression in the engine repo and either",
    "fix the underlying issue or add a documented `mode: warn` override",
    "with `warn_until` per the schema in HIVE_CONSTITUTION.md §V.",
  ].join("\n");
  if (!dbUrl) {
    console.log(`[cross-repo-audit] (no DATABASE_URL — would insert) tier=2 subject=${subject}`);
    return;
  }
  const actionUrl = `https://github.com/${r.engine.repo}`;
  const sql =
    `INSERT INTO hive_alerts (tier, agent, subject, body, action_required, action_url) ` +
    `VALUES (2, ${dollarQuote(AGENT)}, ${dollarQuote(subject)}, ${dollarQuote(body)}, true, ${dollarQuote(actionUrl)});`;
  execFileSync("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "-c", sql], { stdio: "inherit" });
}

function dollarQuote(s: string): string {
  let tag = "tag";
  while (s.includes(`$${tag}$`)) tag = "t" + Math.random().toString(36).slice(2, 8);
  return `$${tag}$${s}$${tag}$`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    console.error("Usage: tsx tools/hive-ops/crossRepoAudit.ts [--registry PATH] [--clone-dir PATH] [--out PATH] [--dry-run]");
    process.exit(2);
  }
  let registry: ExternalRegistry;
  try {
    registry = loadRegistry(args.registry);
  } catch (err) {
    console.error(`registry load failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(2);
  }

  console.log(`cross-repo-audit: ${registry.engines.length} engines registered`);
  const results: ExternalResult[] = [];
  for (const engine of registry.engines) {
    console.log(`  → ${engine.engine_name} (${engine.repo})`);
    const r = await auditOne(engine, args.cloneDir);
    if (r.errorMessage) {
      console.log(`    ERROR ${r.errorMessage}`);
    } else {
      const v = verdictOf(r.report!);
      const t = tallyOf(r.report!);
      console.log(`    ${v.toUpperCase()} (${t.pass}/${t.warn}/${t.fail}/${t.skip}/${t.override})  in ${r.durationMs}ms`);
    }
    results.push(r);
  }

  const md = formatCrossRepoSection(results);
  if (args.out) {
    writeFileSync(args.out, md);
    console.log(`cross-repo-audit: section written → ${args.out}`);
  } else {
    process.stdout.write("\n" + md + "\n");
  }

  if (!args.dryRun) {
    for (const r of results) {
      if (r.report && verdictOf(r.report) === "fail") {
        insertFailAlert(r);
      }
    }
  }

  process.exit(0);
}

const isCli =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  /crossRepoAudit\.(ts|js|mjs)$/.test(process.argv[1]);
if (isCli) {
  main().catch((err) => {
    console.error("hive-ops cross-repo-audit crashed:", err);
    process.exit(2);
  });
}
