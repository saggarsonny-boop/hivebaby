// G05 — engine persists the governance stamp alongside content.
//
// When QB stamps a response, the stamp's `engine, schema, version,
// timestamp, language, safe, governed, flags` should travel with the
// content into whatever store the engine uses. Without persistence,
// the audit dashboard at queenbee.hive.baby can only verify reachability,
// not historical governance — a regression in QB rules is undetectable
// against past responses.
//
// We accept any of:
//   - SQL DDL (`db/schema/*.sql` or `migrations/*.sql`) declaring a
//     `governance_stamp` column or `stamp_id` foreign key.
//   - Prisma schema (`prisma/schema.prisma`) declaring a model field
//     named `governanceStamp` / `governance_stamp` / `stampId` /
//     `stamp_id`.
//   - Drizzle schema (`db/schema*.ts`) declaring a column with one of
//     those names.
//
// Engines without a database (HiveMoon, HiveClock, ParkBack — all
// client-only PWAs) should declare `engine_class: api-only` or
// `static-html` in ENGINE_GRAMMAR.md, OR add a `cost_profile: zero` +
// explicit override for G05. The applicability matrix already exempts
// static-html engines from G05.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { RuleDefinition, RuleContext } from "../../types.js";

const STAMP_TOKENS = [
  /\bgovernance_stamp\b/i,
  /\bgovernanceStamp\b/,
  /\bstamp_id\b/i,
  /\bstampId\b/,
];

const SCHEMA_DIRS = ["db/schema", "migrations", "prisma", "db/migrations"];
const SCHEMA_FILES_AT_ROOT = [
  "prisma/schema.prisma",
  "drizzle.config.ts",
  "db.ts",
  "db/schema.ts",
];

function* walk(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  let st;
  try { st = statSync(dir); } catch { return; }
  if (!st.isDirectory()) {
    yield dir;
    return;
  }
  for (const name of readdirSync(dir)) {
    yield* walk(join(dir, name));
  }
}

function tokenMatch(text: string): RegExpMatchArray | null {
  for (const re of STAMP_TOKENS) {
    const m = text.match(re);
    if (m) return m;
  }
  return null;
}

export const G05_stampPersistence: RuleDefinition = {
  id: "G05",
  title: "engine DB schema persists governance stamp (governance_stamp / stampId / stamp_id)",
  category: "GOVERNANCE",
  severity: "MANDATORY",
  async check(ctx: RuleContext) {
    const candidates = new Set<string>();
    for (const d of SCHEMA_DIRS) {
      for (const f of walk(join(ctx.engineRoot, d))) {
        if (/\.(sql|ts|prisma)$/.test(f)) candidates.add(f);
      }
    }
    for (const f of SCHEMA_FILES_AT_ROOT) {
      const path = join(ctx.engineRoot, f);
      if (existsSync(path)) candidates.add(path);
    }

    if (candidates.size === 0) {
      return {
        status: "fail",
        message: `no schema files found under ${SCHEMA_DIRS.join(", ")} or at ${SCHEMA_FILES_AT_ROOT.slice(0, 2).join(", ")}. If engine has no DB (client-only PWA), set engine_class: static-html in ENGINE_GRAMMAR.md to exempt G05.`,
      };
    }

    const matches: { file: string; token: string }[] = [];
    for (const file of candidates) {
      let text: string;
      try { text = readFileSync(file, "utf8"); } catch { continue; }
      const m = tokenMatch(text);
      if (m) matches.push({ file, token: m[0] });
    }

    if (matches.length === 0) {
      return {
        status: "fail",
        message: `${candidates.size} schema file(s) scanned; none declare governance_stamp / stampId / stamp_id. Add a column or foreign key persisting the QB stamp alongside engine content. See packages/queen-bee-client/WIRING.md §8.`,
      };
    }

    const summary = matches
      .slice(0, 3)
      .map((m) => `${m.file.split("/").slice(-2).join("/")} (${m.token})`)
      .join(", ");
    return {
      status: "pass",
      message: `governance stamp persisted in ${matches.length} schema file(s). Examples: ${summary}.`,
    };
  },
};
