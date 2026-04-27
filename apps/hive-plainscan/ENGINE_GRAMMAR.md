# ENGINE GRAMMAR — HivePlainScan

<GrapplerHook>
engine: HivePlainScan
id: hiveplainscan
version: 0.1.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
status: building
tier: 1
schema: radiology-report-explanation
stack: [nextjs, typescript, tailwind, anthropic]
</GrapplerHook>

## Engine Identity
- **Name:** HivePlainScan
- **Domain:** plainscan.hive.baby (alias: scan.hive.baby)
- **Repo:** saggarsonny-boop/hivebaby (subdir `apps/hive-plainscan/`)
- **Status:** Building (Tier 1)
- **Stack:** Next.js + TypeScript + Tailwind + Anthropic SDK

## Purpose
HivePlainScan is a patient education tool. It explains finalized radiology
reports in plain English. It does not diagnose, interpret raw scan images,
recommend treatment, or replace a physician.

## Inputs
- Pasted text from a finalized radiology report
- Uploaded PDF report (text-extractable)
- Uploaded photograph or screenshot of a report (JPEG / PNG)

## Outputs
- Plain-English summary at 6th to 8th grade reading level
- Findings table: medical term, plain-English translation, location, severity, possible symptoms
- 5 to 7 questions to bring to the patient's doctor
- Red-flag highlights when present
- Downloadable PDF summary
- Downloadable Universal Document Sealed (.uds) export

## Rules
- Never show a finding without its plain-English translation beside it
- Never expose raw error stack traces to the user
- Reading level: 6th to 8th grade
- Disclaimer always renders below results, never hidden
- Words that must not appear in copy: delve, leverage, paradigm, game-changer, meticulous
- No em dashes in UI copy
- ANTHROPIC_API_KEY never shipped to the browser

## Onboarding Stack
- Auto-demo: pending
- First-visit card: pending
- Tooltip tour: pending
- Rotating placeholders: implemented (textarea cycles through real use cases)

## Safety Templates
- Health disclaimer on results and PDF: educational, not diagnostic
- Red-flag box surfaces findings the report itself flags as needing prompt attention
- Defer to the patient's clinician for interpretation

## Multilingual Ribbon
- Status: pending

## Premium Locks
- None at base tier; free forever for individual patients

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (remote)
- Safety level: enabled
- Tone: warm, plain, calm, factual

## API Model Strings
- Anthropic: `claude-sonnet-4-20250514`

## Deployment Notes
- Vercel project: `hive-plainscan` (root directory `apps/hive-plainscan/`)
- Domain: plainscan.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: OFF
- Required env vars: `ANTHROPIC_API_KEY`
- Health check: `GET /api/health`

## Phase Plan
1. Scaffold app, components, API routes, PDF/UDS export
2. Vercel deploy + DNS (plainscan.hive.baby and scan.hive.baby alias)
3. Add to test.hive.baby engine_slots with 10-item checklist
4. Add to planet surface as a hexagonal cell
5. Onboarding stack (auto-demo, first-visit card, tooltip tour)
6. Multilingual ribbon

## Out of Scope (Phase 1)
- Stripe, Clerk, file storage, multi-tenant, HIPAA infrastructure, OCR for scanned PDFs (use the Image tab instead).
