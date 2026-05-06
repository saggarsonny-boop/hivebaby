// HiveOps runner — applies rule definitions + override schema + engine-
// class applicability to produce an EngineReport. Pure: same inputs →
// same outputs.
//
// As of v0.2 the runner produces a *combined* report covering both H-rules
// (filesystem, defined locally) and V-rules (manifest schema, supplied by
// hive-finalize). The override schema is shared — engines may waive or
// warn either family with the same shape.
//
// Engine-class profiles (v0.2): rules that don't apply to the declared
// engine_class are reported with status `n/a` instead of being run.
// engine_class is read from the manifest frontmatter (or defaults to
// `nextjs` if not declared). The applicability matrix lives in
// applicability.ts; only H-rules are subject to it (V-rules are
// universally applicable).

import { join, basename } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { ALL_ENGINE_CLASSES, DEFAULT_ENGINE_CLASS } from "./types.js";
import type { EngineClass, EngineReport, RuleResult, Verdict } from "./types.js";
import { RULES, RULE_IDS as H_RULE_IDS } from "./rules.js";
import { runVRules, V_RULE_IDS } from "./v-rules.js";
import { loadOverrides } from "./overrides.js";
import { ruleApplies, inapplicableReason } from "./applicability.js";

/** Resolve an engine slug to its on-disk root. Search order:
 *  1. <repoRoot>/apps/<slug>
 *  2. <repoRoot>/<slug>            (standalone repos cloned alongside)
 *  Returns null if neither resolves. */
export function resolveEngineRoot(repoRoot: string, slug: string): string | null {
  const inApps = join(repoRoot, "apps", slug);
  if (existsSync(inApps)) return inApps;
  const standalone = join(repoRoot, slug);
  if (existsSync(standalone)) return standalone;
  return null;
}

export interface RunOptions {
  /** Mockable date for deterministic warn-mode tests. Defaults to new Date(). */
  now?: Date;
  /** Override the engine class detection. Mostly for tests; production runs
   *  read engine_class from ENGINE_GRAMMAR.md frontmatter. */
  engineClassOverride?: EngineClass;
}

/** Combined H + V rule IDs, used by the override parser to validate that
 *  every entry references a real rule. */
const ALL_RULE_IDS: ReadonlySet<string> = new Set([
  ...H_RULE_IDS,
  ...V_RULE_IDS,
]);

export async function runHiveOps(engineRoot: string, opts: RunOptions = {}): Promise<EngineReport> {
  const now = opts.now ?? new Date();
  const engineSlug = basename(engineRoot);
  const overrides = loadOverrides(engineRoot, ALL_RULE_IDS);
  const engineClass = opts.engineClassOverride ?? readEngineClass(engineRoot);

  const results: RuleResult[] = [];
  const warnModeRules: Array<{ id: string; warnUntil: string }> = [];

  // ─── H-rules ─────────────────────────────────────────────────────────
  for (const rule of RULES) {
    if (!ruleApplies(rule.id, engineClass)) {
      // Rule doesn't apply to this engine class — skip with `n/a`. The
      // override schema for this rule is ignored (no point waiving a
      // rule that never ran).
      results.push({
        id: rule.id,
        title: rule.title,
        category: rule.category,
        severity: rule.severity,
        status: "n/a",
        message: inapplicableReason(rule.id, engineClass),
        overrideApplied: false,
      });
      continue;
    }
    const raw = await rule.check({ engineRoot, engineSlug, overrides, now, engineClass });
    const result = applyOverride(
      {
        id: rule.id,
        title: rule.title,
        category: rule.category,
        severity: rule.severity,
        status: raw.status,
        message: raw.message,
        overrideApplied: false,
      },
      raw.message,
      overrides,
      now,
      rule.unwaivable === true,
    );
    if (result.status === "warn" && result.warnUntil) {
      warnModeRules.push({ id: result.id, warnUntil: result.warnUntil });
    }
    results.push(result);
  }

  // ─── V-rules (manifest schema, supplied by hive-finalize) ───────────
  // V-rules apply to every engine class — every engine needs canonical
  // ENGINE_GRAMMAR.md frontmatter regardless of how it serves traffic.
  const vRules = await runVRules(engineRoot);
  for (const vr of vRules.results) {
    const result = applyOverride(vr, vr.message, overrides, now, false);
    if (result.status === "warn" && result.warnUntil) {
      warnModeRules.push({ id: result.id, warnUntil: result.warnUntil });
    }
    results.push(result);
  }

  return {
    engineSlug,
    engineRoot,
    rules: results,
    verdict: aggregateVerdict(results),
    overrideParseErrors: overrides.parseErrors,
    warnModeRules,
    vRulesRan: vRules.ran,
    engineClass,
  };
}

