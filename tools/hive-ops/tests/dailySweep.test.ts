// HiveOps daily-sweep smoke tests — exercise the categoriser and the
// override-stripper against synthetic ENGINE_GRAMMAR.md fixtures.
//
// Run via: tsx tools/hive-ops/tests/dailySweep.test.ts
//
// Tests run with DATABASE_URL unset so insertAlert() short-circuits to
// stdout rather than touching the real DB.

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  categoriseOverrides,
  findEngineManifests,
  runSweep,
  stripExpiredOverrides,
} from "../dailySweep.js";

let failures = 0;
function check(label: string, cond: boolean, detail?: string): void {
  if (!cond) {
    failures += 1;
    console.error(`FAIL: ${label}` + (detail ? ` — ${detail}` : ""));
  } else {
    console.log(`ok: ${label}`);
  }
}

const NOW = new Date("2026-05-20T12:00:00Z");

function manifestWithOverrides(overrides: string): string {
  return [
    "---",
    "engine: TestEngine",
    "id: test-engine",
    "domain: test.hive.baby",
    "---",
    "",
    "# Engine",
    "",
    "## Hive-Ops Overrides",
    "",
    "```yaml",
    overrides,
    "```",
    "",
  ].join("\n");
}

function setupRepo(): string {
  const repo = mkdtempSync(join(tmpdir(), "hive-ops-sweep-"));
  mkdirSync(join(repo, "apps"), { recursive: true });
  return repo;
}

function setupEngine(repo: string, slug: string, manifest: string): string {
  const root = join(repo, "apps", slug);
  mkdirSync(root, { recursive: true });
  const manifestPath = join(root, "ENGINE_GRAMMAR.md");
  writeFileSync(manifestPath, manifest);
  return manifestPath;
}

// ─── 1. Engine with expiry in the past → flips to enforce ───────────
async function testExpiredFlips() {
  const repo = setupRepo();
  setupEngine(
    repo,
    "alpha",
    manifestWithOverrides(
      [
        "overrides:",
        "  - rule: H08",
        "    mode: warn",
        "    reason: \"OG image generator broken — fix in flight\"",
        "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/100",
        "    reviewer: Sonny",
        "    date: 2026-05-01",
        "    warn_until: 2026-05-08",
      ].join("\n"),
    ),
  );

  const report = await runSweep({ repo, dryRun: false, now: NOW });
  check("expired entry → 1 flipped", report.flipped.length === 1,
    `flipped=${JSON.stringify(report.flipped)}`);
  check("expired entry → engine listed in mutated", report.mutated.includes("alpha"));

  const after = readFileSync(join(repo, "apps", "alpha", "ENGINE_GRAMMAR.md"), "utf8");
  check("expired entry stripped from manifest", !after.includes("rule: H08"),
    `file after sweep:\n${after}`);
  check(
    "section removed when no overrides remain",
    !after.includes("## Hive-Ops Overrides"),
    `file after sweep:\n${after}`,
  );
}

// ─── 2. Engine with expiry in the future → unchanged ────────────────
async function testFutureUnchanged() {
  const repo = setupRepo();
  const manifest = manifestWithOverrides(
    [
      "overrides:",
      "  - rule: H08",
      "    mode: warn",
      "    reason: \"OG image generator broken — fix in flight\"",
      "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/101",
      "    reviewer: Sonny",
      "    date: 2026-05-15",
      "    warn_until: 2026-06-01",
    ].join("\n"),
  );
  const path = setupEngine(repo, "beta", manifest);
  const before = readFileSync(path, "utf8");

  const report = await runSweep({ repo, dryRun: false, now: NOW });
  check("future entry → 0 flipped", report.flipped.length === 0);
  check("future entry → 0 expiring soon (>24h)", report.expiringSoon.length === 0);
  const after = readFileSync(path, "utf8");
  check("future entry → file byte-identical", after === before);
}

// ─── 3. Engine in waive (≈ enforce-with-permanent-override) → unchanged ─
async function testWaiveUnchanged() {
  const repo = setupRepo();
  const manifest = manifestWithOverrides(
    [
      "overrides:",
      "  - rule: V18",
      "    mode: waive",
      "    reason: \"Engine class has no chat surface\"",
      "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/102",
      "    reviewer: Sonny",
      "    date: 2026-05-01",
    ].join("\n"),
  );
  const path = setupEngine(repo, "gamma", manifest);
  const before = readFileSync(path, "utf8");

  const report = await runSweep({ repo, dryRun: false, now: NOW });
  check("waive entry → never flipped", report.flipped.length === 0);
  const after = readFileSync(path, "utf8");
  check("waive entry → file byte-identical", after === before);
}

// ─── 4. Engine without warn-mode (no override block) → unchanged ────
async function testNoOverrides() {
  const repo = setupRepo();
  const manifest = [
    "---",
    "engine: Plain",
    "id: plain",
    "---",
    "",
    "# Plain engine",
    "",
    "No overrides at all.",
    "",
  ].join("\n");
  const path = setupEngine(repo, "delta", manifest);
  const before = readFileSync(path, "utf8");

  const report = await runSweep({ repo, dryRun: false, now: NOW });
  check("no overrides → 0 flipped", report.flipped.length === 0);
  check("no overrides → file byte-identical", readFileSync(path, "utf8") === before);
}

