// HiveOps GOVERNANCE rule tests — fixture-driven.
//
// Run via: tsx tools/hive-ops/tests/governance.test.ts
//
// Three fixture engines under tests/fixtures/governance/:
//   - pass-engine    — every G-rule should PASS
//   - fail-engine    — every G-rule should FAIL (reported as `warn` while
//                      GOVERNANCE_FAIL_BLOCKING=false)
//   - mixed-engine   — typical migration midpoint (3/5 PASS)
//
// G03 talks to https://queenbee.hive.baby/api/registry by default. The
// tests mock fetch via QB_REGISTRY_URL pointing at a local data: URI is
// not portable, so we install a process-wide fetch override that returns
// a fixture registry response for the duration of the test.

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GOVERNANCE_RULES, G_RULE_IDS, softenIfWarnOnly, GOVERNANCE_FAIL_BLOCKING } from "../checks/governance/index.js";
import type { ParsedOverrides, RuleContext } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = join(__dirname, "fixtures", "governance");

let failures = 0;
function check(label: string, cond: boolean, detail?: string): void {
  if (!cond) {
    failures += 1;
    console.error(`FAIL: ${label}` + (detail ? ` — ${detail}` : ""));
  } else {
    console.log(`ok: ${label}`);
  }
}

function emptyOverrides(): ParsedOverrides {
  return { byRule: new Map(), parseErrors: [] };
}

function ctxFor(slug: string): RuleContext {
  return {
    engineRoot: join(FIXTURE_ROOT, slug),
    engineSlug: slug,
    overrides: emptyOverrides(),
    now: new Date("2026-05-09T00:00:00Z"),
    engineClass: "nextjs",
  };
}

interface RegistryEntry {
  id: string;
  name: string;
  domain: string | null;
  status: string;
  schema: string;
}

function installFetchMock(registeredEngines: RegistryEntry[]): () => void {
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: unknown) => {
    const url = typeof input === "string" ? input : String(input);
    if (/\/api\/registry/.test(url)) {
      return new Response(JSON.stringify({ engines: registeredEngines }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    throw new Error(`unexpected fetch in test: ${url}`);
  }) as typeof fetch;
  return () => {
    globalThis.fetch = original;
  };
}

async function runRules(slug: string) {
  const out: Record<string, { status: string; message: string }> = {};
  for (const rule of GOVERNANCE_RULES) {
    const raw = await rule.check(ctxFor(slug));
    out[rule.id] = { status: raw.status, message: raw.message };
  }
  return out;
}

async function testPassEngine() {
  const restore = installFetchMock([
    { id: "pass-engine", name: "PassEngine", domain: null, status: "live", schema: "generic" },
  ]);
  try {
    const r = await runRules("pass-engine");
    check("pass-engine: G01 PASS", r.G01.status === "pass", JSON.stringify(r.G01));
    check("pass-engine: G02 PASS", r.G02.status === "pass", JSON.stringify(r.G02));
    check("pass-engine: G03 PASS", r.G03.status === "pass", JSON.stringify(r.G03));
    check("pass-engine: G04 PASS", r.G04.status === "pass", JSON.stringify(r.G04));
    check("pass-engine: G05 PASS", r.G05.status === "pass", JSON.stringify(r.G05));
  } finally {
    restore();
  }
}

async function testFailEngine() {
  // fail-engine slug is NOT in the mocked registry → G03 reports fail.
  const restore = installFetchMock([
    { id: "some-other-engine", name: "Other", domain: null, status: "live", schema: "generic" },
  ]);
  try {
    const r = await runRules("fail-engine");
    check("fail-engine: G01 FAIL", r.G01.status === "fail", JSON.stringify(r.G01));
    check("fail-engine: G02 FAIL", r.G02.status === "fail", JSON.stringify(r.G02));
    check("fail-engine: G03 FAIL", r.G03.status === "fail", JSON.stringify(r.G03));
    check("fail-engine: G04 FAIL", r.G04.status === "fail", JSON.stringify(r.G04));
    check("fail-engine: G05 FAIL", r.G05.status === "fail", JSON.stringify(r.G05));
  } finally {
    restore();
  }
}

async function testMixedEngine() {
  const restore = installFetchMock([
    { id: "mixed-engine", name: "MixedEngine", domain: null, status: "building", schema: "generic" },
  ]);
  try {
    const r = await runRules("mixed-engine");
    check("mixed-engine: G01 PASS (package installed)", r.G01.status === "pass");
    check("mixed-engine: G02 FAIL (no govern() call)", r.G02.status === "fail");
    check("mixed-engine: G03 PASS (registered)", r.G03.status === "pass");
    check("mixed-engine: G04 PASS (queen_bee_schemas declared)", r.G04.status === "pass");
    check("mixed-engine: G05 FAIL (no stamp persistence)", r.G05.status === "fail");
    const passes = Object.values(r).filter((v) => v.status === "pass").length;
    check("mixed-engine: 3 of 5 PASS (typical migration midpoint)", passes === 3);
  } finally {
    restore();
  }
}

async function testRegistryUnreachableSkips() {
  // Override fetch to throw; G03 should report `skip`, not `fail`.
  const original = globalThis.fetch;
  globalThis.fetch = (async () => { throw new Error("ECONNREFUSED"); }) as typeof fetch;
  try {
    const r = await runRules("pass-engine");
    check("registry unreachable: G03 reports SKIP, not fail", r.G03.status === "skip",
      JSON.stringify(r.G03));
  } finally {
    globalThis.fetch = original;
  }
}

function testWarnOnlySoftener() {
  // The constant is currently false — every fail softens to warn.
  check("GOVERNANCE_FAIL_BLOCKING is false (warn-only window)",
    GOVERNANCE_FAIL_BLOCKING === false);
  const softFail = softenIfWarnOnly("fail", "G01 missing dep");
  check("softener: fail → warn", softFail.status === "warn",
    JSON.stringify(softFail));
  check("softener: message tagged with [GOVERNANCE WARN-only]",
    softFail.message.includes("[GOVERNANCE WARN-only"));
  const softPass = softenIfWarnOnly("pass", "looks fine");
  check("softener: pass passes through unchanged", softPass.status === "pass");
  const softSkip = softenIfWarnOnly("skip", "registry unreachable");
  check("softener: skip passes through unchanged", softSkip.status === "skip");
}

function testRuleSetShape() {
  check("5 G-rules registered", GOVERNANCE_RULES.length === 5,
    `got ${GOVERNANCE_RULES.length}`);
  check("rule IDs G01..G05 present",
    ["G01", "G02", "G03", "G04", "G05"].every((id) => G_RULE_IDS.has(id)));
  check("every G-rule has category=GOVERNANCE",
    GOVERNANCE_RULES.every((r) => r.category === "GOVERNANCE"));
  check("every G-rule is MANDATORY severity",
    GOVERNANCE_RULES.every((r) => r.severity === "MANDATORY"));
}

async function main() {
  testRuleSetShape();
  testWarnOnlySoftener();
  await testPassEngine();
  await testFailEngine();
  await testMixedEngine();
  await testRegistryUnreachableSkips();

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
  }
  console.log("\nall governance tests passed");
}

main().catch((err) => {
  console.error("governance test runner crashed:", err);
  process.exit(1);
});
