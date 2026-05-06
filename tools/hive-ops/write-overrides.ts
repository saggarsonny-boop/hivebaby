// --write-overrides — automated override scaffolding.
//
// Given an EngineReport, propose a YAML override entry for each failing
// rule (warn-mode, 7-day warn_until, placeholder reason + issue URL).
// The placeholder values are intentionally clearly-marked so the human
// reviewer cannot accidentally commit the unfilled scaffolding.
//
// Two consumption surfaces:
//   1. --write-overrides (no --apply): print to stdout for review.
//   2. --write-overrides --apply: merge into ENGINE_GRAMMAR.md's
//      ## Hive-Ops Overrides block in place. Existing entries are not
//      touched; only NEW entries are appended.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { EngineReport, RuleResult } from "./types.js";

export interface ProposeOptions {
  /** Mockable date — overrides "today" used for warn_until calculation. */
  now?: Date;
  /** Reviewer name placed into the proposed entries. Defaults to "TODO: your name". */
  reviewer?: string;
  /** Number of days from `now` for warn_until. Default 7 (the
   *  HiveOps default). Must be ≤ 30 (the override-loader hard cap). */
  warnDays?: number;
}

const DEFAULT_WARN_DAYS = 7;
const PLACEHOLDER_REASON = "TODO: justify why this engine cannot meet this rule";
const PLACEHOLDER_ISSUE = "TODO: file an issue and link here";
const PLACEHOLDER_REVIEWER = "TODO: your name";

/** Filter the report's rules to those eligible for an override proposal:
 *  - status === "fail" (we don't propose entries for passes / skips / n/a)
 *  - rule does not already have an override entry (to avoid clobbering
 *    human-authored entries that are themselves correct but happen to
 *    have expired — the loader surfaces those separately)
 */
export function eligibleForProposal(report: EngineReport): RuleResult[] {
  return report.rules.filter(
    (r) => r.status === "fail" && !r.overrideApplied,
  );
}

/** Build the YAML body string for the proposed entries. The output is
 *  the *contents* of the YAML block (not the markdown fences), so the
 *  caller can wrap it in ```yaml ... ``` for stdout or splice it into
 *  an existing fenced block when --apply is used. */
export function proposeOverridesYaml(
  report: EngineReport,
  opts: ProposeOptions = {},
): string {
  const proposals = eligibleForProposal(report);
  if (proposals.length === 0) return "overrides: []\n";
  const now = opts.now ?? new Date();
  const today = isoDate(now);
  const warnDays = clampWarnDays(opts.warnDays ?? DEFAULT_WARN_DAYS);
  const warnUntil = isoDate(addDays(now, warnDays));
  const reviewer = opts.reviewer ?? PLACEHOLDER_REVIEWER;

  const lines: string[] = ["overrides:"];
  for (const r of proposals) {
    lines.push(`  - rule: ${r.id}`);
    lines.push(`    mode: warn`);
    // Quote reason because it contains the placeholder colon-words and
    // YAML requires quoting for safety.
    lines.push(`    reason: "${PLACEHOLDER_REASON}"`);
    lines.push(`    issue: "${PLACEHOLDER_ISSUE}"`);
    lines.push(`    reviewer: ${reviewer}`);
    lines.push(`    date: ${today}`);
    lines.push(`    warn_until: ${warnUntil}`);
    // Comment with the original failure message so the reviewer can
    // judge whether warn-mode is even the right disposition.
    lines.push(`    # original: ${r.title}`);
    lines.push(`    # message:  ${r.message.replace(/\n/g, " ")}`);
  }
  return lines.join("\n") + "\n";
}

/** Render the full stdout block for `--write-overrides` (no --apply).
 *  Includes guidance comments + the YAML body wrapped in markdown fences
 *  so the user can copy-paste into ENGINE_GRAMMAR.md as-is. */
export function proposalReport(
  report: EngineReport,
  opts: ProposeOptions = {},
): string {
  const proposals = eligibleForProposal(report);
  if (proposals.length === 0) {
    return "No failing rules eligible for override proposal — nothing to scaffold.\n";
  }
  const yamlBody = proposeOverridesYaml(report, opts);
  const lines: string[] = [];
  lines.push("# Proposed override entries for failing rules");
  lines.push(`# Engine: ${report.engineSlug}`);
  lines.push(`# Failing rules: ${proposals.map((r) => r.id).join(", ")}`);
  lines.push(`# Default mode is warn (7-day window). Switch to mode: waive for`);
  lines.push(`# permanent overrides; never beyond 30 days for warn.`);
  lines.push("# Replace every TODO placeholder before committing.");
  lines.push("");
  lines.push("```yaml");
  lines.push("## Hive-Ops Overrides");
  lines.push("");
  lines.push(yamlBody.trimEnd());
  lines.push("```");
  return lines.join("\n") + "\n";
}

/** Apply mode — merge the proposed entries into the engine's
 *  ENGINE_GRAMMAR.md. Returns a structured result describing what
 *  changed (so the CLI can report cleanly). */
export interface ApplyResult {
  filePath: string;
  added: string[];   // rule IDs newly added
  skipped: string[]; // rule IDs already present (left untouched)
  /** True iff the file was modified. */
  changed: boolean;
}

