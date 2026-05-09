// HiveOps GOVERNANCE rule category — enforces Queen Bee consumption.
//
// Five G-rules (G01..G05) detect whether an engine actually inherits from
// Queen Bee or has rolled its own safety / schema / language / audit
// machinery. Together they map the migration surface from "engines exist"
// to "engines inherit governance from QB".
//
// ─── WARN-only mode ─────────────────────────────────────────────────────
// As of 2026-05-08, no Hive engine consumes /api/govern in production
// (Constitution §VII honest-gap report). Migrating 24+ engines is a
// multi-week campaign; running G-rules at FAIL severity now would block
// every engine's HiveOps audit on day one.
//
// So: until GOVERNANCE_FAIL_BLOCKING flips to true, every G-rule that
// would normally return `fail` returns `warn` instead. Rules that PASS
// or are N/A are unaffected.
//
// **Lift criterion**: when ≥80% of audited engines (by count, not by
// traffic) PASS at least 4 of 5 G-rules, flip GOVERNANCE_FAIL_BLOCKING
// to true. The 4-of-5 threshold is deliberate — it gives migrating
// engines runway to land G02 (the govern() call) and G05 (DB stamp
// persistence) in a separate PR from the package install + registration
// + grammar update, without going red between PRs.
//
// The flip is one line in this file. Update Constitution §V at the same
// time so the lift is recorded in the canonical changelog.

import type { RuleDefinition } from "../../types.js";
import { G01_packageDep } from "./g01-package-dep.js";
import { G02_governCall } from "./g02-govern-call.js";
import { G03_registryEntry } from "./g03-registry-entry.js";
import { G04_grammarSchemas } from "./g04-grammar-schemas.js";
import { G05_stampPersistence } from "./g05-stamp-persistence.js";

/** When false, every G-rule's `fail` is reported as `warn`. The runner
 *  invokes `softenIfWarnOnly()` after each G-rule returns its raw status,
 *  so this flag is the single source of truth for the warn-only window. */
export const GOVERNANCE_FAIL_BLOCKING = false;

export const GOVERNANCE_RULES: ReadonlyArray<RuleDefinition> = [
  G01_packageDep,
  G02_governCall,
  G03_registryEntry,
  G04_grammarSchemas,
  G05_stampPersistence,
];

export const G_RULE_IDS: ReadonlySet<string> = new Set(
  GOVERNANCE_RULES.map((r) => r.id),
);

/** Apply the WARN-only window. When GOVERNANCE_FAIL_BLOCKING is false,
 *  any G-rule returning `fail` is downgraded to `warn` with a leading
 *  "[GOVERNANCE WARN-only]" tag in the message so engines see why the
 *  rule isn't blocking. PASS / SKIP / N/A are unaffected.
 *
 *  Pure: same input → same output. The runner calls this between the
 *  rule's `check()` returning and the `applyOverride()` step, so a
 *  per-engine override (warn-mode or waive) still applies on top of
 *  whatever this softener produces. */
export function softenIfWarnOnly(
  rawStatus: "pass" | "warn" | "fail" | "skip" | "n/a" | "override",
  rawMessage: string,
): { status: "pass" | "warn" | "fail" | "skip" | "n/a" | "override"; message: string } {
  if (GOVERNANCE_FAIL_BLOCKING) return { status: rawStatus, message: rawMessage };
  if (rawStatus !== "fail") return { status: rawStatus, message: rawMessage };
  return {
    status: "warn",
    message: `[GOVERNANCE WARN-only — won't block until lift] ${rawMessage}`,
  };
}
