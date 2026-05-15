---
engine: HivePlainScan
id: hiveplainscan
domain: plainscan.hive.baby
domain_aliases:
  - plainscan.hive.baby
  - scan.hive.baby
repo: saggarsonny-boop/hivebaby:apps/hive-plainscan
owner: saggarsonny-boop

version: 0.2.1
status: building
tier: 1
schema: radiology-report-explanation
stack: [nextjs, typescript, tailwind, anthropic, replicate, mammoth]
premium: false

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: calm, plain-language, sixth-grade reading level
cost_profile: zero_marginal
engine_class: nextjs

api_models:
  - role: explain
    model_id: claude-sonnet-4-20250514
  - role: illustration
    model_id: black-forest-labs/flux-schnell

env_vars_required:
  - ANTHROPIC_API_KEY
  - REPLICATE_API_TOKEN
  - NEXT_PUBLIC_APP_URL

env_vars_optional:
  - PLAINSCAN_DAILY_CAP_CENTS

onboarding_stack:
  auto_demo: pending
  first_visit_card: pending
  tooltip_tour: pending
  rotating_placeholders: implemented

vercel_project: hive-plainscan
vercel_root_directory: apps/hive-plainscan
deployment_protection: off
visibility: public
commercial_surface: donations
viral_loop_targets:
  - share_card
  - pr_pickup
production_state: not_listed
last_audit_at: 2026-05-15

health_check: /api/health

planned_qb_consumption:
  schemas:
    - radiology-report-explanation
  endpoint: /api/govern
  status: not-yet-wired
---

## Purpose

HivePlainScan is a patient education tool. It explains finalized radiology reports in plain English at a 6th–8th grade reading level. It does **not** diagnose, interpret raw scan images, recommend treatment, or replace a physician — it explains what the report already says.

The engine has a **rule-based local fallback** that runs without any AI keys. This keeps a base demo path free at the tier of `cost_profile: zero_marginal` even before AI keys are provisioned. With keys present, the AI explanation + Replicate FLUX illustration pipeline activates.

## Inputs

