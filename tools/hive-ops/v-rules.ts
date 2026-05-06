// V-rules adapter — runs the hive-finalize manifest schema validator
// against an engine's ENGINE_GRAMMAR.md and converts its RuleResult
// shape into hive-ops's RuleResult shape, normalizing rule IDs from
// V1..V29 to V01..V29 along the way.
//
// hive-finalize lives at ../hive-finalize/ as a sibling tool. We
// import its parser + validator directly via relative path. The
// `gray-matter` and `semver` deps that hive-finalize uses resolve
// from hive-finalize's own node_modules tree (Node walks up from the
// file's location), so hive-ops doesn't need to install them itself.

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  parseManifestFile,
  validateManifest,
} from "../hive-finalize/validate.js";
import type { RuleResult as HFRuleResult } from "../hive-finalize/types.js";
import type { RuleResult } from "./types.js";

/** Normalize hive-finalize's V1..V29 IDs to zero-padded V01..V29. The
 *  override schema accepts only the padded form, and the reporter
 *  renders the padded form, so doing the conversion here keeps both
 *  consumers consistent. */
function normalizeRuleId(id: string): string {
  const m = id.match(/^V(\d+)$/);
  if (!m) return id;
  return `V${m[1].padStart(2, "0")}`;
}

/** Map a hive-finalize status to hive-ops's. hive-finalize uses
 *  pass/fail/skip; hive-ops uses pass/fail/skip plus warn/override
 *  (the latter two are applied by the runner via the override schema,
 *  not by the underlying validator). */
function mapStatus(s: HFRuleResult["status"]): RuleResult["status"] {
  return s; // identical 1-to-1 for the three values hive-finalize returns
}

export interface VRuleRunResult {
  /** True iff ENGINE_GRAMMAR.md exists and has YAML frontmatter. False
   *  means V-rules were skipped (the H19 rule already flags missing
   *  frontmatter on the H side). */
  ran: boolean;
  /** Rule results in hive-ops shape. Empty array when ran=false. */
  results: RuleResult[];
}

/** Run the V-rules against an engine root. Returns an empty result set
 *  when the manifest is missing or has no frontmatter. */
export async function runVRules(engineRoot: string): Promise<VRuleRunResult> {
  const path = join(engineRoot, "ENGINE_GRAMMAR.md");
  if (!existsSync(path)) {
    return { ran: false, results: [] };
  }

  let parsed: ReturnType<typeof parseManifestFile>;
  try {
    parsed = parseManifestFile(path);
  } catch {
    // Read or parse failure → don't crash the audit. The H-side will
    // surface the missing/broken grammar via H19; V-side just stays
    // empty.
    return { ran: false, results: [] };
  }

  if (!parsed.hasFrontmatter) {
    return { ran: false, results: [] };
  }

  const hfResults = validateManifest(parsed.manifest, parsed.body);

  const results: RuleResult[] = hfResults.map((r) => ({
    id: normalizeRuleId(r.rule),
    title: r.title,
    category: "MANIFEST_SCHEMA",
    severity: "MANDATORY",
    status: mapStatus(r.status),
    message: r.message,
    overrideApplied: false,
  }));

  return { ran: true, results };
}

/** All V-rule IDs in normalized form (V01..V29). Used by the override
 *  parser to validate that override entries reference real rules. */
export const V_RULE_IDS: ReadonlySet<string> = new Set(
  Array.from({ length: 29 }, (_, i) => `V${String(i + 1).padStart(2, "0")}`),
);
