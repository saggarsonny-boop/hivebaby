#!/usr/bin/env tsx
// HiveOps CLI.
//
// Usage:
//   tsx tools/hive-ops/cli.ts <engine-slug> [--repo <path>] [--json]
//
// Examples:
//   tsx tools/hive-ops/cli.ts parkback
//   tsx tools/hive-ops/cli.ts ud-converter --repo ../universal-document
//   tsx tools/hive-ops/cli.ts parkback --json | jq .
//
// Exit codes:
//   0 — verdict pass or warn
//   1 — verdict fail
//   2 — could not resolve engine root or other tooling error

import { resolve } from "node:path";
import { runHiveOps, resolveEngineRoot } from "./runner.js";
import { RULES, MANDATORY_COUNT, RECOMMENDED_COUNT } from "./rules.js";
import { ruleFamily } from "./types.js";
import type { EngineReport, RuleResult } from "./types.js";

interface CliArgs {
  slug: string;
  repo: string;
  json: boolean;
}

function parseArgs(argv: string[]): CliArgs | null {
  const positional: string[] = [];
  let repo = process.cwd();
  let json = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") { json = true; continue; }
    if (a === "--repo") { repo = resolve(argv[++i] ?? ""); continue; }
    if (a === "-h" || a === "--help") return null;
    positional.push(a);
  }
  if (positional.length !== 1) return null;
  return { slug: positional[0], repo, json };
}

function usage(): string {
  return [
    "Usage: tsx tools/hive-ops/cli.ts <engine-slug> [--repo <path>] [--json]",
    "",
    `HiveOps v0.1 — ${MANDATORY_COUNT} MANDATORY + ${RECOMMENDED_COUNT} RECOMMENDED rules.`,
    "Auditable engine launch checklist enforcer.",
    "",
    "Defaults:",
    "  --repo  current working directory",
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
