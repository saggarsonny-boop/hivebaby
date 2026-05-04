# ParkBack

Drop a pin where you parked. Walk back to it. Nothing leaves the device.

A client-only PWA. No accounts, no backend, no database. The pin, the photo,
and the voice memo all live in `localStorage` on the device that dropped them.

- **Domain:** parkback.hive.baby
- **Repo:** `apps/parkback/` inside `saggarsonny-boop/hivebaby`
- **Stack:** Next.js 16 + TypeScript

## Routes

| Path | What it does |
|------|--------------|
| `/` | Drop-pin / find-my-car (uses local pin from `localStorage`) |
| `/find?lat=…&lng=…&t=…&landmark=…` | Read-only view of a spot someone shared with you |

## Local dev

```bash
cd apps/parkback
npm install
npm run dev
# → http://localhost:3000
```

## Deploy

Vercel project on `saggarsonny-3909s-projects`. Root directory: `apps/parkback`.
Domain: `parkback.hive.baby` via Cloudflare CNAME → `cname.vercel-dns.com`.
No env vars required.

## What it doesn't do
- Doesn't sync anything anywhere
- Doesn't track you
- Doesn't show ads
- Doesn't upload your photo or voice memo to a server (they stay on your phone)

No ads. No investors. No agenda.
