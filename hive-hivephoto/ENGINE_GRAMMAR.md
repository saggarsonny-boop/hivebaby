---
engine: HivePhoto
id: hivephoto
domain: hivephoto.hive.baby
repo: saggarsonny-boop/hive-hivephoto
owner: saggarsonny-boop

version: 1.1.0
status: live
tier: 2
schema: photo-intelligence
stack: [nextjs, typescript, tailwind, clerk, neon, r2, anthropic, stripe]
premium: true
cost_profile: high_marginal
engine_class: nextjs

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: clear, calm, privacy-first

api_models:
  - { role: photo_intelligence, model_id: claude-opus-4-5 }
env_vars_required:
  - ANTHROPIC_API_KEY
  - DATABASE_URL
  - CLERK_SK
  - CLERK_PK
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  - R2_ACCESS_KEY_ID
  - R2_SECRET_ACCESS_KEY
  - R2_BUCKET
  - R2_ACCOUNT_ID
  - CRON_SECRET
  - NEXT_PUBLIC_APP_URL
health_check: /api/health

onboarding_stack:
  auto_demo: implemented
  first_visit_card: implemented
  tooltip_tour: implemented
  rotating_placeholders: implemented

vercel_project: hive-hivephoto
deployment_protection: off

visibility: public
commercial_surface: freemium
viral_loop_targets: []

# launch_checklist_state — every item validated as part of PR #125,
# the canonical schema migration. Cross-references:
#   - test_slot               docs/engine-archives/hive-hivephoto/test-station-slot.md
#   - seo_layout              app/layout.tsx (full Metadata + Viewport + OG + Twitter + manifest)
#   - tooltip_tour            existing FirstVisitCard / AutoDemo / shared onboarding components
#   - planet_or_udnav         public/index.html ENGINES + engines.json entry
#   - env_vars_confirmed      Vercel project hive-hivephoto (Clerk + Neon + Stripe + R2 + Anthropic all set)
#   - health_check            app/api/health/route.ts
#   - health_workflow_listed  .github/workflows/health-check.yml (HivePhoto row)
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

# ENGINE GRAMMAR — HivePhoto

## Purpose
AI-powered photo intelligence. Upload, search, and understand your
photos. Face recognition, semantic search, geolocation mapping, and
duplicate detection — all in a private library.

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

## Rules
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
- No model training on user photos
- No cross-user data leakage at any layer (DB row, R2 path, signed URL)

## Premium Locks
- **Free tier:** 50 GB storage; full upload + search + face detection;
  Stripe `STRIPE_PRICE_FREE` (synthetic — never charged)
- **Plus tier:** $0.97 / month per CLAUDE.md §A pricing; 500 GB storage;
  unlocks unlimited semantic search and bulk-tagging
- **Pro tier:** $29 / month; 2 TB storage + power features (advanced
  duplicate triage, smart album auto-cuts, family sharing slots)
- **Founding tier:** historical $9 / month grandfathered; auto-closes
  via DB trigger when slots are full
- Photos are never deleted on downgrade — storage tier just gates
  uploads. The `no_delete_on_downgrade` rule above is the invariant.

## Phase Plan
1. ✅ Scaffold (auth, schema, R2, Clerk, Stripe, basic gallery)
2. ✅ AI ingest pipeline (titles, descriptions, faces, semantic embeddings)
3. ✅ Search (vector + keyword)
4. ✅ Stripe billing (free / plus / pro / founding)
5. Public landing + canonical Hive integration (this PR)
6. Polish: bulk operations, family sharing, smart albums

## Out of Scope
- Public photo galleries (deliberate — this is a private-library engine)
- ML training on user data (privacy invariant)
- Generic image generation (handled by HiveImagine)

## Deployment Notes
- Vercel project: `hive-hivephoto`
- Domain: hivephoto.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: OFF
- Auto-deploy on push to main
- Locale strings in `locales/en.json` (source of truth) + 6 Hive canonical
  locales (es, fr, ar, hi, zh, pt). Translations land in a follow-up PR;
  every locale ships English content today so the loader has a stable
  shape.
- Service worker at `public/sw.js` does stale-while-revalidate on the app
  shell only; never caches `/api/*` so a stale photo / search / Stripe
  response cannot leak across users on a shared device.
