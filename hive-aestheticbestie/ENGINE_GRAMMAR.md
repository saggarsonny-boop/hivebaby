---
engine: HiveAestheticBestie
id: hiveaestheticbestie
domain: hiveaestheticbestie.hive.baby
repo: saggarsonny-boop/hive-aestheticbestie
owner: saggarsonny-boop

version: 0.2.0
status: live
tier: 1
schema: aesthetic-identity
stack: [nextjs, typescript, tailwind, anthropic]
premium: false
cost_profile: medium_marginal
engine_class: nextjs

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: warm, affirming, identity-forward

api_models:
  - { role: aesthetic_analysis, model_id: claude-opus-4-5 }
env_vars_required: [ANTHROPIC_API_KEY, NEXT_PUBLIC_APP_URL]
health_check: /api/health

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

# launch_checklist_state — every item validated as part of PR #119,
# the canonical schema migration. Cross-references:
#   - test_slot               docs/engine-archives/hive-aestheticbestie/test-station-slot.md
#   - seo_layout              app/layout.tsx (full Metadata + Viewport + OG + Twitter)
#   - tooltip_tour            components/TooltipTour.tsx
#   - planet_or_udnav         public/index.html ENGINES + engines.json entry
#   - env_vars_confirmed      Vercel project hive-aestheticbestie (ANTHROPIC_API_KEY set)
#   - health_check            app/api/health/route.ts
#   - health_workflow_listed  .github/workflows/health-check.yml line 82
#   - engine_count_updated    registry/engines.md + CLAUDE.md §D table
launch_checklist_state:
  test_slot: true
  seo_layout: true
  tooltip_tour: true
  planet_or_udnav: true
  env_vars_confirmed: true
  health_check: true
  health_workflow_listed: true
  engine_count_updated: true

production_state: listed
last_audit_at: 2026-05-08
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
- Auto-deploy on push to main via Vercel
- Cloudflare CNAME → cname.vercel-dns.com
- Locale strings in `locales/en.json` (source of truth) + 6 Hive canonical
  locales (es, fr, ar, hi, zh, pt). Translations land in a follow-up PR;
  every locale ships English content today so the loader has a stable shape.
- Service worker at `public/sw.js` does stale-while-revalidate on the app
  shell only; never caches `/api/*`.