/** Read `engine_class` from the engine's ENGINE_GRAMMAR.md frontmatter.
 *  Returns the canonical default (`nextjs`) if the manifest is missing,
 *  has no frontmatter, declares no engine_class, or declares a value that
 *  isn't in the canonical set. The defaulting is silent — the user can
 *  always add `engine_class:` to their frontmatter to opt out. */
function readEngineClass(engineRoot: string): EngineClass {
  const path = join(engineRoot, "ENGINE_GRAMMAR.md");
  if (!existsSync(path)) return DEFAULT_ENGINE_CLASS;
  let raw: string;
  try { raw = readFileSync(path, "utf8"); } catch { return DEFAULT_ENGINE_CLASS; }

  // Lightweight frontmatter scrape — the runner doesn't depend on
  // gray-matter directly (kept that as a hive-finalize concern). The
  // engine_class field is a single-line top-level field in YAML, so a
  // simple regex against the frontmatter block is reliable and
  // dependency-free.
  const fm = raw.match(/^---\s*\n([\s\S]*?)\n---/m);
  if (!fm) return DEFAULT_ENGINE_CLASS;
  const m = fm[1].match(/^\s*engine_class\s*:\s*(\S+)\s*$/m);
  if (!m) return DEFAULT_ENGINE_CLASS;
  const declared = m[1].replace(/^["']|["']$/g, "");
  if ((ALL_ENGINE_CLASSES as ReadonlyArray<string>).includes(declared)) {
    return declared as EngineClass;
  }
  return DEFAULT_ENGINE_CLASS;
}

/** Apply override semantics to a raw rule result. Identical logic for H
 *  and V rules — if an override exists for the rule ID, downgrade the
 *  fail to warn (mode=warn, until expiry) or to override (mode=waive).
 *  Unwaivable rules ignore the override and append a parse error. */
function applyOverride(
  raw: RuleResult,
  rawMessage: string,
  overrides: ReturnType<typeof loadOverrides>,
  now: Date,
  unwaivable: boolean,
): RuleResult {
  const ov = overrides.byRule.get(raw.id);
  if (!ov) return raw;

  if (unwaivable) {
    overrides.parseErrors.push(`overrides[${raw.id}]: rule ${raw.id} is unwaivable; override ignored`);
    return raw;
  }

  if (ov.mode === "waive") {
    return {
      ...raw,
      status: "override",
      overrideApplied: true,
      message: `WAIVED — ${ov.reason} (${ov.issue}, ${ov.reviewer}, ${ov.date}). Originally: ${rawMessage}`,
    };
  }

  // mode === "warn"
  const warnExpired = ov.warn_until !== undefined && Date.parse(ov.warn_until) < now.getTime();
  if (warnExpired) {
    return {
      ...raw,
      message: `${rawMessage} — warn-mode override EXPIRED (${ov.warn_until}); ${ov.issue} must be resolved`,
    };
  }
  if (raw.status === "fail") {
    return {
      ...raw,
      status: "warn",
      overrideApplied: true,
      warnUntil: ov.warn_until,
      message: `WARN until ${ov.warn_until} — ${ov.reason} (${ov.issue}). Originally: ${rawMessage}`,
    };
  }
  // pass / skip / override / n/a: warn-mode override has no effect.
  return raw;
}

function aggregateVerdict(rules: RuleResult[]): Verdict {
  let hasFail = false;
  let hasWarn = false;
  for (const r of rules) {
    if (r.status === "fail") hasFail = true;
    else if (r.status === "warn") hasWarn = true;
  }
  if (hasFail) return "fail";
  if (hasWarn) return "warn";
  return "pass";
}
