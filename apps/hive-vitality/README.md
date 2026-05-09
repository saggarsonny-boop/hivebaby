# HiveVitality

Daily 15-minute mobility ritual: Tibetan Rites + balance + squat + hinge + plank + bridges + sumo squats. Reps ramp from 3 to 21 over 10 weeks. Identity-reinforcing daily practice.

> "Vitality" is intentional shorthand for sexual function, energy, and presence — globally adoptable language for an audience that wouldn't click a "fitness" CTA.

## What you do each day

15 minutes, in this order, with the mantra **"Balance after One, Squat and Hinge after Three"**:

1. **Tibetan 1** → single-leg balance (5-count eyes open + 5-count eyes closed, each side)
2. **Tibetan 2**
3. **Tibetan 3** → deep squat hold (20-30s) + slow hip hinge × 5
4. **Tibetan 4** → 21 bridge holds
5. **Figure-4 stretch** + 80-count plank
6. **Tibetan 5** → 21 sumo squats

Then a **10-second daily reflection**, plus a **weekly check-in** and **monthly milestones** (30 / 90 / 365 days).

## Stack

- Next.js 16.2 + React 19 + TypeScript strict + Tailwind v4
- Anthropic SDK (claude-sonnet-4 for the optional reflection-coaching call)
- Neon Postgres for session log + streak tracking
- Vendored `@queen-bee/client` for runtime governance per [WIRING_QUEEN_BEE.md](./WIRING_QUEEN_BEE.md)

## Pricing model

| Tier | Year 1 | Year 2+ |
|---|---|---|
| Free | unlimited (full ritual, basic streak) | unlimited |
| **Basic** | — | $4 / mo (preset reflection prompts) |
| **Pro** | — | $8 / mo (preset partner skins) |
| **Premium** | — | $12 / mo (fully customisable AI Activity Partner — separate engine, post-Q B) |

All tiers free for Year 1 except a $1/year unlock to keep abuse signal honest while adoption ramps. AI Activity Partner is a separate engine and is **out of scope** for this v0.1.

## Status

- v0.1 (this repo): scaffold + ritual UI + DB + Queen Bee consumption
- v0.2: AI Tibetan Rites imagery, 7-locale catalog completion (es/fr/ar/hi/zh/pt), Stripe Year 1 $1/year flow
- v0.3: AI Activity Partner integration (separate engine, governed by QB)

## Required env vars

```
ANTHROPIC_API_KEY     # optional — engine works without it for v0.1
DATABASE_URL          # Neon connection string (with sslmode=require)
QUEEN_BEE_URL         # optional — defaults to https://queenbee.hive.baby
NEXT_PUBLIC_APP_URL   # https://vitality.hive.baby
```

## Health

`GET /api/health` returns `{engine: "HiveVitality", version: "0.1.0", ok: true, features: {database, anthropic, queen_bee_url}}`.
