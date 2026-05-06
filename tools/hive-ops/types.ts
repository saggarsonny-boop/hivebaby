// HiveOps types — engine launch checklist enforcer.
//
// One Rule = one programmatically-enforceable item from the canonical
// docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md. Rules are MANDATORY by
// default; the override file at apps/<engine>/ENGINE_GRAMMAR.md can
// downgrade specific rules to warn-mode (with a hard expiry) or waive
// them entirely (requires GitHub issue + reviewer + date).
//
// Result statuses:
//   pass — rule passed
//   warn — rule failed but is in warn-mode (override schema), still allowed to ship
//   fail — rule failed; blocks the engine from being marked LIVE
//   skip — rule does not apply (e.g. service worker check on a static engine)
//   override — rule is permanently waived via the override schema
//
// Verdict aggregation:
//   any rule = fail   → engine verdict = fail
//   no fails, ≥1 warn → engine verdict = warn
//   else              → engine verdict = pass

export type Severity = "MANDATORY" | "RECOMMENDED";
export type RuleStatus = "pass" | "warn" | "fail" | "skip" | "override";

export interface RuleContext {
  /** Path to the engine root, e.g. /repo/apps/parkback. */
  engineRoot: string;
  /** Engine slug derived from the directory name, lowercase, hyphen-free. */
  engineSlug: string;
  /** Optional: parsed override file (ENGINE_GRAMMAR.md ## Hive-Ops Overrides block). */
  overrides: ParsedOverrides;
  /** Date the run is being executed (mockable for tests). */
  now: Date;
}

export interface RuleResult {
  /** Rule ID, e.g. "H01". Stable across time — never renumber. */
  id: string;
  /** One-line title from the canonical checklist. */
  title: string;
  /** Section the rule comes from (e.g. "HIVE_INTEGRATION"). */
  category: string;
  severity: Severity;
  status: RuleStatus;
  /** Human-readable evidence (what the check looked at + what it found). */
  message: string;
  /** True when status is `warn` or `override` because of an override entry. */
  overrideApplied: boolean;
  /** When status is `warn`, the date this warn-mode lapses to fail. */
  warnUntil?: string;
}

export interface RuleDefinition {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  /** When true, the rule may not appear in the override schema (always enforced). */
  unwaivable?: boolean;
  /** Implementation. Returns an unscoped result; the runner applies overrides. */
  check(ctx: RuleContext): Promise<Omit<RuleResult, "id" | "title" | "category" | "severity" | "overrideApplied" | "warnUntil">>;
}

// ---------------------------------------------------------------------------
// Override schema (ENGINE_GRAMMAR.md ## Hive-Ops Overrides)
// ---------------------------------------------------------------------------

export interface OverrideEntry {
  /** Rule ID, e.g. "H17". */
  rule: string;
  /** "warn" → degrade fail to warn until warn_until.
   *  "waive" → permanent override; rule is reported as `override` regardless. */
  mode: "warn" | "waive";
  /** Why. Free-text. Required. */
  reason: string;
  /** GitHub issue tracking the eventual fix. Required for both modes. */
  issue: string;
  /** Reviewer's name. Required. */
  reviewer: string;
  /** YYYY-MM-DD when the override was added. */
  date: string;
  /** Required when mode=warn. Hard expiry; after this date the rule re-fires.
   *  Default 7 days from date; max 30 days from date (validated by the loader). */
  warn_until?: string;
}

export interface ParsedOverrides {
  /** Map from rule ID → entry. */
  byRule: Map<string, OverrideEntry>;
  /** Errors encountered while parsing the override file (malformed YAML,
   *  unknown rule IDs, missing fields, expired warns past 30-day max). */
  parseErrors: string[];
}

export type Verdict = "pass" | "warn" | "fail";

export interface EngineReport {
  engineSlug: string;
  engineRoot: string;
  rules: RuleResult[];
  verdict: Verdict;
  overrideParseErrors: string[];
  /** Rules currently in warn-mode (status==='warn') with their expiry dates. */
  warnModeRules: Array<{ id: string; warnUntil: string }>;
}
