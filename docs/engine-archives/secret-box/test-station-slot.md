# HiveSecretBox — test station slot

Slot reserved on `test.hive.baby` per the engine launch checklist. The
canonical Hive ENGINE FINALIZATION CHECKLIST requires every live engine
to declare a deterministic test surface that a reviewer can hit without
authenticating.

## Slot
- Engine: HiveSecretBox
- Domain: secretbox.hive.baby
- Test path: `/api/health` (200 OK, returns `{ status: "ok", engine: "HiveSecretBox", ts: <ISO> }`)
- Read-path smoke: `/api/secrets` (200 OK, returns last 50 published secrets as JSON)
- Daily-drop smoke: `/api/daily` (200 OK, returns curated 5 from past 24h with diversity cap)

## Anonymity-preserving test pattern
The engine's surface is anonymous by design — no accounts, no IP storage,
no third-party trackers. Any test that exercises the submit / me-too /
comment flows MUST:

1. Use a temporary session cookie (auto-issued by `lib/session.ts`) and
   discard it after the test.
2. Submit text content from the canonical safe-test corpus only (no PII,
   no real-person names, no live phone numbers / emails — the upstream
   `containsPersonalInfo` regex will reject these anyway).
3. Use `share_city: false` on test submissions to avoid populating the
   `city` column with a CI runner's region string.
4. Cancel any time-released test submission via `DELETE /api/secrets-pending`
   before the publish-queue cron releases it — otherwise the test row
   becomes a public live secret on `secretbox.hive.baby`.

## Smoke checklist (manual)
- [ ] `curl https://secretbox.hive.baby/api/health` → 200
- [ ] `curl https://secretbox.hive.baby/api/secrets | jq length` ≥ 1
- [ ] `curl https://secretbox.hive.baby/daily` → 200, daily drop UI renders
- [ ] Submit `{ schedule: "now", share_city: false, content: "smoke test", category: "hopeful" }` → 200, appears in feed
- [ ] `POST /api/me-too {id}` → 200, `me_too_count` increments
- [ ] 4th rapid submit on free tier → 429 `rate_limited`
