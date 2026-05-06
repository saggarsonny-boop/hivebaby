#!/usr/bin/env tsx
// HiveOps CLI.
//
// Usage:
//   tsx tools/hive-ops/cli.ts <engine-slug> [flags]
//
// Flags:
//   --repo <path>           repo root (default: cwd)
//   --json                  emit the report as JSON instead of human format
//   --write-overrides       propose override entries for failing rules,
//                           print to stdout for review
//   --apply                 (with --write-overrides) actually write the
//                           proposed entries into ENGINE_GRAMMAR.md
//   --warn-days <n>         warn_until horizon for proposed entries
//                           (default 7, max 30)
//   --reviewer <name>       reviewer name placed into proposed entries
//                           (default placeholder)
//
// Exit codes:
//   0 — verdict pass or warn (or --write-overrides without --apply)
//   1 — verdict fail
//   2 — could not resolve engine root or other tooling error

import { resolve } from "node:path";
import { runHiveOps, resolveEngineRoot } from "./runner.js";
import { RULES, MANDATORY_COUNT, RECOMMENDED_COUNT } from "./rules.js";
import { ruleFamily } from "./types.js";
import type { EngineReport, RuleResult } from "./types.js";
import {
  applyProposalsToFile,
  eligibleForProposal,
  proposalReport,
} from "./write-overrides.js";

interface CliArgs {
  slug: string;
  repo: string;
  json: boolean;
  writeOverrides: boolean;
  apply: boolean;
  warnDays?: number;
  reviewer?: string;
}

function parseArgs(argv: string[]): CliArgs | null {
  const positional: string[] = [];
  let repo = process.cwd();
  let json = false;
  let writeOverrides = false;
  let apply = false;
  let warnDays: number | undefined;
  let reviewer: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") { json = true; continue; }
    if (a === "--repo") { repo = resolve(argv[++i] ?? ""); continue; }
    if (a === "--write-overrides") { writeOverrides = true; continue; }
    if (a === "--apply") { apply = true; continue; }
    if (a === "--warn-days") {
      const v = Number(argv[++i]);
      if (!Number.isFinite(v) || v < 1) return null;
      warnDays = v;
      continue;
    }
    if (a === "--reviewer") { reviewer = argv[++i]; continue; }
    if (a === "-h" || a === "--help") return null;
    positional.push(a);
  }
  if (positional.length !== 1) return null;
  // --apply only meaningful with --write-overrides; reject silently to
  // make misuse obvious.
  if (apply && !writeOverrides) return null;
  return { slug: positional[0], repo, json, writeOverrides, apply, warnDays, reviewer };
}

function usage(): string {
  return [
    "Usage: tsx tools/hive-ops/cli.ts <engine-slug> [flags]",
    "",
    `HiveOps v0.2 — ${MANDATORY_COUNT} H-rules MANDATORY + ${RECOMMENDED_COUNT} RECOMMENDED, plus 29 V-rules (manifest schema via hive-finalize).`,
    "Auditable engine launch checklist enforcer.",
    "",
    "Flags:",
    "  --repo <path>            repo root (default: cwd)",
    "  --json                   emit JSON report",
    "  --write-overrides        propose override entries for failing rules → stdout",
    "  --apply                  with --write-overrides, write into ENGINE_GRAMMAR.md",
    "  --warn-days <n>          warn_until horizon for proposed entries (1-30, default 7)",
    "  --reviewer <name>        reviewer name in proposed entries (default TODO placeholder)",
  ].join("\n");
}

const STATUS_GLYPH: Record<RuleResult["status"], string> = {
  pass: "✓",
  warn: "!",
  fail: "✗",
  skip: "·",
  override: "○",
  "n/a": "—",
};

