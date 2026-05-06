# @hive/ops

Engine launch checklist enforcer. Programmatic gate for the MANDATORY items
in [`docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md`](../../docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md)
**and** the canonical manifest schema in
[`docs/specs/manifest-schema-final.md`](../../docs/specs/manifest-schema-final.md).

> **As of v0.2 the audit is unified.** HiveOps runs both rule families in
> a single CLI invocation:
>
> - **H-rules (H01..H28)** — filesystem checks (favicon, manifest.json,
>   service worker, install hint, layout metadata, …) implemented locally
>   in `rules.ts`.
> - **V-rules (V01..V29)** — manifest schema validation supplied by
>   `tools/hive-finalize/validate.ts` and re-exposed under normalized
>   V01..V29 IDs (hive-finalize ships them as V1..V29; the runner
>   zero-pads when ingesting).
>
> Both rule families share the same override schema. Engines may waive or
> warn-mode either H-rules or V-rules with the same YAML block in
> `ENGINE_GRAMMAR.md`.

## Quick start

```sh
tsx tools/hive-ops/cli.ts <engine-slug>
# or:
tsx tools/hive-ops/cli.ts <engine-slug> --json | jq .
# from outside the hivebaby repo:
tsx tools/hive-ops/cli.ts ud-converter --repo /path/to/universal-document
```

Exit codes:
- **0** — verdict pass or warn
- **1** — verdict fail
- **2** — could not resolve engine root or other tooling error

## Rules (28 total · 26 MANDATORY · 2 RECOMMENDED)

| ID | Category | Title | Severity |
|---|---|---|---|
| H01 | CORE_BUILD | package.json present at engine root | MANDATORY |
| H02 | CORE_BUILD | Next.js app router root layout present | MANDATORY |
| H03 | CORE_BUILD | public/ directory present | MANDATORY |
| H04 | INTERNATIONALIZATION | locales/ directory present | MANDATORY |
| H05 | INTERNATIONALIZATION | all 7 canonical free-tier locales present (en, es, fr, ar, hi, zh, pt) | MANDATORY |
| H06 | INTERNATIONALIZATION | navigator.language detection wired in strings loader | MANDATORY |
| H07 | SEO | root layout exports metadata.title and metadata.description | MANDATORY |
| H08 | SEO | public/og.png present | MANDATORY |
| H09 | SEO | robots.txt present (public/ or app/robots.ts) | MANDATORY |
| H10 | SEO | sitemap present (public/sitemap.xml or app/sitemap.ts) | MANDATORY |
| H11 | FIRST_USE_ONBOARDING | PWA install hint banner present (HiveInstallHint or local equivalent) | MANDATORY |
| H12 | FIRST_USE_ONBOARDING | first-visit explainer present (HiveFirstVisitExplainer or local equivalent) | MANDATORY |
| H13 | HIVE_INTEGRATION | HIVE_HEADER_LOGO — public/hive-logo-full.png copied | MANDATORY |
| H14 | HIVE_INTEGRATION | HIVE_FOOTER_SIGNATURE — "Made with ♥ in the Hive" rendered | MANDATORY |
| H15 | HIVE_INTEGRATION | FAVICON_COMPLETE — full canonical favicon set in public/ | MANDATORY |
| H16 | HIVE_INTEGRATION | THEME_COLOR_CANONICAL — #D4AF37 in metadata + manifest | MANDATORY |
| H17 | HIVE_INTEGRATION | APPLE_WEB_APP_META — metadata.appleWebApp configured | MANDATORY |
| H18 | HIVE_INTEGRATION | MANIFEST_COMPLETE — public/manifest.json has canonical fields | MANDATORY |
| H19 | HIVE_INTEGRATION | ENGINE_GRAMMAR.md present in repo root with frontmatter | MANDATORY |
| H20 | HIVE_INTEGRATION | service worker registrar present | MANDATORY |
| H21 | VISIBILITY_SURFACES | engine entry present in hivebaby planet ENGINES array | MANDATORY |
| H22 | DESIGN_CONSISTENCY | Hive gold #D4AF37 referenced in component / styles | MANDATORY |
| H23 | DESIGN_CONSISTENCY | canonical dark ink #0a0a0a referenced | RECOMMENDED |
| H24 | ADOPTION_AMPLIFIERS | manifest registered in layout (link rel="manifest") | MANDATORY |
| H25 | ADOPTION_AMPLIFIERS | viewport meta with width=device-width set in layout | MANDATORY |
| H26 | OPERATIONAL | .env.example or env_vars_required documented | RECOMMENDED |
| H27 | OPERATIONAL | README.md present in engine root | MANDATORY |
| H28 | OPERATIONAL | tsconfig.json with strict mode | MANDATORY |

## Override schema — when a rule legitimately can't apply

An engine can downgrade or waive a specific rule by adding a YAML block to
its `ENGINE_GRAMMAR.md`:

```markdown
## Hive-Ops Overrides

```yaml
overrides:
  - rule: H08
    mode: warn
    reason: "OG image generator broken; fix tracked in workflow X. Will be regenerated this week."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/123
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-05-13   # 7 days default; 30 days max from `date`
  - rule: H21
    mode: waive
    reason: "Internal-only engine; never appears on the planet."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/124
    reviewer: Sonny
    date: 2026-05-06
```
```

### Validation rules
- `rule, mode, reason, issue, reviewer, date` are all REQUIRED for every entry
- `mode` must be exactly `warn` or `waive`
- `date` must be `YYYY-MM-DD`
- `issue` must be a `https://github.com/<owner>/<repo>/issues/<n>` URL
- For `mode: warn`:
  - `warn_until` is REQUIRED (defaults to date + 7 days if omitted)
  - `warn_until` must be ≤ 30 days after `date` (the hard ceiling)
  - When `warn_until` is in the past, the warn lapses and the rule fires `fail` again with a note explaining the expiry
- `mode: waive` ignores `warn_until`
- Unknown rule IDs are reported as parse errors
- Duplicate entries for the same rule are reported as parse errors
- Rules marked `unwaivable: true` (currently H01) reject any override entry

### Warn-mode philosophy

Warn-mode exists for one reason: an engine that's mostly ready can ship while
a single legitimate fix is in flight. It is **not** a long-term hiding place.
The 30-day hard ceiling guarantees that today's warn becomes tomorrow's fail
without anyone having to remember.

If a rule needs more than 30 days of cover, that's not warn territory — it's
either:
- A `waive` (with documented reason and reviewer) if the rule legitimately
  doesn't apply to this engine, OR
- A change to the rule itself in `tools/hive-ops/rules.ts` if it's
  systematically wrong.

## CI integration

`.github/workflows/hive-ops.yml` runs the CLI on every PR for changed engines
under `apps/`. Failures block merge. Warns surface in the PR summary but
don't block.

## Local dev

```sh
cd tools/hive-ops
npm install
npx tsc --noEmit          # type-check
npx tsx tests/rules.test.ts  # run smoke tests
npx tsx cli.ts parkback --repo ../..   # audit a real engine
```

## Roadmap

- **v0.2 ✓** — combined H+V audit report (`runner.ts` + `v-rules.ts`).
- **v0.2** — engine-class profiles (`engine_class` frontmatter field, applicability matrix).
- **v0.2** — `--write-overrides` flag for automated override scaffolding.
- **v0.3** — network rules (Vercel deploy URL 200, Cloudflare CNAME, Stripe price IDs) — gated on the credential plumbing.
- **v0.3** — Vercel env-var presence check via VERCEL_TOKEN.
