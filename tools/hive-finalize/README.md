# HiveFinalize

Build-time gate that decides whether an engine is shippable. Plays
the **Foreman** role in Hive's governance vocabulary: walks an
engine through the canonical manifest schema and the operational
launch checklist, and produces a single pass/fail verdict.

## What it does

1. **Parses** the engine's `ENGINE_GRAMMAR.md` — YAML frontmatter
   plus prose body, per the canonical schema in
   [`docs/specs/manifest-schema-final.md`](../../docs/specs/manifest-schema-final.md).
2. **Validates** the manifest against the 29 numbered rules in §4
   of that schema. Each rule returns `pass`, `fail`, or `skip` with
   a human-readable message.
3. **Runs** the operational launch checklist (DNS, SEO, backup,
   planet placement, env vars, health endpoint, fleet registration,
   …) — currently scaffolded only; each step returns
   `not implemented`. The CLI does **not** invoke the checklist
   yet; wire that in once the first engine is migrated.
4. **Emits** a structured report: per-rule status, per-step status,
   overall verdict.

## What it is NOT

HiveFinalize is **build-time / pre-ship**. Once an engine is live,
it does not run. Continuous monitoring of live engines is the
**Compliance Monitor**'s job — a separate tool, not yet scaffolded.

| Concern | HiveFinalize | Compliance Monitor |
|---|---|---|
| When | Pre-ship gate | After launch, ongoing |
| Verdict | Single pass/fail at finalisation | Drift alerts on schedule |
| Failure action | Blocks `production_state` flip to `listed` | Pages on-call, opens issue |
| Source of truth | The engine's `ENGINE_GRAMMAR.md` and live infra at one moment | Live infra over time |

If a rule ever needs to keep firing after ship, it belongs in
Compliance Monitor, not here.

## Input/output contract

**Input** — one of:

- An engine slug (the directory name relative to the hivebaby
  monorepo root): `hive-aestheticbestie`, `hive-imr`,
  `apps/hive-plainscan`, etc. The CLI resolves the slug to a
  manifest path.
- An absolute path to an `ENGINE_GRAMMAR.md` file.

**Output** — a `FinalizeReport`:

```ts
{
  engine: string | null;            // value of `engine` field, or null if no frontmatter
  manifestPath: string;             // absolute path to the file scanned
  hasFrontmatter: boolean;          // false → all rules skipped
  rules: RuleResult[];              // one entry per rule attempted
  steps: StepResult[];              // one entry per checklist step attempted
  verdict: 'pass' | 'fail' | 'skipped';
}
```

`verdict` is `pass` only when every rule that ran passed AND every
checklist step that ran passed. Any `fail` flips it to `fail`. If
no rules ran (no frontmatter), verdict is `skipped`.

## Current status

**Scaffold only.** No engine has been migrated to the canonical
schema yet (every `ENGINE_GRAMMAR.md` in the monorepo today still
uses the legacy `<GrapplerHook>` HTML-ish block). Run today on any
existing engine, the validator emits:

> engine has no canonical frontmatter, skipping validation.

Migration of the first engine (recommended: `hive-aestheticbestie`)
unblocks real validator runs.

## Running

```bash
# from monorepo root, after `npm install` inside this directory
cd tools/hive-finalize
npm install

# validate an engine by slug
npx tsx cli.ts hive-aestheticbestie

# typecheck
npm run typecheck
```

## Files

| File | Purpose |
|---|---|
| `validate.ts` | The 29-rule schema validator. Pure, no I/O beyond reading the manifest file passed in. |
| `checklist.ts` | Operational launch checklist runner. Stub only — each step returns `not implemented`. |
| `cli.ts` | CLI entry point. Resolves slug → path, runs validator + checklist, prints report. |
| `types.ts` | Shared types: `Manifest`, `RuleResult`, `StepResult`, `FinalizeReport`. |

## Not in scope (yet)

- Tests. Land after the first real migration so we have a fixture.
- Cross-manifest checks (V5: uniqueness across the manifest union;
  V24: cross-engine references in `viral_loop_targets`). The
  validator stubs them as `skip` until the union loader exists.
- Network checks (V6 GitHub repo, V28 Vercel env, V29 health
  endpoint). Stubbed as `skip` until creds are wired in.
- Auto-fix. HiveFinalize reports; it does not edit.
