# ENGINE GRAMMAR — HivePhoto

<GrapplerHook>
engine: HivePhoto
id: hivephoto
version: 1.0.0
governance: QueenBee.MasterGrappler
safety: standard
multilingual: pending
premium: true
status: building
tier: 2
schema: photo-intelligence
stack: [nextjs, typescript, tailwind, clerk, neon, r2, anthropic, stripe]
</GrapplerHook>

## Engine Identity
- **Name:** HivePhoto
- **Domain:** hivephoto.hive.baby
- **Repo:** saggarsonny-boop/hive-hivephoto
- **Status:** Building (Tier 2)
- **Stack:** Next.js + TypeScript + Tailwind + Clerk + Neon + R2 + Anthropic SDK + Stripe

## Purpose
AI-powered photo intelligence. Upload, search, and understand your photos. Face recognition, semantic search, geolocation mapping, and duplicate detection.

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

## GrapplerHook Rules
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

## Multilingual Ribbon
- Status: pending

## Premium Locks
- Free tier: 50 GB storage
- Pro tier: configurable via Stripe

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (remote)
- Safety level: standard
- Tone: neutral, factual

## API Model Strings
- Anthropic: `claude-opus-4-5` (photo analysis)
- Clerk: authentication
- Neon: PostgreSQL (serverless)
- AWS S3 / R2: object storage

## Deployment Notes
- Vercel: auto-deploy on push to main
- Domain: hivephoto.hive.baby → Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: OFF
