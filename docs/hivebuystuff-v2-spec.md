# HiveBuyStuff V2 — Chrome Extension + Magic Key

**Status:** Specced 2026-05-15. Starts after V1 E2E green.

---

## V2 goal

Move from "search URL links" (V1) to **real cart on every site** — no store partnership required.
Revenue path: Amazon PA-API affiliate commissions + Stripe Pro/Premium.
Zero per-run infrastructure cost on the extension path.

---

## V2.1 — Magic Key (portable identity, server-side)

**Why:** localStorage wipes destroy all user data. Users can't move between devices.

**How:**
- `hbs_magic_keys` table: `key_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TIMESTAMPTZ`
- Key is SHA-256 HMAC'd with `CRON_SECRET` before storage (no plaintext keys in DB ever)
- Min length 8 chars enforced client + server
- UI: "Sync across devices" card in Settings — user sets a key, enters it on next device
- `POST /api/hbs/magic-key` — set key for user_id (idempotent: updates if user_id matches, 409 if key taken by different user)
- `GET /api/hbs/magic-key?key=xxx` — returns `{user_id}` if found
- On second device: enter key → fetch user_id → write to localStorage → all data appears

**No email. No OAuth. No third party. Cost: $0.**

---

## V2.2 — Chrome Extension (real cart, every site)

**Why:** Honey model. User installs once. Extension has their cookies. No per-run cost.
No store API partnership needed. Works on Amazon, Walmart, Target, Instacart, Kroger, and every other retailer.

**Architecture:**
```
HiveBuyStuff web app
  → "Open in extension" button on cart result
  → message passes mapped item list to extension via postMessage / chrome.runtime

Chrome extension (Manifest V3)
  → content script on retailer checkout/search page
  → reads mapped items from web app message
  → adds items to cart by clicking "Add to cart" buttons via DOM automation
  → reports back: N items added, M failed
```

**Extension → web app communication:**
- Web app generates a one-time token stored in `hbs_ext_pending` (localStorage + `/api/hbs/ext/session`)
- Extension polls for pending sessions → executes → posts result back
- No persistent server connection needed

**Stores in V2.2 (by DOM stability, easiest first):**
1. Amazon — `#add-to-cart-button` (stable)
2. Walmart — `[data-automation-id="add-to-cart-button"]`
3. Target — `.AddToCartButton`
4. Kroger — `[data-testid="CartButton"]`
5. Instacart — `[data-testid="add-item-button"]`

**Revenue:** Amazon PA-API affiliate links. Extension replaces cart_url with PA-API product link before opening. ~3–8% commission on purchases. Zero cost per run.

**Timeline:** Manifest V3 Chrome extension, ~400 lines. Firefox port is the same codebase via `webextension-polyfill`.

---

## V2.3 — Amazon PA-API Affiliate Integration

**Why:** Passive revenue on every Amazon cart run, even without the extension.

**How:**
- `AMAZON_ASSOCIATE_TAG` env var (free to get from Amazon Associates)
- When routing to Amazon, append `&tag=ASSOCIATE_TAG` to cart_url
- PA-API (optional, richer): search by ASIN, get real product links, real prices
- Revenue: 3–8% on anything purchased within 24h of click

**API credentials needed:** Amazon Associates account (free), PA-API key + secret.

---

## V2.4 — Kroger OAuth2 + Real Cart API

**Why:** Only major retailer with a public OAuth2 + cart API. Real "Add to cart" without extension.

**Kroger API (developer.kroger.com):**
- `POST /v1/cart/add` with `items: [{upc, quantity}]`
- Requires user OAuth2 token (Kroger account login via HiveBuyStuff)
- Free developer tier: 10,000 API calls/month

**Flow:**
1. User connects Kroger account (OAuth2 PKCE flow)
2. We store `kroger_access_token` + `kroger_refresh_token` in `hbs_subscriptions`
3. On cart run → Kroger backend → AI maps items → fetch UPCs from Kroger product search → `POST /v1/cart/add`
4. User opens Kroger app/site → cart is ready

**Only real "cart populated" experience possible without extension in V2.**

---

## V2.5 — Run limit bypass via usage token (anti-abuse)

For Pro/Premium: replace monthly counter with a rolling 30-day window.
Prevents "reset on 1st of month" gaming.

---

## Sequencing

| Phase | Feature | Effort | Revenue impact |
|-------|---------|--------|----------------|
| V2.1 | Magic key | 1 day | Retention |
| V2.2 | Chrome extension | 3–4 days | Honey-model affiliate |
| V2.3 | Amazon PA-API | 1 day | Direct revenue |
| V2.4 | Kroger OAuth2 | 2 days | Real cart (no extension) |
| V2.5 | Rolling window | 0.5 day | Abuse prevention |

**Start with V2.1 (magic key) immediately — zero risk, instant user value.**
**V2.2 (extension) is the Honey play — build in parallel once E2E is green.**

---

## What V2 is NOT

- Computer Use (Anthropic) — too expensive per run for base tier, no free path
- MultiOn / Steel.dev — paid per-session, same problem
- Server-side headless browser — anti-bot blocked on major retailers, no user credentials
- Standalone app — the web app + extension combo is the right architecture

The Chrome extension IS the free computer use. It runs in the user's browser with their own session. That's how Honey works. That's how we work.