export function applyProposalsToFile(
  engineRoot: string,
  report: EngineReport,
  opts: ProposeOptions = {},
): ApplyResult {
  const filePath = join(engineRoot, "ENGINE_GRAMMAR.md");
  if (!existsSync(filePath)) {
    throw new Error(
      `Cannot apply: ${filePath} does not exist. Create the manifest first (see docs/specs/manifest-schema-final.md).`,
    );
  }
  const original = readFileSync(filePath, "utf8");
  const proposals = eligibleForProposal(report);

  if (proposals.length === 0) {
    return { filePath, added: [], skipped: [], changed: false };
  }

  // Detect existing override entries so we don't append duplicates. We
  // scan the full file body for `- rule: <H##|V##>` lines anywhere
  // inside a `## Hive-Ops Overrides` YAML block.
  const existingIds = collectExistingOverrideRuleIds(original);

  const toAdd: RuleResult[] = [];
  const skipped: string[] = [];
  for (const p of proposals) {
    if (existingIds.has(p.id)) skipped.push(p.id);
    else toAdd.push(p);
  }

  if (toAdd.length === 0) {
    return { filePath, added: [], skipped, changed: false };
  }

  // Build a focused report containing only the to-add rules so
  // proposeOverridesYaml emits the right subset.
  const focusedReport: EngineReport = { ...report, rules: toAdd };
  const newYamlBody = proposeOverridesYaml(focusedReport, opts);

  const updated = mergeIntoOverridesSection(original, newYamlBody);
  if (updated === original) {
    // Defensive — should never happen given the above guards.
    return { filePath, added: [], skipped, changed: false };
  }
  writeFileSync(filePath, updated, "utf8");
  return {
    filePath,
    added: toAdd.map((r) => r.id),
    skipped,
    changed: true,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function clampWarnDays(days: number): number {
  if (!Number.isFinite(days) || days < 1) return DEFAULT_WARN_DAYS;
  if (days > 30) return 30;
  return Math.floor(days);
}

/** Walk the file body and return the set of rule IDs already declared
 *  inside any ## Hive-Ops Overrides YAML fenced block. */
function collectExistingOverrideRuleIds(body: string): Set<string> {
  const ids = new Set<string>();
  const blockRe = /^##\s+Hive-Ops Overrides\s*\n+\s*```ya?ml\s*\n([\s\S]*?)\n```/gim;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(body)) !== null) {
    const yaml = m[1];
    const lineRe = /^\s*-\s*rule:\s*([HV]\d{2})\s*$/gm;
    let l: RegExpExecArray | null;
    while ((l = lineRe.exec(yaml)) !== null) {
      ids.add(l[1]);
    }
  }
  return ids;
}

/** Splice the new YAML body into the engine's ENGINE_GRAMMAR.md. Three
 *  cases:
 *
 *   1. File already has `## Hive-Ops Overrides` with a YAML block →
 *      append the new entries (minus the `overrides:` header) inside
 *      the existing block.
 *   2. File has the heading but no YAML block (malformed) → replace
 *      the whole section with a fresh block.
 *   3. File has no Hive-Ops Overrides section → append a new section
 *      at the end of the file.
 */
function mergeIntoOverridesSection(body: string, newYamlBody: string): string {
  const headingMatch = body.match(/^##\s+Hive-Ops Overrides\b/im);
  if (!headingMatch) {
    // Case 3 — append a new section. Trim trailing whitespace so we
    // don't accumulate blank lines on repeated --apply runs.
    const sep = body.endsWith("\n\n") ? "" : body.endsWith("\n") ? "\n" : "\n\n";
    return (
      body +
      sep +
      "## Hive-Ops Overrides\n" +
      "\n" +
      "```yaml\n" +
      newYamlBody.trimEnd() +
      "\n```\n"
    );
  }

  // Case 1 / 2 — find the YAML fenced block under the heading.
  const blockRe = /(##\s+Hive-Ops Overrides\s*\n+\s*```ya?ml\s*\n)([\s\S]*?)(\n```)/im;
  const m = body.match(blockRe);
  if (!m) {
    // Case 2 — no fenced block under the heading. Don't try to repair
    // arbitrary prose; insert a fresh block right after the heading
    // and let the human reconcile.
    return body.replace(
      /(##\s+Hive-Ops Overrides\b[^\n]*\n)/i,
      `$1\n\`\`\`yaml\n${newYamlBody.trimEnd()}\n\`\`\`\n`,
    );
  }

  // Case 1 — append the new entries (minus the `overrides:` header
  // line) to the existing YAML block.
  const existingYaml = m[2];
  const newEntries = stripOverridesHeader(newYamlBody);
  // If the existing block already ends with the same content, no-op.
  if (existingYaml.includes(newEntries.trimEnd())) return body;
  // Append with a single newline separator, preserving formatting.
  const updated = existingYaml.replace(/\s+$/, "") + "\n" + newEntries.trimEnd();
  return body.replace(blockRe, `$1${updated}$3`);
}

/** Drop the literal `overrides:` first line from a proposed YAML body
 *  so it can be appended to an existing `overrides:` list. */
function stripOverridesHeader(yaml: string): string {
  return yaml.replace(/^overrides:\s*\n?/, "");
}
