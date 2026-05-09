---
engine: HiveVitality
id: hivevitality
domain: vitality.hive.baby
domain_aliases:
  - vitality.hive.baby
repo: saggarsonny-boop/hivebaby:apps/hive-vitality
owner: saggarsonny-boop

version: 0.1.0
status: building
tier: 1
schema: vitality-session-log
stack: [nextjs, typescript, tailwind, neon, anthropic, queen-bee]
premium: false

governance: QueenBee.MasterGrappler@v1
safety: enabled
multilingual: pending
tone: warm, plain-language, identity-reinforcing
cost_profile: zero_marginal

api_models:
  - role: reflection_coach
    model_id: claude-sonnet-4-20250514

env_vars_required:
  - DATABASE_URL
  - NEXT_PUBLIC_APP_URL

env_vars_optional:
  - ANTHROPIC_API_KEY
  - QUEEN_BEE_URL
  - QB_ENGINE_TOKEN

onboarding_stack:
  auto_demo: pending
  first_visit_card: implemented
  tooltip_tour: pending
  rotating_placeholders: implemented

vercel_project: hive-vitality
vercel_root_directory: apps/hive-vitality
deployment_protection: off
visibility: public
commercial_surface: donations
viral_loop_targets:
  - share_card
  - referral
production_state: not_listed
last_audit_at: 2026-05-09

health_check: /api/health

queen_bee_schemas:
  - vitality-session-log

planned:
  - ai_tibetan_imagery_v0.2
  - locales_v0.2 (es, fr, ar, hi, zh, pt — currently English only)
  - clerk_auth_v0.2 (synthetic anonymous IDs in v0.1)
  - stripe_year_one_dollar_v0.2
---

## Purpose

A daily 15-minute mobility ritual: Tibetan Rites + balance + deep squat hold + hip hinge + bridges + figure-4 stretch + plank + sumo squats. Reps ramp from 3 to 21 over 10 weeks (linear, +2/week for the Tibetan rep counts).

The product bet is **identity reinforcement, not workout tracking**. The post-ritual screen says "I am someone who moves every day" rather than "you burned X calories" — every UX decision flows from that frame. The mantra is **"Balance after One, Squat and Hinge after Three"**.

## Inputs

- Onboarding (Day 1 only): three 60-second screens (explanation, demo preview, identity imprint).
- Daily ritual: 14 components in fixed order (Tibetan 1 → balance left → balance right → Tibetan 2 → Tibetan 3 → squat hold → hip hinge → Tibetan 4 → bridges → figure-4 left → figure-4 right → plank → Tibetan 5 → sumo squats).
- Daily reflection: optional 10-second free-text + optional 1-5 mood rating.
- Weekly check-in: 1-5 mood rating with named labels (Heavy / Tired / Steady / Open / Light).

## Outputs

`vitality-session-log` JSON envelope POSTed to Queen Bee `/api/govern`:

- `userId` (required) — synthetic anonymous ID until Phase 2 wires Clerk
- `ritualDate` (required) — YYYY-MM-DD
- `durationSeconds` (required)
- `currentWeek` (required) — 1..10
- `completedComponents` (required) — array of component slugs
- `reflectionText` (optional)
- `moodRating` (optional) — 1..5

QB returns a `governanceStamp` which the engine persists in `hv_sessions.governance_stamp` (JSONB). HiveOps G05 detects this column.

## Rules

- The ritual sequence and the mantra are **invariant**; no PR may reorder them without an explicit Sonny review and a CHANGELOG entry.
- Tibetan rep counts ramp from 3 → 21 linearly over 10 weeks (+2/week). Other components are static.
- Streak forgiveness: missing **one** day does not break the streak. Two consecutive missed days resets to 0. Adherence is reported separately as a 30-day percentage.
- Milestones are recorded once, never reset: 30-day, 90-day, 1-year.
- The disclaimer "This is not medical advice. Always consult a qualified clinician." is rendered on every page footer.
- AI Activity Partner is **out of scope for v0.1** — declared as a separate engine, post-Queen-Bee.

## Safety Templates

Every page footer carries:
> No ads. No investors. No agenda.
> Free at the base tier, forever.
> This is not medical advice. Always consult a qualified clinician.

The ritual landing page additionally carries the identity imprint:
> I am someone who moves every day.
> Not a workout. A practice.

## Phase Plan

- **Phase 1 (this PR, v0.1):** scaffold + ritual UI + Neon DB schema + `/api/log-session` wires `@queen-bee/client` `govern()` (canonical reference impl per `WIRING_QUEEN_BEE.md`).
- **Phase 2 (v0.2):** Clerk auth wiring; replace synthetic anonymous IDs in route handlers; 7-locale catalog completion (es, fr, ar, hi, zh, pt — currently English only); Stripe Year-1 $1/year unlock; AI-generated Tibetan Rite imagery via Replicate FLUX (replaces placeholder SVG in `components/TibetanIllustration.tsx`).
- **Phase 3:** AI Activity Partner integration (separate engine, governed by QB).
- **Phase 4:** DNS provisioning for `vitality.hive.baby`; flips status `building → live`; planet ENGINES array entry.

## Out of Scope

- AI Activity Partner (separate engine post-Queen-Bee)
- Real Tibetan Rites imagery (placeholder SVGs in v0.1; Replicate FLUX in v0.2)
- Voice cues / audio coaching
- Apple Health / Google Fit sync
- Body composition tracking, calorie counting, heart-rate integration

## Deployment Notes

- Vercel project: `hive-vitality` (root `apps/hive-vitality`). Auto-deploy on push to `main`.
- DNS: `vitality.hive.baby` not yet wired. Provision via Cloudflare CNAME → `cname.vercel-dns.com` per CLAUDE.md C11. Tracked as a follow-up.
- Required env vars in production: `DATABASE_URL` (Neon connection string with `sslmode=require`), `NEXT_PUBLIC_APP_URL`.
- Optional env vars: `ANTHROPIC_API_KEY` (for Phase 2 reflection-coach AI; engine works without it in v0.1), `QUEEN_BEE_URL` (override default `https://queenbee.hive.baby`), `QB_ENGINE_TOKEN` (forward-compat; QB ignores today).
- Vercel deployment protection: **off** (per C10).

## Hive-Ops Overrides

```yaml
overrides:
  - rule: H05
    mode: warn
    reason: "Locale catalog seeded with English only; remaining six (es, fr, ar, hi, zh, pt) ship in v0.2."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-09
    warn_until: 2026-06-08
  - rule: H08
    mode: warn
    reason: "OG image not yet generated; v0.2 asset commit will land it alongside locale expansion."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-09
    warn_until: 2026-06-08
  - rule: H11
    mode: warn
    reason: "HiveInstallHint not yet wired; PWA install hint is part of v0.2 onboarding stack."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-09
    warn_until: 2026-06-08
  - rule: H13
    mode: warn
    reason: "public/hive-logo-full.png copy from @hive/onboarding ships with v0.2 onboarding stack."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-09
    warn_until: 2026-06-08
  - rule: H15
    mode: warn
    reason: "Favicon binaries not generated this PR — manifest.json declares them but actual PNG files are a follow-up asset commit."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-09
    warn_until: 2026-06-08
  - rule: H21
    mode: warn
    reason: "Engine entry in hivebaby planet ENGINES array pending DNS provisioning; engine is currently building/not_listed."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/127
    reviewer: Sonny
    date: 2026-05-09
    warn_until: 2026-06-08
```