- Pasted text from a finalized radiology report
- PDF upload (parsed client-side via pdfjs-dist)
- DOCX upload (parsed server-side via mammoth at `/api/extract-report`)
- Image upload (PNG/JPEG; OCR'd server-side via Anthropic vision)
- Optional exam type selector (MRI · CT · X-ray · Ultrasound · Other · Auto-detect)
- Optional body region selector (Spine, Brain, Knee, Shoulder, Hip, Abdomen, Chest, Other · Auto-detect)

## Outputs

JSON `ExplainResult`:

- `bodyRegion` (string)
- `reportType` (string)
- `summary` (string, 2–4 sentences, 6th–8th grade reading level)
- `findings` (array of `{ level, finding, plainLanguage, severity, possibleSymptoms[] }`)
- `questionsForDoctor` (array of strings, 5–7 entries)
- `redFlags` (array of strings, urgent terms surfaced from the report)
- `disclaimer` (string)
- `illustrationUrl` (string — AI illustration when available, SVG diagram fallback otherwise)
- `illustrationSource` (`ai` | `svg`)
- `source` (`ai` | `fallback`)

## Rules

- Always use "the report describes" phrasing
- Never say diagnose, treat, recommend, or urgent (except in `redFlags`)
- Reading level: 6th to 8th grade
- All body regions supported; spine variants (cervical, thoracic, lumbar) get diagrammatic detail
- If the uploaded content is not a radiology report, return `{ "error": "This does not appear to be a radiology report. Please upload a completed imaging report." }`
- PHI scrubbing is **mandatory** at two layers:
  1. Client-side preview (`detectPhi` in `lib/privacy.ts`) — non-mutating; warns the user before submission
  2. Server-side pre-call (`removePhi`) — mutates the text the AI sees
- Cost-cap circuit breaker (`lib/cost-cap.ts`) — when daily Anthropic spend exceeds `PLAINSCAN_DAILY_CAP_CENTS` (default 500¢), the engine falls back to the local rule-based explanation + SVG diagram. Image-input requests return 503 in this state.

## Safety Templates

Every response carries the disclaimer:

> This explanation is based on the radiology report you provided. It is for educational purposes only. It does not diagnose your condition, recommend treatment, or replace advice from your physician.

Layout-level footer (every page):

> No ads. No investors. No agenda. — Free at the base tier, forever. — This is not medical advice. Always consult a qualified clinician.

## Phase Plan

- **Phase 1 (shipped):** Anthropic-powered explanation, ParseError handling, /api/explain text + image branches.
- **Phase 2 (shipped):** PHI scrubbing, rule-based fallback, SVG diagrams, Replicate FLUX illustration pipeline, DOCX support, cost-cap circuit breaker, sample report, Hive footer signature, service worker registration, manifest.json, /api/health canonical shape.
- **Phase 3 (shipped 2026-05-15):** Locale catalogue expansion (es, fr, ar, hi, zh, pt) — all 7 canonical Hive locales present in `locales/`. H05 override resolved; `multilingual` flag flipped pending → enabled.
- **Phase 4 (in WARN until 2026-06-08):** Canonical onboarding stack wiring — `<HiveInstallHint />`, `<HiveFirstVisitExplainer />`, `HiveHeader`/`HiveFooter` wrappers around `@hive/onboarding`, canonical SEO `layout.tsx`, favicon set, OG image, logo asset port. Tracked via overrides H08/H11/H12/H13/H15.
- **Phase 5 (shipped 2026-05-15):** DNS provisioning for `plainscan.hive.baby` + `scan.hive.baby` — Cloudflare CNAMEs upserted via `.github/workflows/wire-plainscan-dns.yml`. H21 override resolved (planet entry already at `status: 'live'`).
- **Phase 6 (deferred):** Wire Queen Bee `/api/govern` consumption per `planned_qb_consumption` block above. Until then, governance flag remains `QueenBee.MasterGrappler@pending`. No engine in the fleet calls QB in production yet (per CLAUDE.md B18 / Constitution §VII); HivePlainScan adopts when the wiring pattern is finalised.

`production_state` flips `not_listed → listed` and `status` flips `building → live` when Phase 4 ships (all WARN overrides resolved). Target: 2026-06-08 (override expiry).

## Out of Scope

- Diagnostic interpretation of raw scan images (the AI vision branch only OCRs text from a report photo)
- Treatment recommendations
- Comparing against prior imaging
- Reading non-radiology medical documents (lab reports, pathology, etc.)

## Deployment Notes

- Vercel project: `hive-plainscan` (root `apps/hive-plainscan`). Auto-deploy on push to `main`.
- Required env vars in production: `ANTHROPIC_API_KEY`, `REPLICATE_API_TOKEN` (optional — graceful degrade when absent), `NEXT_PUBLIC_APP_URL`.
- Vercel deployment protection: **off** (per C10).
- DNS (shipped 2026-05-15): `plainscan.hive.baby` → `cname.vercel-dns.com`, alias `scan.hive.baby` → same. Wired via `.github/workflows/wire-plainscan-dns.yml` (since archived after one-shot run). Cloudflare zone `bcb5522993ecf90a4f1d5dfe101e5a5c`.

## Hive-Ops Overrides

H05 and H21 resolved 2026-05-15 (locales shipped; planet entry already live).
H08, H11, H12, H13, H15 remain in WARN covering Phase 4 onboarding-stack work
— extended target: ship before 2026-06-08 expiry.

```yaml
overrides:
  - rule: H08
    mode: warn
    reason: "OG image not yet generated; engine has SVG fallback diagrams for in-product imagery. Asset generated as part of Phase 4 onboarding-stack work."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H11
    mode: warn
    reason: "HiveInstallHint not yet wired; canonical onboarding stack lands in Phase 4."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H12
    mode: warn
    reason: "HiveFirstVisitExplainer not yet wired; Phase 4."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H13
    mode: warn
    reason: "public/hive-logo-full.png not yet copied from @hive/onboarding; asset port is part of Phase 4 onboarding stack work."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
  - rule: H15
    mode: warn
    reason: "Favicon binaries not generated this PR — manifest.json declares them but actual PNG files are a Phase 4 asset commit."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-08
```
