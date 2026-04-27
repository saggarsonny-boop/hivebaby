# ENGINE_GRAMMAR.md — HiveBuyStuff

## GrapplerHook Metadata

```
engine_id: HiveBuyStuff
engine_slug: hivebuystuff
domain: hivebuystuff.hive.baby
alias: buy.hive.baby
repo: hivebaby/hive-hivebuystuff
stack: Next.js + TypeScript + Anthropic (claude-haiku-4-5-20251001) + Neon PostgreSQL
status: LIVE
category: procurement
```

## What it does
Procurement overlay. Stores the user's shopping templates, applies governance rules (budget tier, substitution tolerance, dietary constraints), and generates a backend-specific search cart link for Walmart, Target, Amazon, or Instacart. Hive is the brain. The vendors are the pipes.

## DB Schema
- `hbs_templates` — shopping lists with item metadata (jsonb)
- `hbs_preferences` — per-user settings (budget, substitution rules, dietary constraints)

## AI Model
`claude-haiku-4-5-20251001` — routes items to correct product names per backend and returns a structured JSON cart object with a search URL.

## Routes
- `GET /api/health` — health check
- `POST /api/hbs/migrate` — run DB migration once on deploy
- `GET/POST /api/hbs/templates` — list/create templates
- `DELETE /api/hbs/templates/[id]` — delete template
- `GET/POST /api/hbs/preferences` — get/set preferences
- `POST /api/hbs/route` — build cart via AI routing

## Onboarding
- TooltipTour on all three tabs (My Lists, Run a Cart, Settings)
- No auth — user_id generated client-side and stored in localStorage

## Footer
"No ads. No investors. No agenda. Free at the base tier, forever."
