---
engine: HiveAestheticBestie
id: hiveaestheticbestie
domain: hiveaestheticbestie.hive.baby
repo: saggarsonny-boop/hive-aestheticbestie
owner: saggarsonny-boop

version: 0.1.0
status: live
tier: 1
schema: aesthetic-identity
stack: [nextjs, typescript, tailwind, anthropic]
premium: false

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: pending
tone: warm, affirming, identity-forward

api_models:
  - { role: aesthetic analysis, model_id: claude-opus-4-5 }
env_vars_required: [ANTHROPIC_API_KEY, NEXT_PUBLIC_APP_URL]
# health_check: unknown — engine has no /api/health declared in
# README or ENGINE_GRAMMAR. Field intentionally omitted.
onboarding_stack:
  auto_demo: implemented
  first_visit_card: implemented
  tooltip_tour: implemented
  rotating_placeholders: implemented

vercel_project: hive-aestheticbestie
deployment_protection: off

visibility: public
commercial_surface: none
viral_loop_targets: []
# launch_checklist_state — declared per schema §2.6. Booleans below
# are honest defaults: true only where the existing ENGINE_GRAMMAR
# or CLAUDE.md table provides direct evidence. The remaining four
# are false pending a real audit; V19 will fail until they are
# verified or set true.
launch_checklist_state:
  test_slot: false
  seo_layout: false
  tooltip_tour: true
  planet_or_udnav: true
  env_vars_confirmed: true
  health_check: false
  health_workflow_listed: false
  engine_count_updated: true
production_state: listed
last_audit_at: 2026-05-03
---

# ENGINE GRAMMAR — HiveAestheticBestie

## Purpose
Instant aesthetic reflection and identity resonance. Feels like
being seen by a best friend.

## Inputs
- Selfie upload (optional)
- Free-text vibe (optional)
- One tap to generate

## Outputs
- Aesthetic label
- Three-color palette
- One mood sentence
- One outfit suggestion

## Rules
- Always affirming
- Always identity-forward
- No appearance criticism
- No beauty standards
- No negativity

## Safety Templates
- No critique of appearance
- No body-shaming language
- No gender assumptions without user indication

## Deployment Notes
- Auto-deploy on push to main
- Cloudflare CNAME → cname.vercel-dns.com

## Hive-Ops Overrides

```yaml
overrides:
  - rule: H03
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: public/ directory present
    # message:  public/ directory missing
  - rule: H04
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: locales/ directory present
    # message:  locales/ directory missing — strings must be externalized
  - rule: H05
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: all 7 canonical free-tier locales present (en, es, fr, ar, hi, zh, pt)
    # message:  missing locales/en.json, locales/es.json, locales/fr.json, locales/ar.json, locales/hi.json, locales/zh.json, locales/pt.json
  - rule: H06
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: navigator.language detection wired in strings loader
    # message:  no navigator.language reference in strings loader candidates
  - rule: H08
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: public/og.png present
    # message:  public/og.png missing — share previews fall back to Vercel default
  - rule: H09
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: robots.txt present (public/ or app/robots.ts)
    # message:  none of public/robots.txt, app/robots.ts, src/app/robots.ts exists
  - rule: H10
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: sitemap present (public/sitemap.xml or app/sitemap.ts)
    # message:  none of public/sitemap.xml, app/sitemap.ts, src/app/sitemap.ts exists
  - rule: H11
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: PWA install hint banner present (HiveInstallHint or local equivalent)
    # message:  no install-hint reference in primary surface files
  - rule: H12
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: first-visit explainer present (HiveFirstVisitExplainer or local equivalent)
    # message:  no FirstVisitExplainer reference in primary surface files
  - rule: H13
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: HIVE_HEADER_LOGO — public/hive-logo-full.png copied
    # message:  public/hive-logo-full.png|webp missing
  - rule: H14
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: HIVE_FOOTER_SIGNATURE — "Made with ♥ in the Hive" rendered
    # message:  no "Made with ♥ in the Hive" reference in footer/page/layout
  - rule: H15
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: FAVICON_COMPLETE — full canonical favicon set in public/
    # message:  missing public/favicon.ico, public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
  - rule: H16
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: THEME_COLOR_CANONICAL — #D4AF37 in metadata + manifest
    # message:  #D4AF37 missing from both layout themeColor and manifest theme_color
  - rule: H17
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: APPLE_WEB_APP_META — metadata.appleWebApp configured
    # message:  metadata.appleWebApp missing — iOS standalone status bar will default
  - rule: H18
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: MANIFEST_COMPLETE — public/manifest.json has canonical fields
    # message:  public/manifest.json missing
  - rule: H20
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: service worker registrar present
    # message:  none of public/sw.js, public/service-worker.js, app/_lib/ServiceWorkerRegistrar.tsx, src/app/_lib/ServiceWorkerRegistrar.tsx present
  - rule: H21
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: engine entry present in hivebaby planet ENGINES array
    # message:  no reference to hive-aestheticbestie in hivebaby planet/registry candidates
  - rule: H22
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: Hive gold #D4AF37 referenced in component / styles
    # message:  #D4AF37 not referenced in layout/page/globals
  - rule: H23
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: canonical dark ink #0a0a0a referenced
    # message:  canonical ink #0a0a0a not referenced — engine may read as a stranger
  - rule: H24
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: manifest registered in layout (<link rel="manifest"...>)
    # message:  manifest not registered in layout — install prompts may not fire
  - rule: H25
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: viewport meta with width=device-width set in layout
    # message:  no viewport export / device-width meta in layout — mobile rendering breaks
  - rule: V19
    mode: warn
    reason: "Hive-aestheticbestie pre-dates the canonical HiveOps v0.1+ Hive-integration standards. Full remediation tracked in hivebaby#93; warn-mode for 30 days while the canonical-finalization PR is scoped against the parkback / ud-converter templates."
    issue: "https://github.com/saggarsonny-boop/hivebaby/issues/93"
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-06-05
    # original: live → checklist all true
    # message:  not true: test_slot, seo_layout, health_check, health_workflow_listed
```
