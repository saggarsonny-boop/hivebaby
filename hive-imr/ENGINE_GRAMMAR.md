# ENGINE GRAMMAR — HiveIMR

<GrapplerHook>
engine: HiveIMR
id: hiveimr
version: 0.1.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
status: live
tier: 1
schema: intelligent-medical-records
stack: [nextjs, typescript, tailwind, anthropic, neon-postgres]
</GrapplerHook>

## Engine Identity
- **Name:** HiveIMR
- **Domain:** hiveimr.hive.baby
- **Repo:** saggarsonny-boop/hivebaby (subdir `hive-imr/`)
- **Status:** Live (Tier 1)
- **Stack:** Next.js + TypeScript + Tailwind + Anthropic SDK + Neon PostgreSQL

## Purpose
The post-EMR substrate. EMRs were built for billing; the IMR is built for care.
Role-aware, AI-native, patient-centred medical records. Eight clinical roles, four
AI prompt types (handoff, clinical summary, discharge summary, order justification),
auditable generations, free at the base tier.

## Inputs
- Role selection (eight roles: physician, ED, nurse, radiologist, pharmacist, allied, admin, viewer)
- Patient context (demo loop: Marcus Chen, Dorothy Okafor, Raymond Alcazar)
- Free-text prompt for AI panel

## Outputs
- Drafted note in role voice (signed by clinician)
- Order with audit trail
- Clinical summary / discharge summary

## Rules
- AI generations always auditable (signed, signed_by, signed_at, audit_logged)
- Patient data never leaves the server unencrypted
- ANTHROPIC_API_KEY never shipped to the browser
- Safety-critical info always free
- Health disclaimer on every page: "This is not medical advice. Always consult a qualified clinician."

## Onboarding Stack
- Auto-demo (Phase 6)
- First-visit card (Phase 6)
- Tooltip tour: 5 stops — role selector, patient list, clinical view, AI panel, orders tab (Phase 6)
- Rotating placeholders (Phase 6)

## Safety Templates
- Always cite sources for clinical reference data
- Never claim authority equivalent to a clinician
- Defer to local protocols where they exist
- Drug recall / safety-critical info always free

## Multilingual Ribbon
- Status: pending

## Premium Locks
- None at base tier; free forever for individual clinicians
- Institutional pricing TBD post-prototype

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (remote)
- Safety level: enabled
- Tone: clinical, precise, role-aware

## API Model Strings
- Anthropic: `claude-opus-4-5` (clinical generation)

## Deployment Notes
- Vercel project: `hive-imr` (subdir of hivebaby repo, root directory `hive-imr/`)
- Domain: hiveimr.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: OFF
- Required env vars: `ANTHROPIC_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`
- Health check: `GET /api/health`

## Phase Plan
1. ✅ Scaffold
2. ✅ Thomas's component + AI route hardened to `/api/ai/generate`
3. Neon schema (patients, sessions, ai_generations, orders) + demo seed
4. Cookie-based role selector at `/login`
5. AI route hardening (handoff / clinical summary / discharge / order justification)
6. Tooltip tour
7. test.hive.baby station entry (HIMR-0001+)
8. White paper outreach (parallel track, owner: Sonny)

## Out of Scope (Phase 1)
- Stripe, Clerk, file uploads, multi-tenant, HIPAA infrastructure.

## Hive-Ops Overrides

```yaml
overrides:
  - rule: H03
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: public/ directory present
    # message:  public/ directory missing
  - rule: H04
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: locales/ directory present
    # message:  locales/ directory missing — strings must be externalized
  - rule: H05
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: all 7 canonical free-tier locales present (en, es, fr, ar, hi, zh, pt)
    # message:  missing locales/en.json, locales/es.json, locales/fr.json, locales/ar.json, locales/hi.json, locales/zh.json, locales/pt.json
  - rule: H06
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: navigator.language detection wired in strings loader
    # message:  no navigator.language reference in strings loader candidates
  - rule: H08
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: public/og.png present
    # message:  public/og.png missing — share previews fall back to Vercel default
  - rule: H09
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: robots.txt present (public/ or app/robots.ts)
    # message:  none of public/robots.txt, app/robots.ts, src/app/robots.ts exists
  - rule: H10
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: sitemap present (public/sitemap.xml or app/sitemap.ts)
    # message:  none of public/sitemap.xml, app/sitemap.ts, src/app/sitemap.ts exists
  - rule: H11
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: PWA install hint banner present (HiveInstallHint or local equivalent)
    # message:  no install-hint reference in primary surface files
  - rule: H12
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: first-visit explainer present (HiveFirstVisitExplainer or local equivalent)
    # message:  no FirstVisitExplainer reference in primary surface files
  - rule: H13
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: HIVE_HEADER_LOGO — public/hive-logo-full.png copied
    # message:  public/hive-logo-full.png|webp missing
  - rule: H14
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: HIVE_FOOTER_SIGNATURE — "Made with ♥ in the Hive" rendered
    # message:  no "Made with ♥ in the Hive" reference in footer/page/layout
  - rule: H15
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: FAVICON_COMPLETE — full canonical favicon set in public/
    # message:  missing public/favicon.ico, public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
  - rule: H16
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: THEME_COLOR_CANONICAL — #D4AF37 in metadata + manifest
    # message:  #D4AF37 missing from both layout themeColor and manifest theme_color
  - rule: H17
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: APPLE_WEB_APP_META — metadata.appleWebApp configured
    # message:  metadata.appleWebApp missing — iOS standalone status bar will default
  - rule: H18
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: MANIFEST_COMPLETE — public/manifest.json has canonical fields
    # message:  public/manifest.json missing
  - rule: H19
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: ENGINE_GRAMMAR.md present in repo root with frontmatter
    # message:  ENGINE_GRAMMAR.md present but no YAML frontmatter detected
  - rule: H20
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: service worker registrar present
    # message:  none of public/sw.js, public/service-worker.js, app/_lib/ServiceWorkerRegistrar.tsx, src/app/_lib/ServiceWorkerRegistrar.tsx present
  - rule: H21
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: engine entry present in hivebaby planet ENGINES array
    # message:  no reference to hive-imr in hivebaby planet/registry candidates
  - rule: H22
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: Hive gold #D4AF37 referenced in component / styles
    # message:  #D4AF37 not referenced in layout/page/globals
  - rule: H23
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: canonical dark ink #0a0a0a referenced
    # message:  canonical ink #0a0a0a not referenced — engine may read as a stranger
  - rule: H24
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: manifest registered in layout (<link rel="manifest"...>)
    # message:  manifest not registered in layout — install prompts may not fire
  - rule: H25
    mode: warn
    reason: "Engine pre-dates canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#97; warn-mode for 30 days while migration scope is defined against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/97"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: viewport meta with width=device-width set in layout
    # message:  no viewport export / device-width meta in layout — mobile rendering breaks
```
