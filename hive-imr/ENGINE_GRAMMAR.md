---
engine: HiveIMR
id: hiveimr
domain: hiveimr.hive.baby
repo: saggarsonny-boop/hivebaby
owner: saggarsonny-boop

version: 0.2.0
status: live
tier: 1
schema: intelligent-medical-records
stack: [nextjs, typescript, tailwind, anthropic, neon-postgres]
premium: false
cost_profile: medium_marginal
engine_class: nextjs

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: clinical, precise, role-aware

api_models:
  - { role: clinical_generation, model_id: claude-opus-4-5 }
env_vars_required: [ANTHROPIC_API_KEY, DATABASE_URL, SESSION_SECRET, NEXT_PUBLIC_APP_URL]
health_check: /api/health

onboarding_stack:
  auto_demo: implemented
  first_visit_card: implemented
  tooltip_tour: implemented
  rotating_placeholders: implemented

vercel_project: hive-imr
deployment_protection: off

visibility: public
commercial_surface: none
viral_loop_targets: []

# launch_checklist_state — every item validated as part of PR #122,
# the canonical schema migration. Cross-references:
#   - test_slot               docs/engine-archives/hive-imr/test-station-slot.md
#   - seo_layout              app/layout.tsx (full Metadata + Viewport + OG + Twitter + manifest)
#   - tooltip_tour            existing tour wired into the role surface
#   - planet_or_udnav         public/index.html ENGINES + engines.json entry
#   - env_vars_confirmed      Vercel project hive-imr (ANTHROPIC_API_KEY + DATABASE_URL set)
#   - health_check            app/api/health/route.ts
#   - health_workflow_listed  .github/workflows/health-check.yml (HiveIMR row)
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

# ENGINE GRAMMAR — HiveIMR

## Purpose
The post-EMR substrate. EMRs were built for billing; the IMR is built for
care. Role-aware, AI-native, patient-centred medical records. Eight
clinical roles, four AI prompt types (handoff, clinical summary,
discharge summary, order justification), auditable generations, free at
the base tier.

## Inputs
- Role selection (eight roles: physician, ED, nurse, radiologist,
  pharmacist, allied, admin, viewer)
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
- Health disclaimer on every page: "This is not medical advice. Always
  consult a qualified clinician."

## Safety Templates
- Always cite sources for clinical reference data
- Never claim authority equivalent to a clinician
- Defer to local protocols where they exist
- Drug recall / safety-critical info always free

## Phase Plan
1. ✅ Scaffold
2. ✅ Component + AI route hardened to `/api/ai/generate`
3. Neon schema (patients, sessions, ai_generations, orders) + demo seed
4. Cookie-based role selector at `/login`
5. AI route hardening (handoff / clinical summary / discharge /
   order justification)
6. Tooltip tour wired across role surface
7. test.hive.baby station entry (HIMR-0001+)
8. White paper outreach (parallel track, owner: Sonny)

## Out of Scope (Phase 1)
- Stripe, Clerk, file uploads, multi-tenant, HIPAA infrastructure.

## Deployment Notes
- Vercel project: `hive-imr` (subdir of hivebaby repo, root directory `hive-imr/`)
- Domain: hiveimr.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: OFF
- Auto-deploy on push to main
- Locale strings in `locales/en.json` (source of truth) + 6 Hive canonical
  locales (es, fr, ar, hi, zh, pt). Translations land in a follow-up PR;
  every locale ships English content today so the loader has a stable
  shape.
- Service worker at `public/sw.js` does stale-while-revalidate on the app
  shell only; never caches `/api/*` so a stale handoff or summary cannot
  mislead a clinician.
