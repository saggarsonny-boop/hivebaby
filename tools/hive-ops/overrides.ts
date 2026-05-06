// HiveOps override loader. Reads the optional ## Hive-Ops Overrides
// section from apps/<engine>/ENGINE_GRAMMAR.md and validates each entry
// against the override schema.
//
// Override file shape (YAML inside the markdown body):
//
//   ## Hive-Ops Overrides
//
//   ```yaml
//   overrides:
//     - rule: H17
//       mode: warn
//       reason: "Engine intentionally has a one-word title."
//       issue: https://github.com/saggarsonny-boop/hivebaby/issues/123
//       reviewer: Sonny
//       date: 2026-05-06
//       warn_until: 2026-05-13
//     - rule: H08
//       mode: waive
//       reason: "Static engine, no OG image needed."
//       issue: https://github.com/saggarsonny-boop/hivebaby/issues/124
//       reviewer: Sonny
//       date: 2026-05-06
//   ```
//
// Validation:
//   - rule, mode, reason, issue, reviewer, date are all REQUIRED
//   - mode must be "warn" or "waive"
//   - date must be ISO YYYY-MM-DD
//   - if mode=warn, warn_until is required AND must be within 30 days of date
//   - issue must be a GitHub issue URL
//   - rule must be a known H-rule ID

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import type { OverrideEntry, ParsedOverrides } from "./types.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const GH_ISSUE = /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+$/;
// Both H-rules (filesystem checks) and V-rules (manifest schema, supplied
// by hive-finalize) use the same override schema and ID format.
const RULE_ID = /^[HV]\d{2}$/;
const MAX_WARN_DAYS = 30;
const DEFAULT_WARN_DAYS = 7;

export function loadOverrides(engineRoot: string, validRuleIds: ReadonlySet<string>): ParsedOverrides {
  const path = join(engineRoot, "ENGINE_GRAMMAR.md");
  if (!existsSync(path)) {
    return { byRule: new Map(), parseErrors: [] };
  }

  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (err) {
    return {
      byRule: new Map(),
      parseErrors: [`could not read ${path}: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  const parsed = matter(raw);
  const body = parsed.content;
  const block = extractOverridesYaml(body);
  if (!block) return { byRule: new Map(), parseErrors: [] };

  let yaml: unknown;
  try {
    yaml = YAML.parse(block);
  } catch (err) {
    return {
      byRule: new Map(),
      parseErrors: [`malformed YAML in ## Hive-Ops Overrides: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  const errors: string[] = [];
  const byRule = new Map<string, OverrideEntry>();

  if (!yaml || typeof yaml !== "object") {
    return { byRule, parseErrors: ["## Hive-Ops Overrides YAML did not parse as an object"] };
  }
  const root = yaml as { overrides?: unknown };
  if (!Array.isArray(root.overrides)) {
    return { byRule, parseErrors: ["## Hive-Ops Overrides YAML missing top-level `overrides:` list"] };
  }

  for (const [i, item] of root.overrides.entries()) {
    if (!item || typeof item !== "object") {
      errors.push(`overrides[${i}]: not an object`);
      continue;
    }
    const e = item as Partial<OverrideEntry>;
    if (typeof e.rule !== "string" || !RULE_ID.test(e.rule)) {
      errors.push(`overrides[${i}]: rule must match /^H\\d{2}$/ (got ${JSON.stringify(e.rule)})`);
      continue;
    }
    if (!validRuleIds.has(e.rule)) {
      errors.push(`overrides[${i}]: rule ${e.rule} is not a known HiveOps rule ID`);
      continue;
    }
    if (e.mode !== "warn" && e.mode !== "waive") {
      errors.push(`overrides[${i}.${e.rule}]: mode must be "warn" or "waive" (got ${JSON.stringify(e.mode)})`);
      continue;
    }
    if (typeof e.reason !== "string" || !e.reason.trim()) {
      errors.push(`overrides[${i}.${e.rule}]: reason is required and must be non-empty`);
      continue;
    }
    if (typeof e.issue !== "string" || !GH_ISSUE.test(e.issue)) {
      errors.push(`overrides[${i}.${e.rule}]: issue must be a GitHub issue URL (got ${JSON.stringify(e.issue)})`);
      continue;
    }
    if (typeof e.reviewer !== "string" || !e.reviewer.trim()) {
      errors.push(`overrides[${i}.${e.rule}]: reviewer is required and must be non-empty`);
      continue;
    }
    if (typeof e.date !== "string" || !ISO_DATE.test(e.date)) {
      errors.push(`overrides[${i}.${e.rule}]: date must be YYYY-MM-DD (got ${JSON.stringify(e.date)})`);
      continue;
    }

    let warn_until: string | undefined = e.warn_until;
    if (e.mode === "warn") {
      if (warn_until === undefined) {
        // Default 7 days from `date` if unspecified.
        warn_until = isoAddDays(e.date, DEFAULT_WARN_DAYS);
      }
      if (typeof warn_until !== "string" || !ISO_DATE.test(warn_until)) {
        errors.push(`overrides[${i}.${e.rule}]: warn_until must be YYYY-MM-DD (got ${JSON.stringify(warn_until)})`);
        continue;
      }
      const dateMs = Date.parse(e.date);
      const warnMs = Date.parse(warn_until);
      if (Number.isNaN(dateMs) || Number.isNaN(warnMs)) {
        errors.push(`overrides[${i}.${e.rule}]: invalid date or warn_until value`);
        continue;
      }
      const diffDays = (warnMs - dateMs) / (1000 * 60 * 60 * 24);
      if (diffDays < 0) {
        errors.push(`overrides[${i}.${e.rule}]: warn_until is before date`);
        continue;
      }
      if (diffDays > MAX_WARN_DAYS) {
        errors.push(
          `overrides[${i}.${e.rule}]: warn_until ${warn_until} is more than ${MAX_WARN_DAYS} days after date ${e.date} (diff=${diffDays.toFixed(0)}d)`,
        );
        continue;
      }
    } else if (e.mode === "waive" && warn_until !== undefined) {
      // waive mode does not use warn_until — flag but don't reject.
      errors.push(`overrides[${i}.${e.rule}]: warn_until ignored for mode=waive`);
      warn_until = undefined;
    }

    if (byRule.has(e.rule)) {
      errors.push(`overrides[${i}.${e.rule}]: duplicate override entry for rule ${e.rule}`);
      continue;
    }

    byRule.set(e.rule, {
      rule: e.rule,
      mode: e.mode,
      reason: e.reason,
      issue: e.issue,
      reviewer: e.reviewer,
      date: e.date,
      warn_until,
    });
  }

  return { byRule, parseErrors: errors };
}

/** Find the YAML fenced block immediately under ## Hive-Ops Overrides
 *  (case-insensitive). Returns the raw YAML string or null. */
function extractOverridesYaml(body: string): string | null {
  const re = /^##\s+Hive-Ops Overrides\s*\n+\s*```ya?ml\s*\n([\s\S]*?)\n```/im;
  const m = body.match(re);
  return m ? m[1] : null;
}

function isoAddDays(iso: string, days: number): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  const next = new Date(ms + days * 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 10);
}
