# HivePlainScanProfessional (HPSP) Backend

HivePlainScanProfessional (HPSP) is a patient education and communication-support platform for finalized imaging reports. It does not interpret images, create diagnoses, recommend treatment, or replace clinician judgment. Patient-facing output requires clinician approval before release.

## Backend Safeguards

This codebase is designed for HIPAA-ready operation, but code alone does not certify HIPAA compliance. Production use still requires BAAs, deployment hardening, administrative policies, access reviews, incident response, monitoring, and vendor configuration.

Implemented backend controls:

- Clerk authentication middleware protects PHI routes.
- Server-side role and permission checks are in `lib/server/auth.ts` and `lib/server/permissions.ts`.
- Tenant isolation helpers require `organizationId` scoping for patient, report, and explanation lookups.
- Prisma schema includes organization-scoped PHI tables, approval records, audit logs, AI usage logs, retention policy, branding, and compliance readiness.
- Imaging report text is stored in `reportTextEncrypted` using AES-256-GCM via `APP_ENCRYPTION_KEY`.
- Report hashes are stored for reference/integrity without exposing raw text.
- AI prompts are generated server-side and de-identified before Claude calls.
- Daily organization AI cost caps are enforced before generation.
- Safety flag detection marks sensitive or urgent report language for clinician attention.
- Physician approval locks summaries; edits require reopen/reapproval.
- PDF generation is blocked until approval.
- Upload route accepts PDF only for MVP and stores object metadata with SHA-256 hash.
- Central audit logger writes append-only operational events and redacts metadata.
- Safe logger and PHI redaction helpers avoid PHI in application logs.
- Retention service supports archive/delete workflow and object deletion hook.
- Compliance readiness API deliberately avoids certification language.

## Required Environment

Copy `.env.example` to `.env.local` for local development. Never commit real secrets.

Required variables:

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `ANTHROPIC_API_KEY`
- `APP_ENCRYPTION_KEY`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`
- `DAILY_AI_COST_CAP_CENTS`
- `NODE_ENV`

`APP_ENCRYPTION_KEY` must be a 32-byte key encoded as hex or prefixed base64, for example `base64:<44-char-base64-key>`.

## Backend Route Flow

Every route touching PHI should follow:

`auth -> role permission -> organization scope -> validation -> action -> audit log -> PHI-safe response`

Primary route groups:

- `/api/reports`
- `/api/reports/:id`
- `/api/reports/:id/generate-explanation`
- `/api/explanations/:id`
- `/api/explanations/:id/approve`
- `/api/explanations/:id/reject`
- `/api/explanations/:id/generate-pdf`
- `/api/patients`
- `/api/files/upload`
- `/api/audit-logs`
- `/api/org/settings`
- `/api/compliance/checklist`
- `/api/ai/usage`

## Database

Generate Prisma client:

```bash
npm run prisma:generate
```

Run migrations against a configured Neon/Postgres database:

```bash
npm run prisma:migrate
```

Seed development data:

```bash
npm run prisma:seed
```

Seed data is synthetic and must not be replaced with real patient data.

## Tests

```bash
npm test
```

The current tests cover core security helpers: encryption, hashing, redaction, role permissions, safety flags, and safe errors. Integration tests should be expanded against a test database before production review.
