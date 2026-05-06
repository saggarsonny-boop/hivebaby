// HiveOps smoke tests — exercise the rule loader, override parser, and the
// runner end-to-end against synthetic engine roots in /tmp.
//
// Run via: tsx tools/hive-ops/tests/rules.test.ts

import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runHiveOps } from "../runner.js";
import { RULES, RULE_IDS } from "../rules.js";
import { loadOverrides } from "../overrides.js";

let failures = 0;
function check(label: string, cond: boolean, detail?: string): void {
  if (!cond) {
    failures += 1;
    console.error(`FAIL: ${label}` + (detail ? ` — ${detail}` : ""));
  } else {
    console.log(`ok: ${label}`);
  }
}

// Set up an empty engine root and assert the runner produces a fail
// verdict with most rules failing.
async function testEmptyEngineFails() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-empty-"));
  mkdirSync(join(root, "apps"), { recursive: true });
  mkdirSync(join(root, "apps", "noop"));

  const report = await runHiveOps(join(root, "apps", "noop"));
  check("empty engine → verdict=fail", report.verdict === "fail");
  check("empty engine → all rules ran (28)", report.rules.length === 28,
    `got ${report.rules.length} rules`);
  const failCount = report.rules.filter((r) => r.status === "fail").length;
  check("empty engine → ≥20 rules fail", failCount >= 20, `failCount=${failCount}`);
}

// Override parser: malformed YAML reports an error.
function testOverrideMalformedYaml() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-bad-yaml-"));
  writeFileSync(
    join(root, "ENGINE_GRAMMAR.md"),
    "## Hive-Ops Overrides\n\n```yaml\nthis is not: [valid: yaml\n```\n",
  );
  const o = loadOverrides(root, RULE_IDS);
  check("malformed YAML reported as parse error", o.parseErrors.length > 0,
    `errors=${JSON.stringify(o.parseErrors)}`);
  check("malformed YAML produces no entries", o.byRule.size === 0);
}

// Override parser: complete valid override accepted.
function testOverrideValid() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-valid-"));
  writeFileSync(
    join(root, "ENGINE_GRAMMAR.md"),
    [
      "## Hive-Ops Overrides",
      "",
      "```yaml",
      "overrides:",
      "  - rule: H08",
      "    mode: warn",
      "    reason: \"OG image generator broken — workflow X tracks fix\"",
      "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/123",
      "    reviewer: Sonny",
      "    date: 2026-05-06",
      "    warn_until: 2026-05-13",
      "```",
      "",
    ].join("\n"),
  );
  const o = loadOverrides(root, RULE_IDS);
  check("valid override → no parse errors", o.parseErrors.length === 0,
    `errors=${JSON.stringify(o.parseErrors)}`);
  check("valid override → entry registered", o.byRule.has("H08"));
}

// Override parser: warn_until > 30 days from date is rejected.
function testOverrideWarnTooLong() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-toolong-"));
  writeFileSync(
    join(root, "ENGINE_GRAMMAR.md"),
    [
      "## Hive-Ops Overrides",
      "",
      "```yaml",
      "overrides:",
      "  - rule: H08",
      "    mode: warn",
      "    reason: too long",
      "    issue: https://github.com/x/y/issues/1",
      "    reviewer: nope",
      "    date: 2026-01-01",
      "    warn_until: 2026-12-31", // ~365 days
      "```",
      "",
    ].join("\n"),
  );
  const o = loadOverrides(root, RULE_IDS);
  check("warn_until > 30d → parse error",
    o.parseErrors.some((e) => e.includes("more than 30")),
    `errors=${JSON.stringify(o.parseErrors)}`);
}

// Override parser: unknown rule ID rejected.
function testOverrideUnknownRule() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-unknown-"));
  writeFileSync(
    join(root, "ENGINE_GRAMMAR.md"),
    [
      "## Hive-Ops Overrides",
      "",
      "```yaml",
      "overrides:",
      "  - rule: H99",
      "    mode: waive",
      "    reason: who knows",
      "    issue: https://github.com/x/y/issues/1",
      "    reviewer: nope",
      "    date: 2026-01-01",
      "```",
      "",
    ].join("\n"),
  );
  const o = loadOverrides(root, RULE_IDS);
  check("unknown rule ID → parse error",
    o.parseErrors.some((e) => e.includes("not a known")),
    `errors=${JSON.stringify(o.parseErrors)}`);
}

// MANDATORY/RECOMMENDED counts match user spec (28 total, 26 MANDATORY,
// 2 RECOMMENDED). If you change the rules table, update this assertion to
// match the new shape.
function testRuleTableShape() {
  check("RULES table has 28 entries", RULES.length === 28, `got ${RULES.length}`);
  const m = RULES.filter((r) => r.severity === "MANDATORY").length;
  const rec = RULES.filter((r) => r.severity === "RECOMMENDED").length;
  check("28 = MANDATORY + RECOMMENDED", m + rec === 28, `MANDATORY=${m} RECOMMENDED=${rec}`);
  check("rule IDs all match /^H\\d{2}$/", RULES.every((r) => /^H\d{2}$/.test(r.id)));
  check("rule IDs unique", new Set(RULES.map((r) => r.id)).size === RULES.length);
}

// V-rule integration tests (v0.2). Verify the runner ingests
// hive-finalize results and the override schema accepts V-rule IDs.

