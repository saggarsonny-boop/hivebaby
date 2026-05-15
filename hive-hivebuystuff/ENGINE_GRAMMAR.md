---
engine: HiveBuyStuff
id: hivebuystuff
domain: hivebuystuff.hive.baby
repo: saggarsonny-boop/hivebaby
owner: Hive
version: "0.2.0"
status: live
tier: low_marginal
schema: "1.0"
stack:
  - Next.js 16 (App Router)
  - TypeScript
  - Anthropic claude-haiku-4-5-20251001 (free/pro)
  - Anthropic claude-opus-4-7 (premium)
  - Neon PostgreSQL
  - Stripe
premium: true
governance:
  queen_bee: pending
safety:
  level: none
  disclaimer: false
multilingual: false
onboarding_stack:
  first_visit_card: implemented
  auto_demo: implemented
  install_hint: pending
  ahts_prompt: pending
vercel_project: hive-hivebuystuff
deployment_protection: off
visibility: public
commercial_surface:
  free_tier: "3 lists, 10 runs/month"
  pro_tier: "$4.99/mo — unlimited lists, 100 runs/month"
  premium_tier: "$9.99/mo — unlimited runs + Claude Opus routing"
  stripe_checkout: true
viral_loop_targets:
  - share cart result via Web Share API / clipboard
production_state: listed
cost_profile: low_marginal
last_audit_at: "2026-05-15"
launch_checklist_state:
  dns_configured: true
  vercel_deployed: true
  db_migrated: true
  health_endpoint: true
  env_vars_set: true
  hive_logo: true
  hive_footer: true
  planet_registered: true
---

## Purpose
Procurement routing engine. Users build reusable shopping templates once (with brand tier, substitution rules, and dietary constraints), then run them against any supported retailer. AI maps each item to a real product at that store and returns a ready search cart URL.

## Inputs
- Shopping template (list of items with qty, unit, brand_tier, perishable, substitution_allowed)
- Target backend: Walmart | Target | Amazon | Instacart | Kroger
- User preferences: substitution_tolerance, dietary_rules, budget_ceiling

## Outputs
- Mapped item list (original → store product, qty)
- Cart URL (retailer search link)
- Notes (substitutions or dietary filters applied)

## Rules
- substitution_allowed per item + substitution_tolerance global are two independent layers — apply both
- dietary_rules applied to every item regardless of substitution_allowed
- brand_tier: budget = store brand, mid = national brand, premium = organic/name brand
- Cart URLs are search links, not transactional deep links (V1 by design)

## Routes
- `GET /api/health` — health check
- `POST /api/hbs/migrate` — run DB migration
- `GET/POST /api/hbs/templates` — list/create templates (free tier: 3 max)
- `DELETE /api/hbs/templates/[id]` — delete (ownership-checked)
- `GET/POST /api/hbs/preferences` — get/set preferences
- `POST /api/hbs/route` — AI cart build (usage-metered)
- `GET /api/hbs/usage` — current tier + run count
- `POST /api/hbs/stripe/checkout` — create Stripe checkout session
- `POST /api/hbs/stripe/webhook` — Stripe webhook handler
- `POST /api/hbs/stripe/portal` — Stripe billing portal link

## DB Schema
- `hbs_templates` — shopping lists (jsonb items)
- `hbs_preferences` — per-user settings
- `hbs_usage` — monthly run counter per user
- `hbs_subscriptions` — tier + Stripe IDs

## Deployment Notes
Stripe env vars required in Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_PREMIUM_PRICE_ID`.
Webhook endpoint: `https://hivebuystuff.hive.baby/api/hbs/stripe/webhook`
Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Hive-Ops Overrides

```yaml
overrides:
  - rule: H05
    mode: waive
    reason: "No localisation in V1 — single-language procurement routing engine. I18n deferred to V2 when user base geography is known."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/166
    reviewer: Sonny
    date: 2026-05-15
  - rule: H08
    mode: warn
    reason: "OG image not generated yet. Will add custom social card before first marketing push."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/166
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-14
  - rule: H09
    mode: warn
    reason: "PWA install hint (HiveInstallHint) not yet wired — V1 is web-first. Extension-based V2 replaces need for install hint."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/166
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-14
  - rule: H10
    mode: warn
    reason: "AHTS prompt not yet wired — deferred to V2 alongside extension strategy."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/166
    reviewer: Sonny
    date: 2026-05-15
    warn_until: 2026-06-14
```
