# HiveIMR — Intelligent Medical Records

The post-EMR substrate. Role-aware, AI-native, patient-centred.

## Local

```bash
npm install
npm run dev
```

## Environment

- `NEXT_PUBLIC_APP_URL`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (optional; default `claude-opus-4-5`)
- `DATABASE_URL` (Neon PostgreSQL — added in Phase 3)
- `SESSION_SECRET` (added in Phase 4)
- `NODE_ENV`

## Deploy

- Vercel project: `hive-imr`
- Domain: `hiveimr.hive.baby` (Cloudflare CNAME → `cname.vercel-dns.com`)
- Vercel Deployment Protection: OFF
- Auto-deploys on push to `main`

## Health

`GET /api/health` returns `{ ok: true, engine: "HiveIMR", time: ... }`.

## Status

Phase 1 — scaffold. Thomas's component lands in Phase 2.
