// HiveOps types — engine launch checklist enforcer.
//
// Two rule families are surfaced in a single combined report:
//
//   H-rules (H01..H28): filesystem + parse checks against the canonical
//     docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md. Implemented locally
//     in tools/hive-ops/rules.ts.
//
//   V-rules (V01..V29): manifest schema validation against the canonical
//     docs/specs/manifest-schema-final.md. Implemented in
//     tools/hive-finalize/validate.ts and re-exposed here under
//     normalized V01-V29 IDs (hive-finalize ships them as V1-V29; the
//     runner normalizes when ingesting so override files use V01..V29
//     consistently).
//
// Both rule families share the same override schema (## Hive-Ops
// Overrides YAML in ENGINE_GRAMMAR.md). Engines may override either H
// or V rules with the same shape.
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
export type RuleStatus = "pass" | "warn" | "fail" | "skip" | "override" | "n/a";

/** Engine implementation class. Determines which rules apply.
 *
 *   nextjs        — Next.js app router engine (the canonical Hive default).
 *                   Subject to all H + V rules.
 *   static-html   — Plain HTML/JS engine (e.g. the hivebaby planet front
 *                   door). Skips Next.js-specific rules (app router layout,
 *                   metadata exports, viewport export, manifest registration
 *                   in layout) but still subject to favicon + manifest.json
 *                   + service worker rules.
 *   api-only      — Backend-only engine with no public UI. Skips visual
 *                   surface rules (favicon, og.png, install hint, viewport,
 *                   appleWebApp, theme color) and any rule that examines
 *                   client-side onboarding code.
 *   hybrid        — Mixed (e.g. Next.js engine that also exposes an API).
 *                   Subject to all rules (no exemptions).
 */
export type EngineClass = "nextjs" | "static-html" | "api-only" | "hybrid";

/** Default class when ENGINE_GRAMMAR.md does not declare an `engine_class`
 *  frontmatter field. Most Hive engines are Next.js, so this is the safe
 *  default — older engines that haven't migrated to declaring engine_class
 *  see no behavior change. */
export const DEFAULT_ENGINE_CLASS: EngineClass = "nextjs";

export const ALL_ENGINE_CLASSES: ReadonlyArray<EngineClass> = [
  "nextjs",
  "static-html",
  "api-only",
  "hybrid",
];

export interface RuleContext {
  /** Path to the engine root, e.g. /repo/apps/parkback. */
  engineRoot: string;
  /** Engine slug derived from the directory name, lowercase, hyphen-free. */
  engineSlug: string;
  /** Optional: parsed override file (ENGINE_GRAMMAR.md ## Hive-Ops Overrides block). */
  overrides: ParsedOverrides;
  /** Date the run is being executed (mockable for tests). */
  now: Date;
  /** Engine implementation class (from ENGINE_GRAMMAR.md frontmatter, or
   *  `nextjs` if not declared). The runner uses this with the
   *  applicability matrix to skip non-applicable rules with status `n/a`. */
  engineClass: EngineClass;
}

export interface RuleResult {
  /** Rule ID, e.g. "H01" or "V07". Stable across time — never renumber. */
  id: string;
  /** One-line title from the canonical checklist or schema. */
  title: string;
  /** Section the rule comes from (e.g. "HIVE_INTEGRATION", "MANIFEST_SCHEMA"). */
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

/** Rule family. H-rules are filesystem checks; V-rules are manifest schema
 *  validation supplied by hive-finalize. Used by the reporter to group
 *  output and by metrics consumers to attribute coverage. */
export type RuleFamily = "H" | "V";

/** Determine which family a rule ID belongs to. Throws on malformed input. */
export function ruleFamily(id: string): RuleFamily {
  if (/^H\d{2}$/.test(id)) return "H";
  if (/^V\d{2}$/.test(id)) return "V";
  throw new Error(`Invalid rule ID format: ${id}`);
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
  /** True when V-rules ran (engine has ENGINE_GRAMMAR.md with frontmatter).
   *  False when V-rules were skipped because the manifest is missing or has
   *  no frontmatter — surfaces explicitly in the reporter so the user knows
   *  the schema half of the audit was not exercised. */
  vRulesRan: boolean;
  /** Engine class actually used for this run (from frontmatter or default). */
  engineClass: EngineClass;
}
