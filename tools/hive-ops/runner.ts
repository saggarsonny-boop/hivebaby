// HiveOps runner — applies rule definitions + override schema to produce
// an EngineReport. Pure: same inputs → same outputs.

import { join, basename } from "node:path";
import { existsSync } from "node:fs";
import type { EngineReport, RuleResult, Verdict } from "./types.js";
import { RULES, RULE_IDS } from "./rules.js";
import { loadOverrides } from "./overrides.js";

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
}

export async function runHiveOps(engineRoot: string, opts: RunOptions = {}): Promise<EngineReport> {
  const now = opts.now ?? new Date();
  const engineSlug = basename(engineRoot);
  const overrides = loadOverrides(engineRoot, RULE_IDS);

  const results: RuleResult[] = [];
  const warnModeRules: Array<{ id: string; warnUntil: string }> = [];

  for (const rule of RULES) {
    const raw = await rule.check({ engineRoot, engineSlug, overrides, now });
    const ov = overrides.byRule.get(rule.id);

    let result: RuleResult = {
      id: rule.id,
      title: rule.title,
      category: rule.category,
      severity: rule.severity,
      status: raw.status,
      message: raw.message,
      overrideApplied: false,
    };

    if (ov) {
      // Unwaivable rules ignore the override (and the override is reported
      // as a parse error so the violator notices).
      if (rule.unwaivable) {
        overrides.parseErrors.push(`overrides[${rule.id}]: rule ${rule.id} is unwaivable; override ignored`);
      } else if (ov.mode === "waive") {
        result = { ...result, status: "override", overrideApplied: true,
          message: `WAIVED — ${ov.reason} (${ov.issue}, ${ov.reviewer}, ${ov.date}). Originally: ${raw.message}` };
      } else if (ov.mode === "warn") {
        const warnExpired = ov.warn_until !== undefined && Date.parse(ov.warn_until) < now.getTime();
        if (warnExpired) {
          // Expired warn → falls through to whatever the rule produced; if
          // that's `fail`, surfaces in the report along with an explanatory
          // note so the team knows the warn expired.
          result = { ...result,
            message: `${raw.message} — warn-mode override EXPIRED (${ov.warn_until}); ${ov.issue} must be resolved` };
        } else if (raw.status === "fail") {
          result = { ...result, status: "warn", overrideApplied: true,
            warnUntil: ov.warn_until,
            message: `WARN until ${ov.warn_until} — ${ov.reason} (${ov.issue}). Originally: ${raw.message}` };
          warnModeRules.push({ id: rule.id, warnUntil: ov.warn_until ?? "" });
        }
        // pass / skip / override: warn-mode override has no effect
      }
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
  };
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