// ─── 5. Entry expiring within 24 hours → warning logged, mode unchanged ─
async function testImminentExpiry() {
  const repo = setupRepo();
  // warn_until=2026-05-20 expires end-of-day UTC; with NOW=12:00Z that's
  // ~12 hours of life remaining → within the 24h imminent window.
  const manifest = manifestWithOverrides(
    [
      "overrides:",
      "  - rule: H11",
      "    mode: warn",
      "    reason: \"Install hint banner refactor in flight\"",
      "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/103",
      "    reviewer: Sonny",
      "    date: 2026-05-15",
      "    warn_until: 2026-05-20",
    ].join("\n"),
  );
  const path = setupEngine(repo, "epsilon", manifest);
  const before = readFileSync(path, "utf8");

  const report = await runSweep({ repo, dryRun: false, now: NOW });
  check("imminent entry → 0 flipped", report.flipped.length === 0,
    `flipped=${JSON.stringify(report.flipped)}`);
  check("imminent entry → 1 warning", report.expiringSoon.length === 1,
    `expiringSoon=${JSON.stringify(report.expiringSoon)}`);
  check(
    "imminent entry hoursLeft <= 24",
    report.expiringSoon[0]?.hoursLeft !== undefined && report.expiringSoon[0].hoursLeft <= 24,
    `hoursLeft=${report.expiringSoon[0]?.hoursLeft}`,
  );
  const after = readFileSync(path, "utf8");
  check("imminent entry → file byte-identical (no flip)", after === before);
}

// ─── 6. Mixed manifest: keep one entry, strip another ────────────────
async function testMixedKeepAndStrip() {
  const repo = setupRepo();
  const manifest = manifestWithOverrides(
    [
      "overrides:",
      "  - rule: H08",
      "    mode: warn",
      "    reason: \"Stale — should be removed\"",
      "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/200",
      "    reviewer: Sonny",
      "    date: 2026-05-01",
      "    warn_until: 2026-05-08",
      "  - rule: V18",
      "    mode: waive",
      "    reason: \"Permanent waive — should be kept\"",
      "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/201",
      "    reviewer: Sonny",
      "    date: 2026-05-01",
    ].join("\n"),
  );
  const path = setupEngine(repo, "zeta", manifest);

  const report = await runSweep({ repo, dryRun: false, now: NOW });
  check("mixed → 1 flipped (the expired one)", report.flipped.length === 1);
  const after = readFileSync(path, "utf8");
  check("mixed → expired rule stripped", !after.includes("rule: H08"),
    `file:\n${after}`);
  check("mixed → kept waive entry preserved", after.includes("rule: V18"),
    `file:\n${after}`);
  check("mixed → section header preserved (still has overrides)",
    after.includes("## Hive-Ops Overrides"));
}

// ─── 7. Dry-run does not mutate the file ─────────────────────────────
async function testDryRunNoWrite() {
  const repo = setupRepo();
  const manifest = manifestWithOverrides(
    [
      "overrides:",
      "  - rule: H08",
      "    mode: warn",
      "    reason: \"should NOT be stripped in dry-run\"",
      "    issue: https://github.com/saggarsonny-boop/hivebaby/issues/300",
      "    reviewer: Sonny",
      "    date: 2026-05-01",
      "    warn_until: 2026-05-08",
    ].join("\n"),
  );
  const path = setupEngine(repo, "eta", manifest);
  const before = readFileSync(path, "utf8");

  const report = await runSweep({ repo, dryRun: true, now: NOW });
  check("dry-run still reports 1 flipped", report.flipped.length === 1);
  check("dry-run does not mutate file", readFileSync(path, "utf8") === before);
  check("dry-run reports no mutated engines", report.mutated.length === 0);
}

// ─── 8. Pure helpers — categoriseOverrides + stripExpiredOverrides ───
function testPureHelpers() {
  const raw = manifestWithOverrides(
    [
      "overrides:",
      "  - rule: H17",
      "    mode: warn",
      "    reason: r1",
      "    issue: https://github.com/x/y/issues/1",
      "    reviewer: r",
      "    date: 2026-05-01",
      "    warn_until: 2026-05-05",
      "  - rule: H18",
      "    mode: warn",
      "    reason: r2",
      "    issue: https://github.com/x/y/issues/2",
      "    reviewer: r",
      "    date: 2026-05-15",
      "    warn_until: 2026-06-15",
    ].join("\n"),
  );
  const cat = categoriseOverrides(raw, NOW);
  check("categoriser: 1 expired (H17)", cat.expired.length === 1 && cat.expired[0].rule === "H17");
  check("categoriser: 0 imminent", cat.imminent.length === 0);

  const stripped = stripExpiredOverrides(raw, new Set(["H17"]));
  check("stripper: H17 removed", !stripped.includes("rule: H17"));
  check("stripper: H18 retained", stripped.includes("rule: H18"));
}

// ─── 9. findEngineManifests honors apps/ layout ──────────────────────
function testFindManifests() {
  const repo = setupRepo();
  setupEngine(repo, "alpha", manifestWithOverrides("overrides: []"));
  setupEngine(repo, "beta", manifestWithOverrides("overrides: []"));
  // Engine without a manifest — should be ignored.
  mkdirSync(join(repo, "apps", "no-manifest"));

  const found = findEngineManifests(repo).map((m) => m.slug).sort();
  check("findEngineManifests returns only engines with manifests",
    JSON.stringify(found) === JSON.stringify(["alpha", "beta"]),
    `found=${JSON.stringify(found)}`);
}

async function run() {
  delete process.env.DATABASE_URL; // ensure insertAlert short-circuits
  await testExpiredFlips();
  await testFutureUnchanged();
  await testWaiveUnchanged();
  await testNoOverrides();
  await testImminentExpiry();
  await testMixedKeepAndStrip();
  await testDryRunNoWrite();
  testPureHelpers();
  testFindManifests();

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
  }
  console.log("\nAll daily-sweep tests passed.");
}

run().catch((err) => {
  console.error("test run crashed:", err);
  process.exit(1);
});
