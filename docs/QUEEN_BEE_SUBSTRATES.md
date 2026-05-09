# Queen Bee Substrate Registry

Reusable substrate patterns extracted from real engine work, recorded so they can be adopted across the Hive without re-inventing them per engine.

> A **substrate** is a pattern that more than one engine has used in earnest, even if it hasn't been promoted to a shared package yet. The registry exists so the second engine that needs the pattern doesn't re-design it, and so when a third engine adopts it the team can see the pattern has crossed the threshold for extraction into a `@hive/*` package.

## Why this registry exists

Today's HiveActivityPartner work was scaffolded on a wrong product premise (HAP was treated as a matching system; the product is actually a companion module). The HAP product code will be discarded. But during that scaffolding, the team built **13 substrate patterns** that are genuinely reusable across other Hive engines. This registry captures them before the HAP retraction takes them with it.

This registry is the canonical pointer for those patterns. When a new engine needs operator auth, an audit dashboard, the inlined onboarding stack, the strings/useStrings split, direct-to-blob upload, the cost-cap circuit breaker, the 7-language locale generator, the validation utility shape, defense-in-depth response stripping, the atomic bounded counter, hive_alerts telemetry, tier-based rate limiting, or the Stripe-Plus subscription pattern — they read this file first.

## Format per pattern

Each pattern has the same six fields:

1. **Name** — short canonical title.
2. **Purpose** — one or two sentences naming the problem the pattern solves.
3. **Current implementations** — PRs and files where the pattern actually lives, with repository and path.
4. **Canonical shape** — what a new engine adopting the pattern needs to build. Concrete; not a paragraph of advice.
5. **When to use** — decision criteria so an engine can tell if the pattern applies.
6. **When to extract to a real package** — the threshold (typically 3+ engines using it) at which the pattern should leave the registry and become a published `@hive/*` package with its own version, README, and changelog.

The "When to extract" line on every pattern is the registry's exit condition. The registry isn't a permanent home — it's the staging area between "one engine built this" and "this is part of `@hive/*`."

---

## 1. Operator Role pattern (header + cookie + Clerk metadata)

**Purpose.** Give every Hive engine a single, uniform way to bypass tier gates / captcha / rate limits for testing, debugging, and emergency access. Three accepted markers in priority order; any one is sufficient.

