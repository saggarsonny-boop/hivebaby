// HiveOps smoke tests — exercise the rule loader, override parser, and the
// runner end-to-end against synthetic engine roots in /tmp.
//
// Run via: tsx tools/hive-ops/tests/rules.test.ts

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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
  // 28 H-rules + 6 A-rules + 5 G-rules = 39 (V-rules skipped without
  // ENGINE_GRAMMAR.md). GOVERNANCE + ACCESSIBILITY rules are WARN-only
  // today, so the failure count expectation checks H-rule fails specifically.
  check("empty engine → all rules ran (39: 28 H + 6 A + 5 G; V skipped)",
    report.rules.length === 39,
    `got ${report.rules.length} rules`);
  const hFails = report.rules.filter((r) => /^H\d{2}$/.test(r.id) && r.status === "fail").length;
  check("empty engine → ≥20 H-rules fail", hFails >= 20, `H-fail count=${hFails}`);
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

// MANDATORY/RECOMMENDED counts match user spec (34 total, 26 MANDATORY,
// 8 RECOMMENDED — H-rules: 26 mandatory + 2 recommended; A-rules:
// 6 recommended, warn-only at intro). If you change the rules table,
// update this assertion to match the new shape.
function testRuleTableShape() {
  check("RULES table has 34 entries", RULES.length === 34, `got ${RULES.length}`);
  const m = RULES.filter((r) => r.severity === "MANDATORY").length;
  const rec = RULES.filter((r) => r.severity === "RECOMMENDED").length;
  check("34 = MANDATORY + RECOMMENDED", m + rec === 34, `MANDATORY=${m} RECOMMENDED=${rec}`);
  check("rule IDs all match /^[HA]\\d{2}$/", RULES.every((r) => /^[HA]\d{2}$/.test(r.id)));
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

// Engine-class profile tests (v0.2 phase 2). Verify that:
//   - default engine_class is `nextjs`
//   - declared engine_class is honored
//   - rules that don't apply to the class are reported as `n/a` (not fail)
//   - n/a status doesn't count toward the verdict

async function testDefaultEngineClassIsNextjs() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-default-class-"));
  mkdirSync(join(root, "apps"), { recursive: true });
  mkdirSync(join(root, "apps", "stub"));
  const report = await runHiveOps(join(root, "apps", "stub"));
  check("no ENGINE_GRAMMAR.md → engine_class defaults to nextjs",
    report.engineClass === "nextjs");
}

async function testDeclaredEngineClassHonored() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-static-html-"));
  writeFileSync(
    join(root, "ENGINE_GRAMMAR.md"),
    [
      "---",
      "engine: HiveStaticEngine",
      "id: hivestaticengine",
      "engine_class: static-html",
      "domain: hivestaticengine.hive.baby",
      "repo: saggarsonny-boop/hivebaby:apps/static",
      "owner: saggarsonny-boop",
      "version: 0.1.0",
      "status: building",
      "tier: 3",
      "schema: static-test",
      "stack: [html, css]",
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
      "# Static engine",
      "## Purpose\nA fixture.",
      "## Inputs\n- none",
      "## Outputs\n- none",
      "",
    ].join("\n"),
  );
  const report = await runHiveOps(root);
  check("declared engine_class=static-html honored",
    report.engineClass === "static-html");
}

async function testNextjsRulesSkipForStaticHtml() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-static-skip-"));
  mkdirSync(join(root, "apps"), { recursive: true });
  mkdirSync(join(root, "apps", "stub"));
  const report = await runHiveOps(join(root, "apps", "stub"), {
    engineClassOverride: "static-html",
  });
  // H02 (Next.js app router) should be n/a for static-html.
  const h02 = report.rules.find((r) => r.id === "H02");
  check("H02 (Next.js app router) is n/a for static-html",
    h02?.status === "n/a", `H02=${JSON.stringify(h02)}`);
  // H07 (Next.js metadata exports) should also be n/a.
  const h07 = report.rules.find((r) => r.id === "H07");
  check("H07 (Next.js metadata exports) is n/a for static-html",
    h07?.status === "n/a", `H07=${JSON.stringify(h07)}`);
  // H01 (package.json) is universal — should still be checked (and fail
  // here because the synthetic engine has no package.json).
  const h01 = report.rules.find((r) => r.id === "H01");
  check("H01 (package.json) still applies to static-html — should fail (no pkg)",
    h01?.status === "fail", `H01=${JSON.stringify(h01)}`);
}

