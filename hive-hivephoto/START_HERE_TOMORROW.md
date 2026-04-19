# HivePhoto Morning Runbook

## Current state
- Local project scaffold is created in this folder.
- Vercel project exists: `hive-hivephoto` (ID: `prj_BklkpU3ADjOzfYv0IlTwzeLMqRD6`).
- Vercel is linked locally (`.vercel` exists).
- Default domain is aliased: `https://hive-hivephoto.vercel.app`.
- Deploy retries are blocked right now by Vercel Hobby daily deployment quota.
- Custom domains are not yet resolving:
  - `hivephoto.hive.baby`
  - `thumbs.hivephoto.hive.baby`

## Why deploy currently fails
- Last attempt failed due quota: `api-deployments-free-per-day` (100/day).
- Earlier attempt also exposed Hobby cron limits (no high-frequency cron schedules).

## Morning first 30 minutes (exact order)
1. Ensure quota window has reset.
2. In Vercel project settings for `hive-hivephoto`, set all required env vars from `.env.example`.
3. Trigger a production deploy:
   - `cd /workspaces/hivebaby/hive-hivephoto`
   - `npx vercel --prod --yes --scope saggarsonny-3909s-projects`
4. Verify default domain health:
   - `curl -I https://hive-hivephoto.vercel.app`
5. Add/verify DNS records in Cloudflare:
   - `hivephoto` CNAME -> `cname.vercel-dns.com`
   - `thumbs.hivephoto` CNAME -> your R2 custom/public endpoint
6. Add custom domain in Vercel project (`hivephoto.hive.baby`) and wait for SSL issuance.
7. Re-check health:
   - `curl -I https://hivephoto.hive.baby`
   - `curl -I https://thumbs.hivephoto.hive.baby`

## Important implementation notes
- `vercel.json` is set to a Hobby-safe cron (once daily) so deploy can succeed.
- Intended high-frequency schedules (`*/2`, `*/15`) require Pro or an external scheduler.
- `middleware.ts` is temporarily fail-open (no auth enforcement) until Clerk env vars and route protection are wired.

## Immediate next coding tasks after first green deploy
1. Add Neon DB helper + migration runner.
2. Implement `POST /api/ingest/presign` and `POST /api/ingest/complete`.
3. Implement analyze/cleanup cron route stubs with `CRON_SECRET` guard.
4. Re-enable Clerk middleware and protect app/api routes.
5. Add a minimal gallery page that reads non-deleted photos.