**Current implementations.**
- `saggarsonny-boop/universal-document` — `apps/converter/src/lib/operator-auth.ts` (PR #22).
- `saggarsonny-boop/hivebaby` — `apps/hive-activity-partner/lib/operator-auth.ts` (PR #113).
- Constitution §V "Operator Role Convention" `[OPERATOR_ROLE]`.

**Canonical shape.** Three markers, checked in this exact order:
1. **Clerk** — `auth().sessionClaims?.publicMetadata?.role === 'operator'` (or equivalent). Engines that don't wire Clerk middleware can leave this dormant.
2. **Signed cookie** — HMAC-SHA256 cookie named `<engine>_operator` (default `ud_operator` for UD-prefixed engines). Issued by `/api/operator/login` on first successful POST of the `OPERATOR_SETUP_CODE`. 30-day TTL.
3. **Header** — `x-<engine>-operator-key` (default `x-ud-operator-key`) compared **constant-time** against the engine's `OPERATOR_KEY` env var. For CLI / automation use only.

Required env vars per engine: `OPERATOR_AUTH_SECRET` (32-byte base64; HMAC signing key), `OPERATOR_KEY` (32-byte hex; CLI header value), `OPERATOR_SETUP_CODE` (6-digit numeric; single-use bootstrap code, rotated each time a new cookie is issued).

The `lib/operator-auth.ts` file exposes one function — `requireOperator(req: NextRequest): Promise<OperatorIdentity | null>` — and one type — `OperatorIdentity = { source: 'clerk' | 'cookie' | 'header'; userIdentity: string }`. Callers compose: `const op = await requireOperator(req); if (!op) return tierGateCheck(...);`

**When to use.** Any engine with tier gates (free/plus/pro), captcha, or rate limits. Most production Hive engines qualify. Read-only public engines (HiveMoon, the planet front door) do not need it.

**When to extract.** **Threshold met.** Two engines use it; a third (HivePhoto) is in scope per HiveOps v0.3 plans. Extraction target: `@hive/auth` package containing `requireOperator`, the env var loader, and the bootstrap login route. HiveOps v0.3 will add a rule (likely H29) verifying any tier-gated engine imports the package rather than re-implementing.

---

## 2. Operator Audit Dashboard pattern

**Purpose.** Surface every operator-level action against an engine in one place, so the existence of the operator role is auditable. Pairs with pattern 1.

**Current implementations.**
- `saggarsonny-boop/universal-document` — `apps/converter/src/app/admin/operator-audit/page.tsx` (PR #26).
- `saggarsonny-boop/hivebaby` — `apps/hive-activity-partner/app/admin/operator-audit/page.tsx` (PR #120).

**Canonical shape.**
- Server-rendered page, gated by `requireOperator()` (pattern 1) — non-operators get a 404.
- Reads from a Neon table named `<engine>_operator_audit` with columns `(id BIGSERIAL, user_identity TEXT, action TEXT, engine_slug TEXT, file_size BIGINT, file_type TEXT, request_id TEXT, ts TIMESTAMPTZ DEFAULT NOW())`.
- Renders the most recent N=200 actions with filters for `action`, `user_identity`, and a date range.
- Every operator-level mutation in the engine writes one row to this table before returning. The write is best-effort and never fails the user request.
- Layout uses the engine's standard chrome (header logo, footer signature) — the audit dashboard is internal but shouldn't look bolted-on.

**When to use.** Any engine that adopts pattern 1. The audit table is the only way to know operators didn't quietly bypass gates outside of testing windows.

**When to extract.** **Threshold met** in tandem with pattern 1. Extraction target: `@hive/auth/audit` — exports a `<OperatorAuditPage />` server component plus the Neon migration. Each engine still owns its `<engine>_operator_audit` table; the package handles read/render and the schema scaffold.

---

## 3. Inline `@hive/onboarding` pattern

**Purpose.** When an engine repo is not part of the `hivebaby` workspace (so the `@hive/onboarding` workspace package isn't reachable), inline the package into the engine's own `lib/hive-onboarding/` rather than re-implementing the components. Keeps the import path identical so engines can be migrated back to the workspace later without diff churn.

**Current implementations.**
- `saggarsonny-boop/universal-document` — `apps/converter/src/lib/hive-onboarding/` (PR #17). The original incident: cross-tree React deduplication caused two React instances and SSR null context.
- `saggarsonny-boop/hivebaby` — `apps/hive-activity-partner/lib/hive-onboarding/` (PR #115). Inlined despite being inside `hivebaby` because Phase-1 HAP was being prepared for possible standalone-repo extraction.
- Memory rule: `[INLINE_PACKAGE]` (Rule #30).

**Canonical shape.**
- Copy `packages/hive-onboarding/src/*` into `<engine>/lib/hive-onboarding/`.
- Preserve the public interface: `HiveInstallHint`, `HiveFirstVisitExplainer`, `HiveAHTSPrompt`, `AppInstalledToast`, `IOSInstallOverlay`, `useDismissalState`.
- Keep the 7-locale catalog under `lib/hive-onboarding/locales/` (`en, es, fr, ar, hi, zh, pt`).
- Add a `lib/hive-onboarding/README.md` with **two** lines: which `hivebaby` commit the snapshot was taken from, and a sync-pointer noting `packages/hive-onboarding/` is the canonical source — future updates require a manual sync.
- Configure the engine's `tsconfig` and `webpack` aliases so external imports of `@hive/onboarding` still resolve to the inlined copy. The downstream import statement does not change.

**When to use.** External-repo engines, OR monorepo-resident engines being prepared for extraction, OR any engine that hits cross-tree React deduplication issues with the workspace package.

**When to extract.** Already extracted as `@hive/onboarding` in `hivebaby`. The substrate is the *inlining pattern*, not the package itself. The pattern stops being needed once a real cross-repo strategy lands (npm publish + lockfile, or git submodule + alias). At that point the inline directories get removed and the readmes archived.

---

## 4. Strings / useStrings split pattern

**Purpose.** Let the same locale catalog feed both server components (which can't import `useState` / `useEffect` / `"use client"` modules) and client components (which need locale switching at runtime), without duplicating the catalog or the lookup logic.

**Current implementations.**
- `saggarsonny-boop/hivebaby` — `apps/hive-activity-partner/app/_lib/strings.ts` (server-safe export) + `apps/hive-activity-partner/app/_lib/useStrings.ts` (`"use client"` hook). PR #122.

**Canonical shape.**
- `strings.ts` is server-safe. It exports a default English bundle plus a `getStrings(locale: Locale)` function that synchronously returns the bundle for a given locale (or English on miss). No React imports.
- `useStrings.ts` declares `"use client"` at the top, imports `getStrings`, and exports a `useStrings()` hook that resolves the active locale via `navigator.language` (or a context provider) and returns the bundle.
- Server components import directly from `strings.ts`: `import { strings } from "./_lib/strings"; const s = strings.home;` — synchronous, no hook, English fallback.
- Client components use the hook: `const s = useStrings().home;` — re-renders when locale changes.
- Both paths read from the same `locales/<lang>.json` files; the catalog is loaded once by `strings.ts` and shared.

**When to use.** Any engine with both server-rendered marketing pages (home, /about, /pricing) and client-rendered product surfaces (forms, dashboards) where copy needs to translate.

**When to extract.** **Threshold not yet met** — only HAP uses it. If HiveAdminSupport, HiveActivityPartner-successor (the companion-module variant), and HivePhoto adopt it, extract to `@hive/i18n` exposing `createStringsModule({ locales, defaultLocale })` which returns `{ strings, useStrings, getStrings }` for a given catalog.

---

## 5. Direct-to-blob upload pattern

**Purpose.** Avoid the Vercel Pro upload tier. Files go from the browser to Vercel Blob via a signed URL the server issues; no body proxies through the Next.js route handler. Keeps the engine on the free Vercel tier.

**Current implementations.**
- `saggarsonny-boop/universal-document` — `apps/converter/src/components/FileUpload.tsx` plus `apps/converter/src/app/api/upload/route.ts` (the `handleUpload` callback shape from `@vercel/blob/client`). Tier-aware: free / plus / pro file size caps enforced server-side.
- Memory rule: `[BLOB_ARCHITECTURE]` (Rule #29).

**Canonical shape.**
- Server route at `/api/upload/route.ts` exports `POST` that calls `handleUpload({ body, request, onBeforeGenerateToken, onUploadCompleted })` from `@vercel/blob/client`.
- `onBeforeGenerateToken` validates the requesting tier (free / plus / pro / operator), enforces the per-tier size cap, and returns `allowedContentTypes`, `maximumSizeInBytes`, `tokenPayload` (the requesting user's identity, the action being performed).
- `onUploadCompleted` is the engine's hook to record the blob URL into Neon, attach it to a row, kick off processing, etc.
- The browser uses `upload(file, { access: 'public', handleUploadUrl: '/api/upload' })` from `@vercel/blob/client`. Two round-trips, but no proxying through the Next.js server.
- `BLOB_READ_WRITE_TOKEN` is provisioned as a Vercel project env var (Production scope only — Preview deployments share the prod token by design; restrict if needed).

**When to use.** Any engine where users upload files larger than ~4 MB (the Vercel free-tier route-handler body cap). Photos, PDFs, videos, audio, document imports.

**When to extract.** **Threshold not yet met** — only UD Converter uses it in production today. If HivePhoto, HiveSecretBox media uploads, and a future video engine adopt it, extract to `@hive/blob-upload` exposing `<TierAwareFileUpload />` and `createUploadHandler({ tierResolver, sizeLimits, onComplete })`.

---

## 6. Cost-cap circuit breaker

**Purpose.** Cap daily Anthropic spend per engine. When the cap is exceeded, fail closed (deny LLM calls with a helpful 503) rather than silently overspending. Prevents one runaway pattern from burning a month's budget overnight.

**Current implementations.**
- `saggarsonny-boop/secret-box` — T3 work in flight (not yet merged). Will live at `lib/cost-cap.ts` plus a Neon table `anthropic_spend_daily`.
- Pattern documented here so the second adopting engine can copy from secret-box once it lands rather than re-implement.

**Canonical shape.**
- Neon table `anthropic_spend_daily(engine_slug TEXT, date DATE, cents_spent BIGINT, calls INT, PRIMARY KEY (engine_slug, date))`. Atomic UPSERT increments on each call.
- Env var `ANTHROPIC_DAILY_CAP_CENTS` per engine — default `2000` ($20/day).
- A `costCap.checkAndReserve(estimatedCents)` function called *before* every Anthropic API request. Returns either `{ ok: true, reserveId }` (proceed; the row was incremented) or `{ ok: false, currentCents, capCents }` (reject with a 503 / friendly message).
- On Anthropic response, call `costCap.commit(reserveId, actualCents)` to reconcile the estimate against the actual `usage` block. Over-estimates roll back; under-estimates top up.
- A daily cron (or Vercel scheduled function) emits a `hive_alerts` event (pattern 11) when spend crosses 50%, 80%, or 100% of cap.
- Operator role (pattern 1) bypasses the cap.

**When to use.** Every engine that calls the Anthropic API in a user-triggered hot path. Background / cron-only engines have less risk and can defer; UI-triggered engines must adopt.

**When to extract.** **Threshold met** soon — secret-box (in flight) plus HAP-successor plus HivePhoto are all candidates. Extraction target: `@hive/cost-cap` exposing `createCostCap({ engineSlug, capCents, db })` returning `{ checkAndReserve, commit }`. The Neon migration ships in the package.

---

## 7. 7-language locale generation

**Purpose.** Translate an `en.json` catalog into the 6 other canonical Hive locales (`es, fr, ar, hi, zh, pt`) using Anthropic Haiku, with structure-preserving output. Replaces the manual translator workflow that doesn't scale across engines.

**Current implementations.**
- `saggarsonny-boop/hivebaby` — HAP locale set was generated this way (PR #110). The translation script lived as a one-shot ops workflow; the script itself is the substrate, not the locale files (which are HAP-product-specific).

**Canonical shape.**
- Script at `tools/locales/translate.ts` (or a workflow at `.github/workflows/<engine>-i18n-generate.yml`).
- Reads `apps/<engine>/locales/en.json`. Normalizes the JSON tree.
- For each target locale, calls `claude-haiku-4-5-20251001` with a system prompt that pins:
  - Preserve the JSON structure exactly (no reordering, no dropped keys).
  - Translate values, never keys.
  - Preserve interpolation tokens (`{count}`, `%s`, etc.).
  - Use the engine's tone (passed in as `engineTone` — *clinical / casual / formal*).
  - For Spanish: gentle PWA install copy ("agregar a la pantalla de inicio", never "instalar").
- Writes `apps/<engine>/locales/<locale>.json`.
- Validates: parsed JSON, identical key tree, no missing or extra keys vs `en.json`. Fails the CI run if a key is missing or untranslated (Anthropic returns `{}`).
- The script is **idempotent** — running it twice with no changes to `en.json` produces no diff. New keys in `en.json` are translated; existing values are not retranslated unless explicitly forced via `--retranslate <key>`.

**When to use.** Every engine that ships UI text. Not optional — the 7-locale set is the free-tier floor (`[LOCALE_SET]`, Constitution §II).

**When to extract.** **Threshold already crossed** — almost every engine has a locale catalog, but the translation tooling is duplicated. Extraction target: `tools/hive-i18n-generate/` (a hivebaby-resident tool, not a package — the runner needs `ANTHROPIC_API_KEY` so it stays inside the monorepo where Codespace secrets are available). Workflow `.github/workflows/hive-i18n-generate-reusable.yml` accepts `engine_slug` as input.

---

## 8. Validation utility pattern

**Purpose.** Centralize the validators that multiple routes need (e.g. activity name, slug, justification text length, age band) so the rules don't drift between the API surface, the moderation surface, and the seed data. Also so the same validation runs on the client form *and* the server route handler.

**Current implementations.**
- `saggarsonny-boop/hivebaby` — `apps/hive-activity-partner/lib/validation/activity.ts` (PR #113). Exports `validateActivityName`, `validateSlug`, `validateJustification`, `validateAgeBand`. Imported by `app/api/activities/request/route.ts`, `app/api/activities/moderate/route.ts`, and the form components.

**Canonical shape.**
- One file per domain: `lib/validation/<domain>.ts` (e.g. `activity.ts`, `profile.ts`, `payment.ts`).
- Each validator is `(input: unknown) => { ok: true; value: T } | { ok: false; reason: string; field?: string }`. No throwing.
- Validators compose: a parent validator (e.g. `validateActivityRequest`) calls child validators and aggregates.
- Constants live in the same file (`MAX_NAME_LENGTH = 80`, `ALLOWED_AGE_BANDS = [...] as const`). Exported alongside the validators.
- The same file is imported by client form components AND server route handlers — no Node-only dependencies.
- Server routes return `400 { error: reason, field }` on `ok: false`. Client forms surface `reason` next to `field`.

**When to use.** Any engine where the same input shape appears in more than one route or in both client + server contexts. Most engines past Phase 1 hit this.

**When to extract.** Stays in-engine — validators are inherently domain-specific. The *shape* is the substrate, not the validators themselves. Document the shape; engines copy the shape, not the file.

---

## 9. Defense-in-depth response stripping (`assertNoLocation`)

**Purpose.** When an engine has a class of fields that must never leak to the client (location, real name, email when not consented, phone, etc.), enforce the rule at *three* layers, not one. Single-layer protection eventually breaks because someone forgets which layer is the gatekeeper.

**Current implementations.**
- `saggarsonny-boop/hivebaby` — `apps/hive-activity-partner/app/_lib/activitiesClient.ts` (function `assertNoLocation`), PR #116 + PR #117.

**Canonical shape.** Three layers, each independently enforced:
1. **SQL layer.** Never `SELECT *`. Every server query lists fields explicitly. Sensitive fields are not in the list. Code review catches `SELECT *` regressions.
2. **Route handler layer.** A `pickPublicFields()` helper builds the response from a whitelist. Fields not in the whitelist do not appear in the response — even if the database row had them.
3. **Response builder layer.** The client-side fetch wrapper runs `assertNoLocation()` (or its domain-specific equivalent) on every parsed response body, recursively. If a forbidden key is found anywhere in the tree, throw — fail loud in dev / log + scrub in prod.

The third layer is the new substrate: a recursive walker that throws when it finds any of a configured set of keys (`location`, `lat`, `lng`, `address`, `email`, etc.) anywhere in the response. It's slow on huge payloads, but the compliance value is worth the cost.

**When to use.** Any engine handling location, contact info, identity-tied PII, or anything covered by a regulatory regime (HIPAA-adjacent, GDPR special-category data). The first two layers are obvious; the third layer is what makes the regression-resistant.

**When to extract.** **Threshold not yet met** — HAP is the only adopter. If the companion-module HAP-successor + HiveAdminSupport (which handles inbound emails) + HivePhoto (which handles user-tagged media) adopt it, extract to `@hive/data-shield` exposing `createScrubber({ forbiddenKeys, mode: 'throw' | 'log-and-scrub' })`.

---

## 10. Atomic bounded counter

**Purpose.** Update a counter (trust score, retry budget, daily quota remaining) inside a clamp range, atomically, in a single transaction. Avoids the race-condition class where two concurrent requests both read the value, both compute "fine, increment", and both commit, exceeding the bound.

**Current implementations.**
- `saggarsonny-boop/hivebaby` — `apps/hive-activity-partner/lib/safety/trust.ts`, PR #117.

**Canonical shape.** A single Postgres CTE:

```sql
WITH current AS (
  SELECT trust FROM users WHERE id = $1 FOR UPDATE
),
clamped AS (
  SELECT GREATEST(0, LEAST(100, current.trust + $2)) AS new_trust
  FROM current
),
updated AS (
  UPDATE users SET trust = clamped.new_trust
  FROM clamped WHERE users.id = $1
  RETURNING users.trust AS new_trust, current.trust AS old_trust
)
INSERT INTO trust_signals (user_id, delta, old_trust, new_trust, reason, ts)
SELECT $1, $2, old_trust, new_trust, $3, NOW() FROM updated
RETURNING new_trust;
```

- `FOR UPDATE` on the read locks the row for the duration of the transaction, so concurrent calls serialize.
- `GREATEST(0, LEAST(100, ...))` enforces the clamp range *inside* the database — no client-side clamp logic.
- The `trust_signals` insert runs in the same statement, so the audit trail is never out-of-sync with the counter.
- The function exposes one signature: `applyDelta(userId, delta, reason): Promise<{ newTrust: number }>`. Callers don't see the SQL.

**When to use.** Any counter with a bound (`0..100` trust scores, `0..N` retry budgets, daily quotas, lifetime caps). Especially when concurrent updates are possible (parallel API calls, webhook + user-triggered flows hitting the same row).

**When to extract.** **Threshold not yet met** — only HAP uses this concrete shape. Once cost-cap (pattern 6) and a future "lifetime-quota" feature land in two more engines, extract the CTE generator: `@hive/atomic-counter` exposing `createCounter({ db, table, column, lower, upper, signalsTable })` returning `applyDelta`.

---

## 11. `hive_alerts` telemetry

**Purpose.** Cross-engine visibility into events worth knowing about — safety incidents, cost-cap triggers, operator activity, payment failures. One ledger, every engine writes, the AdminSupport engine + a future HiveCompliance engine read.

**Current implementations.**
- Migration: `migrations/001_hive_alerts.sql` (hivebaby root) plus engine-local mirror migrations (e.g. `apps/hive-activity-partner/db/schema/015_hive_alerts.sql`).
- HAP: `apps/hive-activity-partner/lib/safety/alerts.ts` is the canonical emitter shape — wraps every emit in a `try/catch` so a write failure to `hive_alerts` never breaks the user request.
- Multiple engines write to it; reads are centralized in HiveAdminSupport.

**Canonical shape.**
- Table `hive_alerts(id BIGSERIAL, ts TIMESTAMPTZ, engine_slug TEXT, tier INT, kind TEXT, user_identity TEXT NULL, payload JSONB)`.
- `tier` is a tier-1/2/3 severity (1 = informational, 2 = needs attention, 3 = page-now).
- Engine emitter function: `emit(kind, { tier, payload, userIdentity? }): void`. Wraps `INSERT INTO hive_alerts (...) VALUES (...)`. Best-effort; never throws, never blocks the user request. Logs the failure to console for the engine's own logs.
- `kind` is a free-form short string by convention — `<engine>_<event>` (e.g. `hap_request_rate_limited`, `secretbox_anthropic_cap_warn_80`). Document conventions in the engine's README, not in code.
- `payload` is a JSONB blob with whatever structured context the consumer needs (request_id, file size, dollar amount, etc.). Avoid PII unless the event meaningfully requires it; never include bearer tokens, passwords, or full file contents.
- HiveAdminSupport reads this table on a 5-minute cron. Tier-3 events page Sonny via Resend; tier-2 events surface in the AdminSupport dashboard; tier-1 events are searchable but not surfaced.

**When to use.** Every engine that has incident-worthy events. Most production Hive engines qualify after Phase-1 — Phase-1 engines can defer until the second emitter is needed.

**When to extract.** **Threshold met** (3+ engines write to it). Extraction target: `@hive/alerts` exposing `createAlertEmitter({ db, engineSlug })` returning `{ emit }`. The migration ships in the package.

---

## 12. Tier-based rate limiting

**Purpose.** Apply per-action rate limits that vary by user tier (free / plus / pro / operator), with operator bypass and a friendly 429 error that names the quota.

**Current implementations.**
- `saggarsonny-boop/hivebaby` — `apps/hive-activity-partner/lib/rate-limit/activities.ts` (PR #117). Caps activity creation per tier and per action (request new activity is a stricter quota than create from existing taxonomy).

**Canonical shape.**
- Per-action config: `{ free: { perDay: N }, plus: { perDay: M }, pro: { perDay: K }, operator: 'unlimited' }`.
- `checkRateLimit(userIdentity, tier, actionKey): Promise<{ ok: true } | { ok: false; reason: string; retryAfterSec: number }>`.
- Enforced via a Neon table `<engine>_rate_limits(user_identity, action_key, day, count)` with a unique constraint on `(user_identity, action_key, day)` and an UPSERT increment.
- Operator (pattern 1) returns `{ ok: true }` immediately, no DB hit.
- Engine route handlers call this *before* any expensive work. The 429 response includes a `Retry-After` header set to `retryAfterSec` and a body explaining the quota in plain language.
- For burst protection, layer a separate sliding-window limiter (in-memory or Redis) above the daily quota. The daily quota is the fairness floor; the sliding window prevents thundering-herd abuse.

**When to use.** Every engine that gates user actions by tier. A pricing model (`[PRICING_MODEL]`) without a rate limiter is just a suggestion.

**When to extract.** **Threshold not yet met** — HAP is the only one with this exact shape. If HivePhoto, HiveSecretBox, and HiveAdminSupport adopt, extract to `@hive/rate-limit` exposing `createLimiter({ db, engineSlug, perActionConfig, operatorResolver })`.

---

## 13. Stripe tier subscription pattern

**Purpose.** Ship the Plus / Pro tier across the ecosystem with one signed-cookie verification chain, one set of Stripe products, and one webhook shape — so engines don't each invent their own checkout.

**Current implementations.**
- Stripe Plus product in the Hive Stripe account: `prod_UT933u9pwIRHGo` (referenced in CLAUDE.md C13 / Constitution §II).
- `PLUS_AUTH_SECRET` HMAC signing key (canonical secret name).
- Engines that consume the pattern: see the adoption tracker. The reference implementation is in `saggarsonny-boop/universal-document` apps/converter (which ships Plus + Pro). HAP wired the env vars and the cookie-validation chain in PR #113 but the product surface has been retracted with the rest of HAP.

**Canonical shape.**
- One Stripe Product per tier (Plus, Pro), shared across the ecosystem. Engines reference price IDs via canonical env vars: `STRIPE_PRICE_PLUS_MONTHLY`, `STRIPE_PRICE_PLUS_ANNUAL`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`.
- `/api/checkout/route.ts` accepts `{ tier, interval, successUrl, cancelUrl }`. Server-side: looks up the price ID by tier + interval from env, calls `stripe.checkout.sessions.create`, redirects to the Stripe-hosted checkout page.
- `/api/stripe/webhook/route.ts` verifies the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`, dispatches by event type. On `checkout.session.completed`: read `customer_email` (or the Clerk identity from `client_reference_id`), HMAC-sign a `<engine>_plus` cookie payload `{ identity, tier, expiresAt }` with `PLUS_AUTH_SECRET`, return a 200 to Stripe.
- A subsequent `/api/cookie/grant` route (called from the success page client-side) fetches the signed payload and sets the cookie via `Set-Cookie: <engine>_plus=<sig>; HttpOnly; Secure; SameSite=Lax; Max-Age=...`.
- Engine middleware reads the cookie, verifies the HMAC, exposes the resolved tier on every request — same layer where pattern 1 (operator) and pattern 12 (rate limit) plug in.
- Cancellation / refund flows: webhook receives `customer.subscription.deleted`, cookie's `expiresAt` passes naturally, no action needed beyond the user's next request re-evaluating tier.

**When to use.** Any engine offering paid tiers. The Hive's standing pricing model is `Plus $0.97/mo` and `Pro $29/mo` — every paid engine slots in.

**When to extract.** **Threshold met** (UD Converter live; HivePhoto live; secret-box if it adds tiers). Extraction target: `@hive/stripe-tiers` — exports the `/api/checkout` route handler factory, the webhook handler factory, the cookie middleware, and the Stripe product ID constants. The factory takes `{ engineSlug, supportedTiers, onTierChange }` so engine-specific hooks (e.g. updating Neon, sending a welcome email) plug in.

---

## Substrate Adoption Tracker

A pattern crosses the **3-engine threshold** when three or more engines have adopted it in production. At that point the pattern leaves this registry and becomes a `@hive/*` package with its own version, README, and changelog.

Status legend: `live` — pattern is in production and stable. `in flight` — pattern is being built right now. `wired` — pattern's env vars and scaffolding are in place but the product surface using it is paused or retracted.

| Pattern | UD Converter | HivePhoto | HiveAdminSupport | Secret Box | HAP (retracted) | Other | Adopters | Threshold |
|---|---|---|---|---|---|---|---:|---|
| 1. Operator Role | live (PR #22) | candidate | candidate | — | live (PR #113) | — | 2 | **met** |
| 2. Operator Audit Dashboard | live (PR #26) | — | — | — | live (PR #120) | — | 2 | **met** |
| 3. Inline `@hive/onboarding` | live (PR #17) | — | — | — | live (PR #115) | — | 2 | crosses at 3rd external-repo engine |
| 4. strings / useStrings split | candidate | candidate | candidate | — | live (PR #122) | — | 1 | not met |
| 5. Direct-to-blob upload | live | candidate | — | — | — | — | 1 | not met |
| 6. Cost-cap circuit breaker | candidate | candidate | candidate | in flight (T3) | candidate (in successor) | — | 0–1 | crosses on next merge |
| 7. 7-language locale generation | live | live | live | live | live (PR #110) | every engine | 5+ | **crossed long ago — extract overdue** |
| 8. Validation utility shape | live | live | live | live | live (PR #113) | every engine | 5+ | shape only — no extraction (domain-specific) |
| 9. Defense-in-depth response stripping (`assertNoLocation`) | — | candidate | candidate | — | live (PR #116/#117) | — | 1 | not met |
| 10. Atomic bounded counter | — | — | — | candidate | live (PR #117) | — | 1 | not met |
| 11. `hive_alerts` telemetry | live | live | live (reader) | live | live (writer) | — | 4+ | **met** |
| 12. Tier-based rate limiting | live | live | — | candidate | live (PR #117) | — | 3 | **met** |
| 13. Stripe tier subscription | live | live | — | — | wired (PR #113, retracted) | — | 2 | crosses when Secret Box adopts |

### Patterns to extract first (sorted by overdue-ness)

1. **Pattern 7 — 7-language locale generation.** Every engine has a translation runner now, all duplicated. Extracting to `tools/hive-i18n-generate/` is mechanical and unblocks the next engine instantly.
2. **Pattern 11 — `hive_alerts` telemetry.** 4+ writers. The shape is stable. Extraction to `@hive/alerts` is a 1-day task.
3. **Patterns 1 + 2 — Operator role + audit dashboard.** Tied; should be extracted together as `@hive/auth`. HiveOps v0.3 plans to enforce the import.
4. **Pattern 12 — Tier-based rate limiting.** Three engines. Worth promoting; small surface area.
5. **Pattern 13 — Stripe tier subscription.** Two production engines, but the substrate is mature and saving the third engine the implementation cost is high-value.

### Patterns to keep watching

- **Pattern 4 (strings / useStrings split)** — only HAP. Watch HiveAdminSupport adoption.
- **Pattern 5 (direct-to-blob)** — only UD Converter. Watch HivePhoto migration.
- **Pattern 9 (assertNoLocation)** — only HAP. Watch HiveAdminSupport (it handles inbound emails).
- **Pattern 10 (atomic bounded counter)** — only HAP. Watch cost-cap (pattern 6) work in secret-box.

### Patterns with no extraction target

- **Pattern 3 (inline `@hive/onboarding`)** — the pattern is a workaround for a cross-tree issue, not a thing to package. Goes away when a cross-repo strategy lands.
- **Pattern 8 (validation utility shape)** — domain-specific by nature. The shape gets documented; the validators stay per engine.

---

## How to add a pattern

1. Implement the pattern in at least one engine. A registry entry without a real implementation is a wishlist item, not a substrate.
2. Append a numbered section above following the six-field format (Name / Purpose / Current implementations / Canonical shape / When to use / When to extract).
3. Add a row to the adoption tracker.
4. Open a PR amending this file. Reference the originating engine PRs.
5. The next engine that needs the pattern reads this file first.

## How to retire a pattern

When a pattern crosses the 3-engine threshold AND the `@hive/*` package extraction is merged:

1. Replace the "Canonical shape" content with a single line pointing at the package: *"Extracted to `@hive/<package-name>` v0.1 — see that package's README for the canonical shape."*
2. Update each engine's section to import from the package.
3. Leave the section in place — it's the historical record of where the pattern came from.

---

*Maintained by Sonny. PR-only updates, per `[GOVERNANCE_LOCATION]`.*
