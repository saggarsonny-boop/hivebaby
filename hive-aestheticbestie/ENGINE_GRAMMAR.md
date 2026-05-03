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