function formatHuman(report: EngineReport): string {
  const lines: string[] = [];
  const hRules = report.rules.filter((r) => safeFamily(r) === "H");
  const vRules = report.rules.filter((r) => safeFamily(r) === "V");

  lines.push(`HiveOps audit — ${report.engineSlug}`);
  lines.push(`  root: ${report.engineRoot}`);
  lines.push(`  engine_class: ${report.engineClass}`);
  lines.push(
    `  H-rules: ${RULES.length} (${MANDATORY_COUNT} MANDATORY · ${RECOMMENDED_COUNT} RECOMMENDED)`,
  );
  if (report.vRulesRan) {
    lines.push(`  V-rules: ${vRules.length} (manifest schema, via hive-finalize)`);
  } else {
    lines.push(`  V-rules: SKIPPED (no ENGINE_GRAMMAR.md frontmatter — see H19)`);
  }
  lines.push("");

  // ─── H-rules section ────────────────────────────────────────────────
  lines.push("== H-RULES (engine launch checklist) ==");
  appendRuleBlock(lines, hRules);

  // ─── V-rules section ────────────────────────────────────────────────
  if (report.vRulesRan) {
    lines.push("");
    lines.push("== V-RULES (manifest schema) ==");
    appendRuleBlock(lines, vRules);
  }

  lines.push("");

  if (report.overrideParseErrors.length > 0) {
    lines.push("OVERRIDE PARSE ERRORS:");
    for (const err of report.overrideParseErrors) lines.push(`  ${err}`);
    lines.push("");
  }

  if (report.warnModeRules.length > 0) {
    lines.push("WARN-MODE RULES (expire on date — fix before then):");
    for (const w of report.warnModeRules) {
      lines.push(`  ${w.id} — warn_until ${w.warnUntil}`);
    }
    lines.push("");
  }

  const tally = report.rules.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  lines.push(
    `tally (combined H+V): pass=${tally.pass ?? 0} warn=${tally.warn ?? 0} fail=${tally.fail ?? 0} skip=${tally.skip ?? 0} override=${tally.override ?? 0} n/a=${tally["n/a"] ?? 0}`,
  );
  lines.push("");
  lines.push(`VERDICT: ${report.verdict.toUpperCase()}`);
  return lines.join("\n");
}

function appendRuleBlock(lines: string[], rules: RuleResult[]): void {
  let cat = "";
  for (const r of rules) {
    if (r.category !== cat) {
      lines.push(`-- ${r.category} --`);
      cat = r.category;
    }
    const sev = r.severity === "MANDATORY" ? "M" : "r";
    lines.push(`  ${STATUS_GLYPH[r.status]} ${r.id} [${sev}] ${r.title}`);
    if (r.status !== "pass" && r.status !== "skip") {
      lines.push(`      ${r.message}`);
    }
  }
}

/** ruleFamily() throws on malformed IDs; the reporter shouldn't crash on
 *  one bad entry, so we coerce to "H" as a defensive fallback. */
function safeFamily(r: RuleResult): "H" | "V" {
  try { return ruleFamily(r.id); } catch { return "H"; }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    console.error(usage());
    process.exit(2);
  }

  const engineRoot = resolveEngineRoot(args.repo, args.slug);
  if (!engineRoot) {
    console.error(`error: could not find engine "${args.slug}" under ${args.repo}/apps/ or ${args.repo}/`);
    process.exit(2);
  }

  const report = await runHiveOps(engineRoot);

  // ─── --write-overrides path (with optional --apply) ─────────────────
  if (args.writeOverrides) {
    const opts = { warnDays: args.warnDays, reviewer: args.reviewer };
    if (args.apply) {
      let result;
      try {
        result = applyProposalsToFile(engineRoot, report, opts);
      } catch (err) {
        console.error(`hive-ops --apply failed: ${err instanceof Error ? err.message : String(err)}`);
        process.exit(2);
      }
      if (!result.changed) {
        if (eligibleForProposal(report).length === 0) {
          console.log(`No failing rules to propose — ${result.filePath} unchanged.`);
        } else {
          console.log(`All proposed entries already exist in ${result.filePath} — nothing to do.`);
          if (result.skipped.length > 0) {
            console.log(`  skipped: ${result.skipped.join(", ")}`);
          }
        }
      } else {
        console.log(`Updated ${result.filePath}:`);
        console.log(`  added: ${result.added.join(", ")}`);
        if (result.skipped.length > 0) {
          console.log(`  skipped (already had override): ${result.skipped.join(", ")}`);
        }
        console.log("");
        console.log("REVIEW each entry — replace TODO placeholders with real reasons + issue URLs before committing.");
      }
      // --apply exits 0 even if rules failed; the operator's intent is
      // to scaffold the overrides, not to gate the build.
      process.exit(0);
    }
    // No --apply — print the proposal block to stdout for review.
    process.stdout.write(proposalReport(report, opts));
    process.exit(0);
  }

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatHuman(report));
  }

  process.exit(report.verdict === "fail" ? 1 : 0);
}

main().catch((err) => {
  console.error("hive-ops crashed:", err);
  process.exit(2);
});
