---
engine: UniversalDocumentInc
id: ud-inc
domain: universaldocument.hive.baby
repo: saggarsonny-boop/hivebaby:apps/ud-inc
owner: saggarsonny-boop

version: 0.2.0
status: building
tier: 1
schema: ud-ecosystem-hub
stack: [nextjs, typescript, anthropic, stripe, clerk]
premium: false

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: clear, plain-language, ecosystem-positioning
cost_profile: zero_marginal

api_models: []

env_vars_required:
  - NEXT_PUBLIC_APP_URL

env_vars_optional: []

onboarding_stack:
  auto_demo: n/a
  first_visit_card: pending
  tooltip_tour: pending
  rotating_placeholders: n/a

vercel_project: ud-inc
vercel_root_directory: apps/ud-inc
deployment_protection: off
visibility: public
commercial_surface: none
viral_loop_targets:
  - share_card
production_state: not_listed
last_audit_at: 2026-05-15

health_check: /api/health

planned_qb_consumption:
  schemas:
    - ud-ecosystem-hub
  endpoint: /api/govern
  status: not-yet-wired
---

## Purpose

UniversalDocumentInc (ud-inc) is the **hub** of the Universal Document™ (UD) ecosystem. It's the front door at `universaldocument.hive.baby` (declared, DNS pending). Its job is to explain what UD is, name the UDR (revisable) and UDS (sealed) formats, and link out to the canonical sub-tools across the 128-engine UD fleet.

This is a **landing engine**, not a document-processing engine. It does not parse, validate, sign, or convert documents — those operations live in the sub-engines (UDConverter, UDValidator, UDSigner, etc.).

## Inputs

None. The hub is content-only: a marketing landing that links to the sub-engines.

## Outputs

A single landing page rendered in the UD design system:

- Hero: explains "Universal Document™" with ™ first-mention hygiene per §H
- "What is UD" section: defines UDR + UDS
- "Tools" section: links to anchor sub-tools (UDConverter, UDReader, UDValidator, UDSigner, UDCreator, UDUtilities, UDMedical, UDBulk)
- "Pricing" section: canonical Hive pricing per §A (free / $0.97/mo Plus / $29/mo Pro)
- Hive footer signature with #D4AF37 ♥ (Hive brand mark — the only Hive-palette element on a UD property)

## Rules

- **§G UD Design System (HARD)**: Playfair Display + DM Sans + DM Mono fonts; UD palette only — ink `#1e2d3d`, paper `#fafaf8`, gold `#c8960a`, paper-2 `#f2f1ee`, border `#e0ddd6`, muted `#6b7280`. Standard radius 8px, cards 12px.
- **§H trademark hygiene**: First mention of "Universal Document" carries `™`. UDR / UDS expansions per §H.
- **§A pricing**: free + $0.97/mo Plus + $29/mo Pro. No invented enterprise tiers.
- **§G "don't cross the streams"**: theme_color is `#c8960a` (UD gold), not `#D4AF37` (Hive gold). The single exception is the Hive footer signature ♥, which retains `#D4AF37` because it's the Hive brand mark, not a UD design token.

## Phase Plan

