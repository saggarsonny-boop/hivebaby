# ENGINE GRAMMAR — HivePlainScan

<GrapplerHook>
engine: HivePlainScan
id: hiveplainscan
version: 0.1.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
status: building
tier: 1
schema: radiology-report-explanation
stack: [nextjs, typescript, tailwind, anthropic]
</GrapplerHook>

## Engine Identity
- **Name:** HivePlainScan
- **Domain:** plainscan.hive.baby (alias: scan.hive.baby)
- **Repo:** saggarsonny-boop/hivebaby (subdir `apps/hive-plainscan/`)
- **Status:** Building (Tier 1)
- **Stack:** Next.js + TypeScript + Tailwind + Anthropic SDK

## Purpose
HivePlainScan is a patient education tool. It explains finalized radiology
reports in plain English. It does not diagnose, interpret raw scan images,
recommend treatment, or replace a physician.

## Inputs
- Pasted text from a finalized radiology report
- Uploaded PDF report (text-extractable)
- Uploaded photograph or screenshot of a report (JPEG / PNG)

## Outputs
- Plain-English summary at 6th to 8th grade reading level
- Findings table: medical term, plain-English translation, location, severity, possible symptoms
- 5 to 7 questions to bring to the patient's doctor
- Red-flag highlights when present
- Downloadable PDF summary
- Downloadable Universal Document Sealed (.uds) export

## Rules
- Never show a finding without its plain-English translation beside it
- Never expose raw error stack traces to the user
- Reading level: 6th to 8th grade
- Disclaimer always renders below results, never hidden
- Words that must not appear in copy: delve, leverage, paradigm, game-changer, meticulous
- No em dashes in UI copy
- ANTHROPIC_API_KEY never shipped to the browser

## Onboarding Stack
- Auto-demo: pending
- First-visit card: pending
- Tooltip tour: pending
- Rotating placeholders: implemented (textarea cycles through real use cases)

## Safety Templates
- Health disclaimer on results and PDF: educational, not diagnostic
- Red-flag box surfaces findings the report itself flags as needing prompt attention
- Defer to the patient's clinician for interpretation

## Multilingual Ribbon
- Status: pending

## Premium Locks
- None at base tier; free forever for individual patients

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (remote)
- Safety level: enabled
- Tone: warm, plain, calm, factual

## API Model Strings
- Anthropic: `claude-sonnet-4-20250514`

## Deployment Notes
- Vercel project: `hive-plainscan` (root directory `apps/hive-plainscan/`)
- Domain: plainscan.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: OFF
- Required env vars: `ANTHROPIC_API_KEY`
- Health check: `GET /api/health`

## Phase Plan
1. Scaffold app, components, API routes, PDF/UDS export
2. Vercel deploy + DNS (plainscan.hive.baby and scan.hive.baby alias)
3. Add to test.hive.baby engine_slots with 10-item checklist
4. Add to planet surface as a hexagonal cell
5. Onboarding stack (auto-demo, first-visit card, tooltip tour)
6. Multilingual ribbon

## Out of Scope (Phase 1)
- Stripe, Clerk, file storage, multi-tenant, HIPAA infrastructure, OCR for scanned PDFs (use the Image tab instead).

## Hive-Ops Overrides

```yaml
overrides:
  - rule: H03
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: public/ directory present
    # message:  public/ directory missing
  - rule: H04
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: locales/ directory present
    # message:  locales/ directory missing — strings must be externalized
  - rule: H05
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: all 7 canonical free-tier locales present (en, es, fr, ar, hi, zh, pt)
    # message:  missing locales/en.json, locales/es.json, locales/fr.json, locales/ar.json, locales/hi.json, locales/zh.json, locales/pt.json
  - rule: H06
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: navigator.language detection wired in strings loader
    # message:  no navigator.language reference in strings loader candidates
  - rule: H08
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: public/og.png present
    # message:  public/og.png missing — share previews fall back to Vercel default
  - rule: H09
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: robots.txt present (public/ or app/robots.ts)
    # message:  none of public/robots.txt, app/robots.ts, src/app/robots.ts exists
  - rule: H10
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: sitemap present (public/sitemap.xml or app/sitemap.ts)
    # message:  none of public/sitemap.xml, app/sitemap.ts, src/app/sitemap.ts exists
  - rule: H11
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: PWA install hint banner present (HiveInstallHint or local equivalent)
    # message:  no install-hint reference in primary surface files
  - rule: H12
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: first-visit explainer present (HiveFirstVisitExplainer or local equivalent)
    # message:  no FirstVisitExplainer reference in primary surface files
  - rule: H13
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: HIVE_HEADER_LOGO — public/hive-logo-full.png copied
    # message:  public/hive-logo-full.png|webp missing
  - rule: H14
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: HIVE_FOOTER_SIGNATURE — "Made with ♥ in the Hive" rendered
    # message:  no "Made with ♥ in the Hive" reference in footer/page/layout
  - rule: H15
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: FAVICON_COMPLETE — full canonical favicon set in public/
    # message:  missing public/favicon.ico, public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
  - rule: H16
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: THEME_COLOR_CANONICAL — #D4AF37 in metadata + manifest
    # message:  #D4AF37 missing from both layout themeColor and manifest theme_color
  - rule: H17
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: APPLE_WEB_APP_META — metadata.appleWebApp configured
    # message:  metadata.appleWebApp missing — iOS standalone status bar will default
  - rule: H18
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: MANIFEST_COMPLETE — public/manifest.json has canonical fields
    # message:  public/manifest.json missing
  - rule: H19
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: ENGINE_GRAMMAR.md present in repo root with frontmatter
    # message:  ENGINE_GRAMMAR.md present but no YAML frontmatter detected
  - rule: H20
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: service worker registrar present
    # message:  none of public/sw.js, public/service-worker.js, app/_lib/ServiceWorkerRegistrar.tsx, src/app/_lib/ServiceWorkerRegistrar.tsx present
  - rule: H21
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: engine entry present in hivebaby planet ENGINES array
    # message:  no reference to hive-plainscan in hivebaby planet/registry candidates
  - rule: H22
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: Hive gold #D4AF37 referenced in component / styles
    # message:  #D4AF37 not referenced in layout/page/globals
  - rule: H23
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: canonical dark ink #0a0a0a referenced
    # message:  canonical ink #0a0a0a not referenced — engine may read as a stranger
  - rule: H24
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: manifest registered in layout (<link rel="manifest"...>)
    # message:  manifest not registered in layout — install prompts may not fire
  - rule: H25
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: viewport meta with width=device-width set in layout
    # message:  no viewport export / device-width meta in layout — mobile rendering breaks
  - rule: H26
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Legacy <GrapplerHook> grammar shape (V-rules cannot run). Full migration tracked in hivebaby#101; warn-mode for 30 days."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/101"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: .env.example or env_vars_required documented
    # message:  neither .env.example nor env_vars_required in grammar
```