async function testVRulesSkippedWhenNoGrammar() {
  // Re-uses the empty engine setup from testEmptyEngineFails; that
  // engine has no ENGINE_GRAMMAR.md, so vRulesRan should be false.
  const root = mkdtempSync(join(tmpdir(), "hive-ops-no-grammar-"));
  mkdirSync(join(root, "apps"), { recursive: true });
  mkdirSync(join(root, "apps", "stub"));
  const report = await runHiveOps(join(root, "apps", "stub"));
  check("no ENGINE_GRAMMAR.md → vRulesRan=false", report.vRulesRan === false);
  check("no V-rules added when manifest missing",
    report.rules.every((r) => !/^V\d{2}$/.test(r.id)));
}

async function testVRulesRunWhenGrammarPresent() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-with-grammar-"));
  // Minimal canonical-frontmatter manifest exercising several V-rules.
  writeFileSync(
    join(root, "ENGINE_GRAMMAR.md"),
    [
      "---",
      "engine: HiveTestEngine",
      "id: hivetestengine",
      "domain: hivetestengine.hive.baby",
      "repo: saggarsonny-boop/hivebaby:apps/test",
      "owner: saggarsonny-boop",
      "version: 0.1.0",
      "status: building",
      "tier: 3",
      "schema: test-schema",
      "stack: [nextjs]",
      "premium: false",
      "governance: QueenBee.MasterGrappler@pending",
      "safety: enabled",
      "multilingual: pending",
      "deployment_protection: off",
      "visibility: public",
      "commercial_surface: none",
      "viral_loop_targets: []",
      "production_state: not_listed",
      "last_audit_at: 2026-05-06",
      "onboarding_stack:",
      "  auto_demo: implemented",
      "  first_visit_card: implemented",
      "  tooltip_tour: implemented",
      "  rotating_placeholders: implemented",
      "---",
      "",
      "# Test engine",
      "",
      "## Purpose",
      "Smoke-test engine for hive-ops V-rule integration.",
      "",
      "## Inputs",
      "- none",
      "",
      "## Outputs",
      "- none",
      "",
    ].join("\n"),
  );
  const report = await runHiveOps(root);
  check("ENGINE_GRAMMAR.md present → vRulesRan=true", report.vRulesRan === true);
  const vResults = report.rules.filter((r) => /^V\d{2}$/.test(r.id));
  check("29 V-rules ingested", vResults.length === 29, `got ${vResults.length}`);
  check("V-rule IDs zero-padded (V01..V29)",
    vResults.every((r) => /^V\d{2}$/.test(r.id)));
  check("V01 (engine name regex) passes for HiveTestEngine",
    vResults.find((r) => r.id === "V01")?.status === "pass");
}

async function testVRuleOverrideAccepted() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-vrule-override-"));
  // Manifest that intentionally fails V01 (engine name doesn't match pattern)
  // plus an override entry waiving V01.
  writeFileSync(
    join(root, "ENGINE_GRAMMAR.md"),
    [
      "---",
      "engine: ParkBack",            // doesn't match /^(Hive|UD).../
      "id: parkback",
      "domain: parkback.hive.baby",
      "repo: saggarsonny-boop/hivebaby:apps/parkback",
      "owner: saggarsonny-boop",
      "version: 0.1.0",
      "status: building",
      "tier: 1",
      "schema: parking-spot-pin",
      "stack: [nextjs, typescript]",
      "premium: false",
      "governance: QueenBee.MasterGrappler@pending",
      "safety: enabled",
      "multilingual: enabled",
      "deployment_protection: off",
      "visibility: public",
      "commercial_surface: none",
      "viral_loop_targets: []",
      "production_state: listed",
      "last_audit_at: 2026-05-06",
      "onboarding_stack:",
      "  auto_demo: n/a",
      "  first_visit_card: implemented",
      "  tooltip_tour: implemented",
      "  rotating_placeholders: n/a",
      "---",
      "",
      "# ParkBack",
      "",
      "## Purpose",
      "Test fixture exercising V-rule overrides.",
      "",
      "## Inputs",
      "- none",
      "",
      "## Outputs",
      "- none",
      "",
      "## Hive-Ops Overrides",
      "",
      "```yaml",
      "overrides:",
      "  - rule: V01",
      "    mode: waive",
      "    reason: \"ParkBack is an established brand name pre-naming-standard.\"",
      "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/100",
      "    reviewer: Sonny",
      "    date: 2026-05-06",
      "```",
      "",
    ].join("\n"),
  );
  const report = await runHiveOps(root);
  check("V-rule override loader accepts V01 ID — no parse errors",
    report.overrideParseErrors.length === 0,
    `errors=${JSON.stringify(report.overrideParseErrors)}`);
  const v01 = report.rules.find((r) => r.id === "V01");
  check("V01 status downgraded from fail to override",
    v01?.status === "override" && v01.overrideApplied === true,
    `V01=${JSON.stringify(v01)}`);
}

async function main() {
  testRuleTableShape();
  testOverrideMalformedYaml();
  testOverrideValid();
  testOverrideWarnTooLong();
  testOverrideUnknownRule();
  await testEmptyEngineFails();
  await testVRulesSkippedWhenNoGrammar();
  await testVRulesRunWhenGrammarPresent();
  await testVRuleOverrideAccepted();

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
  }
  console.log("\nall tests passed");
}

main().catch((err) => {
  console.error("test runner crashed:", err);
  process.exit(1);
});