- **Phase 1 (this PR — 2026-05-15)**: Rewritten landing, layout, globals.css, manifest, README. UD design system compliance. ™ hygiene. Canonical pricing. Orphan PlainScan sub-pages and API routes deleted.
- **Phase 2 (next)**: Generate the favicon set (`favicon.ico`, `icon-192.png`, `icon-512.png`, `maskable-icon.png`) — UD gold flat-top hex with the "U" letter centred.
- **Phase 3**: DNS provisioning for `universaldocument.hive.baby` via Cloudflare CNAME → `cname.vercel-dns.com` per §C11. Vercel project provisioning. Status flips to `live`.
- **Phase 4**: Decide whether the hub also surfaces the long-tail of 119 PlainScan-clone sub-engines or only the 8 anchor tools. (Strategic question raised in `docs/UD_ECOSYSTEM_AUDIT_2026-05-15.md` — recommended next action #1.)
- **Phase 5**: Wire Queen Bee `/api/govern` consumption when the hub adds any AI surface (currently none).

## Out of Scope

- Document parsing, validation, signing, conversion — those live in the sub-engines, not the hub.
- Authentication / user accounts — the hub is a public marketing landing; per-tool auth is per-engine.
- Pricing checkout — the hub names prices but defers the purchase flow to per-engine Stripe surfaces.

## Deployment Notes

- Vercel project: `ud-inc` (root `apps/ud-inc`). Auto-deploy on push to `main`.
- Required env vars: `NEXT_PUBLIC_APP_URL` (defaults to `https://universaldocument.hive.baby`).
- Vercel deployment protection: **off** (per §C10).
- DNS: `universaldocument.hive.baby` not yet wired. Provision via Cloudflare CNAME → `cname.vercel-dns.com` per §C11.

## Hive-Ops Overrides

```yaml
overrides:
  - rule: H08
    mode: warn
    reason: "OG image not yet generated; hub is landing-only with no in-product imagery. Asset will be added with the favicon set in Phase 2."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H11
    mode: warn
    reason: "HiveInstallHint not yet wired; hub is landing-only and PWA install is low-priority on a marketing front door."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H12
    mode: warn
    reason: "HiveFirstVisitExplainer not yet wired; the landing copy itself serves as the first-visit explanation."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H13
    mode: warn
    reason: "public/hive-logo-full.png not yet copied from @hive/onboarding; hub uses the Hive footer signature only, header carries the UD wordmark instead. Asset port deferred to onboarding stack work."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H15
    mode: warn
    reason: "Favicon binaries not generated this PR — manifest.json declares them but actual PNG files land in Phase 2 with the OG image."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H16
    mode: waive
    reason: "§G UD Design System (HARD rule) requires UD palette on UD properties — gold is #c8960a, not Hive gold #D4AF37. The H16 rule encodes the Hive engine convention; UD properties are the documented exception per §G \"don't cross the streams\" and §C3 (UD uses #c8960a, Hive uses #D4AF37)."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
  - rule: H23
    mode: waive
    reason: "§G UD Design System (HARD rule) requires UD palette on UD properties — ink is #1e2d3d, not Hive ink #0a0a0a. Same logic as H16 waive: UD palette overrides Hive palette on UD properties per §G."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
  - rule: H21
    mode: warn
    reason: "Engine entry in hivebaby planet ENGINES array deferred — strategic question (recommended next action #1 in the UD audit) is whether the hub gets its own planet cell or whether a single 'UD' cell covers the whole ecosystem."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: V01
    mode: waive
    reason: "Per §C1 the hub is named 'UniversalDocument'/'UniversalDocumentInc' — distinct from the UD<Word> sub-engine pattern. The V01 regex /^(Hive|UD)[A-Z][A-Za-z0-9]*$/ encodes the sub-engine pattern but does not accommodate the documented hub-name exception. Either the regex needs widening in tools/hive-ops/v-rules.ts or §C1 needs a canonical-exception note added; tracked as a follow-up in docs/UD_ECOSYSTEM_AUDIT_2026-05-15.md."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
  - rule: V02
    mode: waive
    reason: "Per §C1 every UD engine slug is hyphenated (ud-<purpose>). The V02 regex /^[a-z][a-z0-9]*$/ rejects hyphens, which would fail every one of the 128 UD engines. The regex needs widening to /^[a-z][a-z0-9-]*$/ in tools/hive-ops/v-rules.ts; tracked as a follow-up in docs/UD_ECOSYSTEM_AUDIT_2026-05-15.md."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
  - rule: V03
    mode: waive
    reason: "Same root cause as V02 waive — the id≡normalised(engine) check assumes a non-hyphenated id, which breaks for every UD engine. Resolves when V02 is fixed."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
  - rule: V04
    mode: waive
    reason: "The hub's domain is 'universaldocument.hive.baby' (the UD ecosystem front door), not 'ud-inc.hive.baby'. Per §C1 UD ecosystem domains use the 'universaldocument.hive.baby' subtree (see CLAUDE.md §D updated 2026-05-15). The V04 check enforces id-derived domains, which the UD subtree intentionally violates."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
```
