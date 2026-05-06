# ENGINE GRAMMAR — HivePhoto

<GrapplerHook>
engine: HivePhoto
id: hivephoto
version: 1.0.0
governance: QueenBee.MasterGrappler
safety: standard
multilingual: pending
premium: true
status: building
tier: 2
schema: photo-intelligence
stack: [nextjs, typescript, tailwind, clerk, neon, r2, anthropic, stripe]
</GrapplerHook>

## Engine Identity
- **Name:** HivePhoto
- **Domain:** hivephoto.hive.baby
- **Repo:** saggarsonny-boop/hive-hivephoto
- **Status:** Building (Tier 2)
- **Stack:** Next.js + TypeScript + Tailwind + Clerk + Neon + R2 + Anthropic SDK + Stripe

## Purpose
AI-powered photo intelligence. Upload, search, and understand your photos. Face recognition, semantic search, geolocation mapping, and duplicate detection.

## Inputs
- Photo uploads (JPEG, PNG, HEIC, WebP)
- Search queries (natural language)
- Face labels

## Outputs
- AI-generated photo titles and descriptions
- Face detection and labelling
- Semantic search results
- Geographic photo map
- Duplicate detection report
- Storage usage stats

## GrapplerHook Rules
- `owner_check`: `photo.user_id === clerk.userId` on every request
- `storage_limit`: checked on presign via `checkStorageLimit()`
- `no_delete_on_downgrade`: photos always accessible regardless of tier
- `cron_secret`: `x-cron-secret` header required on all cron routes via `validateCronSecret()`
- `max_retries`: 3 per photo, enforced via `enforceMaxRetries()`
- `founding_slots`: auto-close via DB trigger (no application-layer enforcement needed)

## Safety Templates
- Auth: Clerk session required on all non-public routes
- Data: Row-level ownership enforced on every DB query
- Storage: Pre-signed URLs expire after 15 minutes

## Multilingual Ribbon
- Status: pending

## Premium Locks
- Free tier: 50 GB storage
- Pro tier: configurable via Stripe

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (remote)
- Safety level: standard
- Tone: neutral, factual

## API Model Strings
- Anthropic: `claude-opus-4-5` (photo analysis)
- Clerk: authentication
- Neon: PostgreSQL (serverless)
- AWS S3 / R2: object storage

## Deployment Notes
- Vercel: auto-deploy on push to main
- Domain: hivephoto.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: OFF

## Hive-Ops Overrides

```yaml
overrides:
  - rule: H04
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: locales/ directory present
    # message:  locales/ directory missing — strings must be externalized
  - rule: H05
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: all 7 canonical free-tier locales present (en, es, fr, ar, hi, zh, pt)
    # message:  missing locales/en.json, locales/es.json, locales/fr.json, locales/ar.json, locales/hi.json, locales/zh.json, locales/pt.json
  - rule: H06
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: navigator.language detection wired in strings loader
    # message:  no navigator.language reference in strings loader candidates
  - rule: H08
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: public/og.png present
    # message:  public/og.png missing — share previews fall back to Vercel default
  - rule: H09
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: robots.txt present (public/ or app/robots.ts)
    # message:  none of public/robots.txt, app/robots.ts, src/app/robots.ts exists
  - rule: H10
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: sitemap present (public/sitemap.xml or app/sitemap.ts)
    # message:  none of public/sitemap.xml, app/sitemap.ts, src/app/sitemap.ts exists
  - rule: H11
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: PWA install hint banner present (HiveInstallHint or local equivalent)
    # message:  no install-hint reference in primary surface files
  - rule: H12
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: first-visit explainer present (HiveFirstVisitExplainer or local equivalent)
    # message:  no FirstVisitExplainer reference in primary surface files
  - rule: H13
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: HIVE_HEADER_LOGO — public/hive-logo-full.png copied
    # message:  public/hive-logo-full.png|webp missing
  - rule: H14
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: HIVE_FOOTER_SIGNATURE — "Made with ♥ in the Hive" rendered
    # message:  no "Made with ♥ in the Hive" reference in footer/page/layout
  - rule: H15
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: FAVICON_COMPLETE — full canonical favicon set in public/
    # message:  missing public/favicon.ico, public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
  - rule: H16
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: THEME_COLOR_CANONICAL — #D4AF37 in metadata + manifest
    # message:  #D4AF37 missing from both layout themeColor and manifest theme_color
  - rule: H17
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: APPLE_WEB_APP_META — metadata.appleWebApp configured
    # message:  metadata.appleWebApp missing — iOS standalone status bar will default
  - rule: H18
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: MANIFEST_COMPLETE — public/manifest.json has canonical fields
    # message:  public/manifest.json missing
  - rule: H19
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: ENGINE_GRAMMAR.md present in repo root with frontmatter
    # message:  ENGINE_GRAMMAR.md present but no YAML frontmatter detected
  - rule: H20
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: service worker registrar present
    # message:  none of public/sw.js, public/service-worker.js, app/_lib/ServiceWorkerRegistrar.tsx, src/app/_lib/ServiceWorkerRegistrar.tsx present
  - rule: H21
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: engine entry present in hivebaby planet ENGINES array
    # message:  no reference to hive-hivephoto in hivebaby planet/registry candidates
  - rule: H22
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: Hive gold #D4AF37 referenced in component / styles
    # message:  #D4AF37 not referenced in layout/page/globals
  - rule: H23
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: canonical dark ink #0a0a0a referenced
    # message:  canonical ink #0a0a0a not referenced — engine may read as a stranger
  - rule: H24
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: manifest registered in layout (<link rel="manifest"...>)
    # message:  manifest not registered in layout — install prompts may not fire
  - rule: H25
    mode: warn
    reason: "Hive-hivephoto pre-dates canonical HiveOps v0.1+ standards and still uses legacy <GrapplerHook> grammar shape (V-rules cannot run). Full remediation tracked in hivebaby#95; warn-mode for 30 days while migration to canonical YAML frontmatter + Hive-integration items is scoped."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/95"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: viewport meta with width=device-width set in layout
    # message:  no viewport export / device-width meta in layout — mobile rendering breaks
```