async function testApiOnlyExemptsUiRules() {
  const root = mkdtempSync(join(tmpdir(), "hive-ops-api-only-"));
  mkdirSync(join(root, "apps"), { recursive: true });
  mkdirSync(join(root, "apps", "stub"));
  const report = await runHiveOps(join(root, "apps", "stub"), {
    engineClassOverride: "api-only",
  });
  // api-only exempts H08 (og.png), H11/H12 (onboarding), H13/H14/H15
  // (logo/footer/favicon), H22/H23 (design colors), H25 (viewport).
  const exempted = ["H08", "H11", "H12", "H13", "H14", "H15", "H22", "H23", "H25"];
  for (const id of exempted) {
    const r = report.rules.find((x) => x.id === id);
    check(`${id} is n/a for api-only`,
      r?.status === "n/a", `${id}=${JSON.stringify(r)}`);
  }
}

// --write-overrides tests (v0.2 phase 3)

async function testProposalGeneratesYamlForFails() {
  const { proposalReport, eligibleForProposal } = await import("../write-overrides.js");
  const root = mkdtempSync(join(tmpdir(), "hive-ops-propose-"));
  mkdirSync(join(root, "apps"), { recursive: true });
  mkdirSync(join(root, "apps", "stub"));
  const report = await runHiveOps(join(root, "apps", "stub"));
  const eligible = eligibleForProposal(report);
  check("eligible-for-proposal returns failing rules",
    eligible.length > 0 && eligible.every((r) => r.status === "fail"));
  const out = proposalReport(report, { now: new Date("2026-05-06T00:00:00Z") });
  check("proposal output mentions H01", out.includes("H01"));
  check("proposal output uses warn mode", out.includes("mode: warn"));
  check("proposal output has 7-day warn_until from 2026-05-06",
    out.includes("warn_until: 2026-05-13"));
  check("proposal output includes TODO placeholders for human review",
    out.includes("TODO:"));
}

async function testApplyWritesIntoEngineGrammar() {
  const { applyProposalsToFile } = await import("../write-overrides.js");
  const root = mkdtempSync(join(tmpdir(), "hive-ops-apply-"));
  // Engine root with an ENGINE_GRAMMAR.md but no overrides section yet.
  writeFileSync(
    join(root, "ENGINE_GRAMMAR.md"),
    [
      "---",
      "engine: HiveTestApply",
      "id: hivetestapply",
      "domain: hivetestapply.hive.baby",
      "repo: saggarsonny-boop/hivebaby:apps/test",
      "owner: saggarsonny-boop",
      "version: 0.1.0",
      "status: building",
      "tier: 3",
      "schema: test-apply",
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
      "## Purpose\nFixture.",
      "## Inputs\n- none",
      "## Outputs\n- none",
      "",
    ].join("\n"),
  );
  const report = await runHiveOps(root, { now: new Date("2026-05-06T00:00:00Z") });
  const result = applyProposalsToFile(root, report, {
    now: new Date("2026-05-06T00:00:00Z"),
  });
  check("--apply writes the file when failures exist",
    result.changed === true, `result=${JSON.stringify(result)}`);
  check("--apply reports rule IDs added",
    result.added.length > 0);

  const updated = readFileSync(result.filePath, "utf8");
  check("file now contains ## Hive-Ops Overrides section",
    /^##\s+Hive-Ops Overrides/m.test(updated));
  check("first added rule appears in YAML",
    updated.includes(`rule: ${result.added[0]}`));

  // Re-running should be idempotent — added=[], skipped=all-original
  const second = applyProposalsToFile(root, report, {
    now: new Date("2026-05-06T00:00:00Z"),
  });
  check("second --apply is idempotent (changed=false)",
    second.changed === false, `second=${JSON.stringify(second)}`);
  check("second --apply skips rules that already have entries",
    second.skipped.length === result.added.length);
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
  await testDefaultEngineClassIsNextjs();
  await testDeclaredEngineClassHonored();
  await testNextjsRulesSkipForStaticHtml();
  await testApiOnlyExemptsUiRules();
  await testProposalGeneratesYamlForFails();
  await testApplyWritesIntoEngineGrammar();

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
