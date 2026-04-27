# ENGINE GRAMMAR — HiveIMR

<GrapplerHook>
engine: HiveIMR
id: hiveimr
version: 0.1.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
status: live
tier: 1
schema: intelligent-medical-records
stack: [nextjs, typescript, tailwind, anthropic, neon-postgres]
</GrapplerHook>

## Engine Identity
- **Name:** HiveIMR
- **Domain:** hiveimr.hive.baby
- **Repo:** saggarsonny-boop/hivebaby (subdir `hive-imr/`)
- **Status:** Live (Tier 1)
- **Stack:** Next.js + TypeScript + Tailwind + Anthropic SDK + Neon PostgreSQL

## Purpose
The post-EMR substrate. EMRs were built for billing; the IMR is built for care.
Role-aware, AI-native, patient-centred medical records. Eight clinical roles, four
AI prompt types (handoff, clinical summary, discharge summary, order justification),
auditable generations, free at the base tier.

## Inputs
- Role selection (eight roles: physician, ED, nurse, radiologist, pharmacist, allied, admin, viewer)
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
- Health disclaimer on every page: "This is not medical advice. Always consult a qualified clinician."

## Onboarding Stack
- Auto-demo (Phase 6)
- First-visit card (Phase 6)
- Tooltip tour: 5 stops — role selector, patient list, clinical view, AI panel, orders tab (Phase 6)
- Rotating placeholders (Phase 6)

## Safety Templates
- Always cite sources for clinical reference data
- Never claim authority equivalent to a clinician
- Defer to local protocols where they exist
- Drug recall / safety-critical info always free

## Multilingual Ribbon
- Status: pending

## Premium Locks
- None at base tier; free forever for individual clinicians
- Institutional pricing TBD post-prototype

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (remote)
- Safety level: enabled
- Tone: clinical, precise, role-aware

## API Model Strings
- Anthropic: `claude-opus-4-5` (clinical generation)

## Deployment Notes
- Vercel project: `hive-imr` (subdir of hivebaby repo, root directory `hive-imr/`)
- Domain: hiveimr.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: OFF
- Required env vars: `ANTHROPIC_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV`
- Health check: `GET /api/health`

## Phase Plan
1. ✅ Scaffold
2. ✅ Thomas's component + AI route hardened to `/api/ai/generate`
3. Neon schema (patients, sessions, ai_generations, orders) + demo seed
4. Cookie-based role selector at `/login`
5. AI route hardening (handoff / clinical summary / discharge / order justification)
6. Tooltip tour
7. test.hive.baby station entry (HIMR-0001+)
8. White paper outreach (parallel track, owner: Sonny)

## Out of Scope (Phase 1)
- Stripe, Clerk, file uploads, multi-tenant, HIPAA infrastructure.
