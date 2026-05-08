# HivePhoto — test station slot

Engine: **HivePhoto**
Domain: `hivephoto.hive.baby`
Canonical migration: 2026-05-08 (PR #125)
Owner: saggarsonny-boop
Status: live · listed · public · premium (freemium)

## Smoke checklist

Run from a real iOS Safari and a real Android Chrome session before any
visible-surface PR ships:

- [ ] Page loads on hivephoto.hive.baby (no auth gate, no 404)
- [ ] Clerk sign-in flow completes
- [ ] Empty-state renders for fresh accounts (no photos yet)
- [ ] Upload a single photo end-to-end (R2 presign + ingest + thumbnail)
- [ ] Face detection populates within reasonable latency
- [ ] Semantic search returns the uploaded photo for a relevant query
- [ ] Stripe pricing page loads (free / plus / pro / founding visible)
- [ ] Hive header logo links to https://hive.baby
- [ ] Hive footer signature ("Made with ♥ in the Hive") visible
- [ ] Privacy line in footer references "no model training on user photos"
- [ ] /api/health returns 200
- [ ] manifest.json reachable; favicon set complete
- [ ] No PII in browser console / network logs

## Notes

- All photo data is row-level scoped to `clerk.userId`. Cross-user
  reads are an invariant break — page-load smokes should always test
  with a fresh-account session.
- R2 pre-signed URLs expire after 15 minutes; never cached client-side
  beyond that window.
- Stripe webhook signing is verified server-side; no client-side
  fall-through. Local dev hits a webhook stub.
- `no_delete_on_downgrade` invariant: photos are never deleted from R2
  when a user drops to free tier — only the storage cap on new uploads
  changes.
