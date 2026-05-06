# HIVE CONSTITUTION

> **Canonical governance document for the Hive ecosystem.** Every engine,
> every contributor, every CC session inherits this. CLAUDE.md is the
> operational mirror — runtime-actionable subset only. **Read this for
> the *why*; read CLAUDE.md for the *what to do right now*.**
>
> Update mechanism is in §VIII. Don't edit CLAUDE.md without
> reflecting the change here first.

---

## I. Identity and Positioning

The Hive is an **independent ecosystem of single-purpose engines**. Each
engine is its own product — its own domain, its own DNS record, its own
Vercel project, its own user-facing voice. They cohere because they all
inherit the standards in this document, not because they share code or
ownership.

**The Hive is governed by canonical standards, not by any individual.**
The standards are this document, the manifest schema
(`docs/specs/manifest-schema-final.md`), and the launch checklist
(`docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md`). HiveOps
(`tools/hive-ops/`) and HiveFinalize (`tools/hive-finalize/`) are the
machine-readable enforcement of those standards. When the standards
conflict with personal preference — including Sonny's — the standards
win.

### Sonny's role  `[ID_PROTECTION]`

**Sonny Saggar is positioned as peripheral consultant / advisor —
never founder, creator, or owner — in all public-facing content,
code, copy, articles, and profiles.** This is a permanent identity
rule. It governs:

- All blog posts, Medium articles, LinkedIn posts, white papers, press
  releases, product UI text, footer attributions, About pages, founder
  pages
- Email signatures from `hive@hive.baby` and any engine subdomain
  (`hivesupport@…`, `support@…`, etc.)
- Code comments that reference governance or attribution
- Any biographical sentence in any artifact shipped from a Hive
  engine

The acceptable framings are: *consultant on document infrastructure
strategy*, *advisor on AI readiness and governance*, *clinical AI
evaluation consultant*, *contributor to the Hive ecosystem*. The
unacceptable framings are: *founder of the Hive*, *creator of
[Engine]*, *owner of Universal Document™*, *the person behind the
Hive*. The consulting framework in CLAUDE.md (day rate, NDA posture,
disclosure paragraph) extends from this rule.

### Each engine inside the Hive

…is its own product but inherits Hive standards via HiveOps
enforcement. An engine may have its own brand voice, tone, and feature
set, but it cannot diverge from:

- The canonical Hive gold (`#D4AF37`)
- The canonical 7-language locale floor (en, es, fr, ar, hi, zh, pt)
- The canonical free-tier promise (no ads, no investors, no agenda)
- The canonical install / first-visit / AHTS onboarding stack
- The canonical brand integration (logo, footer signature, favicon
  set, theme color, manifest)
- The canonical secret naming (§II)

Engines that *must* deviate file a waiver via the HiveOps override
schema (§V) — never silent divergence.

---

## II. Engineering Standards

### Tech stack (canonical)

| Concern | Canonical choice |
|---|---|
| Framework | **Next.js 14 + TypeScript** (app router) |
| Hosting | **Vercel** (auto-deploy on push to `main`) |
| AI | **Anthropic API**, model `claude-haiku-4-5-20251001` unless an engine spec names a different one |
| Database | **Neon PostgreSQL** (serverless) |
| Auth | **Clerk** for user-account engines; HMAC-signed cookies for stateless tier auth |
| Payments | **Stripe** (subscriptions: Plus monthly + Pro monthly/annual) |
| Email | **Resend** for transactional; **Cloudflare Email Worker** for inbound |
| DNS | **Cloudflare** (`hive.baby` zone) |
| Captcha | **Cloudflare Turnstile** (server-side verify) |

Engines that legitimately need a different stack item declare it in
their `ENGINE_GRAMMAR.md` `stack:` field. The canonical defaults are
the tie-breaker when no override is declared.

### Canonical secret names  `[CANONICAL_SECRETS]`

These are **the names CC must use** in code, env vars, GitHub Actions
secrets, and Vercel project env vars. **Never variant names.** If an
existing engine uses a variant, migrate it; don't propagate the variant.

```
ANTHROPIC_API_KEY      Anthropic API key
CF_TOKEN               Cloudflare API token (account scope)
CF_API_TOKEN           Cloudflare API token (zone scope, hive.baby)
CF_ZONE                Cloudflare zone ID
CF_ACCOUNT             Cloudflare account ID
DATABASE_URL           Neon PostgreSQL connection string
RESEND_API_KEY         Resend transactional email
VERCEL_TOKEN           Vercel CLI / API token
CLERK_SK               Clerk secret key (server)
CLERK_PK               Clerk publishable key (client)
STRIPE_KEY             Stripe secret key
STRIPE_PK              Stripe publishable key
STRIPE_WEBHOOK_SECRET  Stripe webhook signing secret
CRON_SECRET            Internal cron / GitHub Actions auth
PLUS_AUTH_SECRET       HMAC signing key for Plus signed cookie
```

Engine-specific Stripe price IDs follow the pattern
`STRIPE_PRICE_<TIER>_<INTERVAL>` (e.g. `STRIPE_PRICE_PLUS_MONTHLY`,
`STRIPE_PRICE_PRO_ANNUAL`).

> **TODO (HiveOps enforcement):** v0.3 should add an N03 rule that
> compares an engine's `env_vars_required` frontmatter against its
> Vercel project's actual env vars + the canonical secret names in
> this section.

### Canonical brand

| Token | Value | Use |
|---|---|---|
| **Hive gold** | `#D4AF37` | All primary CTAs, brand elements, `themeColor`, manifest `theme_color` |
| Gold-hi | `#FFE6A1` | Highlight on the install CTA gradient |
| Gold-dim | `#8a6f1f` | Borders + outline on gold elements |
| **Hive ink** | `#0a0a0a` | Primary text + dark backgrounds |
| Paper | `#f5f1e6` | UD-equivalent for engines using the UD design system |
| Muted | `#9a9588` | Secondary text |

### Canonical 7-language locale set (free-tier floor)  `[LOCALE_SET]`

Every engine ships these locales in `apps/<engine>/locales/<code>.json`:

```
en  English
es  Spanish
fr  French
ar  Arabic
hi  Hindi
zh  Simplified Chinese
pt  Portuguese
```

`navigator.language` detection at page load with English fallback.
Plain-language user-voice phrasing throughout (no metaphors that don't
translate, e.g. "drop pin"). The canonical 7 are the **free-tier
floor** — paid tiers may extend (the `@hive/onboarding` package
documents the `setLocaleOverrides()` extension hook for ≤200-language
support).

### Canonical onboarding (`@hive/onboarding`)  `[PWA_STANDARDS]`

Three components are shared across every engine via the
`@hive/onboarding` package (canonical source:
`packages/hive-onboarding/`):

- `<HiveInstallHint />` — top-of-page install banner
- `<HiveFirstVisitExplainer />` — under-CTA first-visit copy
- `<HiveAHTSPrompt />` — post-first-action "Add to Home Screen" card

**Framing rule:** "Add to home screen" everywhere. **Never "Install
[Engine]"** — that framing reads as Play Store / App Store, which the
Hive deliberately bypasses.

### Canonical brand integration (every engine)  `[FOOTER_SIGNATURE]` `[OFFLINE_COPY]`

- **HIVE_HEADER_LOGO** — `public/hive-logo-full.png` shown on every page
- **HIVE_FOOTER_SIGNATURE** — "Made with ♥ in the Hive" row in canonical
  Hive gold; the word "Hive" links to `https://hive.baby` in a new tab
- **FAVICON_COMPLETE** — `favicon.ico` (multi-res), `icon-192.png`,
  `icon-512.png`, `apple-touch-icon.png` (180×180), `maskable-icon.png`
  (512×512 with safe zone)
- **TAB_TITLE_DESCRIPTIVE** — `"<Engine name> — <tagline>"` exactly; no
  bare engine name, no marketing fluff
- **THEME_COLOR_CANONICAL** — `#D4AF37` in `metadata.themeColor` AND
  `manifest.json` `theme_color`
- **APPLE_WEB_APP_META** — `metadata.appleWebApp = { capable: true,
  title: "<Engine>", statusBarStyle: "black-translucent" }`
- **MANIFEST_COMPLETE** — `public/manifest.json` with all canonical PWA
  fields (name, short_name, description, theme_color, background_color,
  display: "standalone", start_url, scope, id, icons array with `any`
  + `maskable` purposes)
- **Service worker** — `public/sw.js` with offline shell (cache-first
  for static assets, network-first for pages, bypass for `/api/`)

### Production copy hygiene  `[HONEST_UX]`

- **No "coming soon" / "not yet" / "TODO" placeholders in production
  user-facing copy.** If a feature isn't ready, hide it entirely
  rather than advertise it as inactive (the bait-and-switch UX is
  worse than absence — see UD Converter PR #11 lessons in §VII).
- **No third-party analytics** (Google Analytics, Hotjar, Segment,
  Mixpanel, etc.). Plausible (privacy-respecting, no cookies) is
  acceptable for engines that already have it; the existing
  `hive_alerts` Neon table is the engine-level signal mechanism going
  forward.
- **Cite real sources visibly** when displaying third-party data:
  `Data sources: [list]. Analysis: Hive Clarity Substrate. Retrieved:
  [date].` Never make up facts.

> **TODO (HiveOps enforcement):** v0.3 should add a copy-grep rule
> that fails on `coming soon`, `not yet`, `TODO`, `XXX`, `FIXME` in
> `app/**/*.tsx` outside comment blocks.

---

## III. Pricing and Cost Profiles  `[PRICING_MODEL]`

Engines declare a **cost profile** in `ENGINE_GRAMMAR.md` frontmatter
under `cost_profile`. The profile drives the free-tier rules.

### Profiles

| Profile | Per-use marginal cost | Free-tier rule |
|---|---|---|
| `zero_marginal` | $0 (no API calls per use) | **Unlimited free** + optional patronage support |
| `low_marginal` | < $0.001 per use (e.g. Groq-routed) | **10 conversions / day free** |
| `medium_marginal` | $0.001–$0.01 per use | **3 lifetime free**, max **1 / 24h** |
| `high_marginal` | > $0.01 per use | **No free tier**, or **1 lifetime demo** with explicit upgrade prompt |

### Paid tiers (uniform across the ecosystem)

| Tier | Price | Includes |
|---|---|---|
| **Plus** | $0.97 / month | Unlimited single-file/single-action conversions, captcha-bypass, signed-cookie auth |
| **Pro** | $29 / month | Plus features + power features (varies per engine: batch ZIP, API access, chain of custody, etc.) |

Pro features that typically gate behind the $29 tier: batch processing,
external API access, audit logs, and any feature that a power user can
trade time for money on.

### Internationalization is free

**UI localization in the canonical 7 languages is free for every tier
regardless of cost profile.** A free user gets the same locale coverage
as a Pro user. Translation is not a paywall feature.

### Safety-critical info is always free

Drug recalls, food hygiene, vehicle recalls, regulatory alerts — never
Pro-gated. The Hive's free-tier promise applies first to the things
people might genuinely need.

> **TODO (HiveOps enforcement):** A v0.3 rule should compare an engine's
> declared `cost_profile` against its actual rate-limit implementation
> (e.g. `medium_marginal` should have a 3-lifetime-1-per-24h gate in
> `/api/*/route.ts`). Today this is verified only by review.

---

## IV. Workflow Conventions

### Standing merge rule  `[SCOPE_DISCIPLINE]`

**Every change goes through a PR.** Open PR → CI green → autonomous
merge. Never direct-to-main, including for ops workflows, docs, and
configuration files. Auto-merge on green is fine; the PR step is
non-negotiable. This applies to every repo in the Hive ecosystem
(hivebaby, universal-document, hive-aestheticbestie, hive-imr,
hive-hivephoto, etc.).

### Ask before scope expansion

If a prompt asks for X, CC ships X. **If CC believes a different /
larger approach is better, CC asks first with rationale** — does not
silently substitute. Examples:

- Prompt: "fix the failing test." Allowed: fix the test.
  Not allowed: refactor the test framework while you're in there.
- Prompt: "add a column to this table." Allowed: add the column.
  Not allowed: also add a separate index, change the migration tool,
  or rename two adjacent columns.

The bar for unprompted scope: it must be necessary to complete the
named task and reversible. Anything else gets surfaced as "I'd suggest
also doing Y for these reasons — proceed?"

### CC handles infrastructure setup autonomously  `[INFRA_AUTONOMOUS]`

Where the operation has a working API, CC does it directly. Specifically:

- **Stripe** — products + prices via Stripe API
- **Cloudflare** — DNS records + Turnstile sites via CF API
- **Vercel** — env vars + redeploys via Vercel CLI / API
- **Secrets** — generation via `openssl rand -base64 32`
- **GitHub Actions secrets** — via `gh secret set`
- **PR creation, merge, issue filing** — via `gh` CLI

**Never instruct the human to "go to dashboard X and click Y"** except
where the API genuinely lacks the operation (rare; example: Vercel
Blob first-party storage requires a one-time UI provisioning step).
When this happens, CC names the exact dashboard URL + the exact field
+ what value to enter.

### Diagnostic rule  `[BUILD_DIAGNOSTICS]`

**Pull Vercel build logs first on any deployment error.** Don't guess
at root cause from the symptom; the build logs reveal the actual error
in two-thirds of cases. This is enshrined in CLAUDE.md and not to be
forgotten under time pressure.

### Infrastructure assumption  `[INFRA_PERMANENCE]`

**Never assume Hive infrastructure doesn't exist.** Search before
declaring missing:

- Grep deeply for any name pattern, not just the canonical name
- Check env vars with multiple variants (e.g. `STRIPE_KEY`,
  `STRIPE_SECRET_KEY`, `STRIPE_API_KEY`)
- Check both `~/.zshenv` and GitHub Actions secrets and Vercel env vars
- Check both the engine's own repo and the hivebaby monorepo
- Check whether a referenced file exists at multiple plausible paths

When something genuinely doesn't exist, CC reports the exact search
performed (which paths, which name variants) so the human can verify
or correct.

### Device verification mandatory  `[DEVICE_VERIFY]`

**Every PR with UI changes must verify on real iOS Safari and real
Android Chrome (or accurate device profiles in WebKit / Chromium
headless).** Vercel CI green is **not sufficient.** Past iOS Safari
regressions (PR #70 in ParkBack — render-only-the-compass bug — see
§VII) shipped past green CI because the production iOS render was
never verified.

The verification proof points are:
- `DEVICE_VERIFIED_IOS` = real iPhone Safari (or WebKit + iPhone 14
  device profile) loaded the engine's primary surface and the primary
  action completed
- `DEVICE_VERIFIED_ANDROID` = real Android Chrome (or Chromium +
  Pixel device profile) loaded the engine's primary surface and the
  primary action completed

> **TODO (HiveOps enforcement):** v0.3 should add behavioral rules
> (B04, B05 in [hivebaby#89](https://github.com/saggarsonny-boop/hivebaby/issues/89))
> that automate this. Until then, the rule is enforced by review +
> the engine's own `launch_checklist_state.test_slot` boolean in
> `ENGINE_GRAMMAR.md`.

### Identity rule (operational)

**Sonny is never to be presented as founder / creator / owner of the
Hive or any engine in any code, copy, or content.** See §I for the
canonical framings. This rule applies to scaffolded copy CC writes
(About pages, signup confirmations, error pages, marketing emails),
not just hand-edited content.

---

## V. HiveOps Governance  `[HIVEOPS_v01]` `[ENGINE_FINALIZATION]`

### Two enforcers, one report

| Tool | Domain | Source of rules |
|---|---|---|
| **HiveOps** (`tools/hive-ops/`) | Engine launch checklist (filesystem) | `docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md`, encoded as **H-rules** (H01..H28) in `tools/hive-ops/rules.ts` |
| **HiveFinalize** (`tools/hive-finalize/`) | Engine manifest schema | `docs/specs/manifest-schema-final.md`, encoded as **V-rules** (V01..V29) in `tools/hive-finalize/validate.ts` |

As of v0.2 (PRs #85, #87, #88), HiveOps invokes HiveFinalize
internally and produces a **single combined audit report** covering
both rule families. One CLI invocation; one verdict.

### Engine-class profiles

Engines declare an `engine_class` field in `ENGINE_GRAMMAR.md`
frontmatter:

| Class | When to use | Effect |
|---|---|---|
| `nextjs` | Next.js app-router engine (canonical default) | All H-rules apply |
| `static-html` | Plain HTML/JS (e.g. hivebaby planet front door) | Skips Next.js-specific rules (H02, H07, H16, H17, H24, H25) |
| `api-only` | Backend-only with no public UI | Skips visual-surface rules (H08, H11–H15, H22, H23, H25) |
| `hybrid` | Mixed | All H-rules apply (no exemptions) |

If absent, defaults to `nextjs`. Inapplicable rules report `n/a` and
do **not** count toward the verdict. V-rules apply universally.

### Override schema

Engines that legitimately can't satisfy a rule declare an override in
their `ENGINE_GRAMMAR.md` under the `## Hive-Ops Overrides` heading,
as a YAML fenced block:

```yaml
overrides:
  - rule: V01                          # H## or V## ID
    mode: warn                         # warn | waive
    reason: "Why this rule cannot apply (≥20 chars)"
    issue: https://github.com/saggarsonny-boop/<repo>/issues/<n>
    reviewer: <name>
    date: 2026-05-06
    warn_until: 2026-05-13             # required for mode: warn (default +7d, max +30d)
```

**Validation rules for override entries:**
- `rule, mode, reason, issue, reviewer, date` are all REQUIRED
- `mode` ∈ {`warn`, `waive`}
- `date` and `warn_until` are ISO `YYYY-MM-DD`
- `issue` must be a `github.com/<owner>/<repo>/issues/<n>` URL
- For `mode: warn`: `warn_until` defaults to date + 7 days; max 30 days
- Expired warns automatically lapse back to `fail` with explanatory note
- `mode: waive` is permanent; reported as `override` in the audit
- Unknown rule IDs are parse errors
- Rules marked `unwaivable` (currently H01) reject any override entry

### Warn mode philosophy

Warn-mode is **temporary cover for in-flight fixes**, not a hiding
place. The 30-day hard ceiling guarantees that today's warn becomes
tomorrow's fail without anyone having to remember. Anything needing
more than 30 days is either a `waive` (with documented reason) or a
change to the rule itself.

### Override audit log

> **TODO:** create `docs/hiveops-override-log.md` as the canonical log
> of all overrides applied across the ecosystem. Update on every PR
> that adds or removes an override entry. Format: one row per
> override, columns `engine | rule | mode | reason | issue | date |
> warn_until | reviewer`. v0.3 of HiveOps should auto-populate this
> via a `--export-overrides` flag run on a cron. Until that ships,
> maintain by hand.

### `--write-overrides` automation

When an audit fails, run:

```sh
# Review mode — print proposed entries to stdout
tsx tools/hive-ops/cli.ts <slug> --write-overrides

# Apply mode — splice into ENGINE_GRAMMAR.md (idempotent)
tsx tools/hive-ops/cli.ts <slug> --write-overrides --apply

# Customize horizon + reviewer
tsx tools/hive-ops/cli.ts <slug> --write-overrides --apply \
  --warn-days 14 --reviewer Sonny
```

Each proposal defaults to `mode: warn` with a 7-day `warn_until` and
clearly-marked `TODO:` placeholders for `reason` + `issue`. The
reviewer must replace these before committing — unfilled scaffolding
is obvious in diff review.

### Block / pass behaviour

| Verdict | CI behaviour |
|---|---|
| `pass` (no fails, no warns) | Merge unblocked |
| `warn` (no fails, ≥1 warn) | Merge unblocked; warns surface in PR summary |
| `fail` (≥1 unwaived fail) | Merge **blocked**; the failing rule must be fixed or have a valid override |

### Operator role convention  `[OPERATOR_ROLE]`

Every Hive engine with tier gates implements an **operator role bypass**
via the shared `@hive/auth` pattern. The operator role exists for
testing, debugging, and emergency access — it is not a paid tier.

**Resolution priority** (first match wins):

1. Clerk session with `publicMetadata.role === 'operator'`
2. Signed `ud_operator` cookie (HMAC-signed; `PLUS_AUTH_SECRET` keys it)
3. `x-ud-operator-key` header (server-side compare against
   `OPERATOR_API_KEY` env var)

When any of the three resolves, the request bypasses tier gates,
captcha, and rate limits. **Every operator action must log to the
engine's `engine_operator_audit` Neon table** — operator access is
auditable by design, not invisible.

The shared implementation lives at `packages/hive-auth/operator.ts`
(canonical source) and is re-exported by `@hive/auth`. Engines that
inline (per `[INLINE_PACKAGE]`, e.g. UD Converter) mirror the file at
`apps/<engine>/src/lib/hive-auth/operator.ts` with a sync-pointer README
to the canonical copy.

**HiveOps v0.3** will add a rule (likely H29) verifying any
tier-gated engine imports the operator auth pattern. Until then, the
rule is enforced by review and the engine's own `ENGINE_GRAMMAR.md`
checklist.

---

## VI. Engine Inventory and Compliance Status

The Hive currently spans 30+ engines across multiple repos. Of these, 8
ship `ENGINE_GRAMMAR.md` in the hivebaby monorepo today (the rest are
either pre-canonical-schema or live in their own repos awaiting
migration). The hivebaby planet front door is at <https://hive.baby>.

### Hivebaby-resident engines (with HiveOps audit)

| Engine | Slug | Domain | Cost profile | HiveOps verdict (latest) | Notes |
|---|---|---|---|---|---|
| ParkBack | `parkback` | parkback.hive.baby | zero_marginal | **PASS** — 48 pass / 0 fail / 3 override (V01, V18, V19) | Canonical migration done in PR #83 |
| HiveActivityPartner | `hiveactivitypartner` | activitypartner.hive.baby | medium_marginal | **PASS** — 50 pass / 0 fail / 2 override (V18, V19) | Phase 1 of 6 shipped via PR #91; status `building` |
| HivePlainScan | `hive-plainscan` | plainscan.hive.baby | (TBD) | not yet audited | Building |

### Hivebaby-resident engines (pre-canonical schema, no HiveOps audit yet)

These have an `ENGINE_GRAMMAR.md` but use the legacy `<GrapplerHook>`
shape, not canonical YAML frontmatter. **TODO:** migrate each per the
PR #83 template:

- `hive-aestheticbestie` (canonical migration template, PR #56)
- `hive-imr`
- `hive-hivephoto`
- `imgtrainer`

### External-repo engines (canonical schema present)

| Engine | Repo | Domain | HiveOps verdict (latest) | Notes |
|---|---|---|---|---|
| UD Converter | `universal-document` | converter.hive.baby | **FAIL** — 48 pass / 4 fail (V04, V18, V19, V23) / 1 override (H21) | Pre-existing V-rule findings; `--write-overrides` proposal scaffolded but not yet committed |

### External-repo engines (no canonical schema yet)

CLAUDE.md lists the broader inventory of 30+ engines. Most live in
their own repos and have not yet migrated to the canonical
`ENGINE_GRAMMAR.md` schema or been audited by HiveOps. Migration is
the path: each engine adds the frontmatter per `manifest-schema-final.md`,
adopts `@hive/onboarding`, runs `tsx tools/hive-ops/cli.ts <slug>`,
and lands its first audit. See CLAUDE.md "Repos, Domains & Status" for
the full ecosystem table.

> **TODO:** generate this section programmatically from
> `engines.json` + `tools/hive-ops/cli.ts <slug> --json` per engine.
> Today it's curated by hand and will drift. v0.3 of HiveOps should
> ship a `--all-engines` mode that emits a constitution-ready
> compliance table.

---

## VII. Architecture Decisions and Lessons Learned

This section grows over time and is **never pruned**. Each entry is a
single paragraph: the incident or insight that motivated a rule.

### iOS Safari render-only-the-compass bug → device verification mandatory

ParkBack PR #70 (`feat(parkback): programmatic install (Chrome/Edge) +
iOS guided overlay`) shipped past green Vercel CI, but on a real
iPhone Safari it rendered only the compass widget — the rest of the
page was blank. Root cause was an iOS-only edge case in the install
prompt code path interacting with the layout tree. The CI had no real
iOS render coverage. **Rule (§IV):** every UI PR verifies on real iOS
Safari and Android Chrome before merge. Green CI is necessary, not
sufficient. v0.3 will automate this via headless WebKit + iPhone
device profile (B04, B05 in
[hivebaby#89](https://github.com/saggarsonny-boop/hivebaby/issues/89)).

### Anthropic API key paste leak → never paste secrets in CC chat

A previous session pasted an Anthropic API key directly into the
chat. The key reached the conversation log; the conversation log is
not a secret store. **Rule (§II):** secrets live in `~/.zshenv`
(local), GitHub Actions Secrets (CI), Vercel project env vars
(production). CC reads them via `process.env.<NAME>` or `gh secret
list`; CC never asks the user to paste a secret value into the
prompt.

### T2 went off-script combining PRs → "ask before scope expansion" rule

A prior session was asked to ship change X and shipped X plus an
adjacent improvement Y the agent thought was a good idea. The
adjacent improvement broke an unrelated subsystem. **Rule (§IV):**
if the agent believes a different / larger approach is better, ask
first with rationale. Don't silently substitute the prompt's stated
scope.

### T1 told user to do dashboard work → "CC handles infra autonomously" rule

A prior session asked the user to "go to the Vercel dashboard and
click Settings → Environment Variables and add `STRIPE_SECRET_KEY`."
The Vercel CLI + API can do this directly; the user shouldn't be
the secretary for an operation CC could perform. **Rule (§IV):** CC
handles Stripe (API), Cloudflare (API), Vercel (CLI), GitHub
Actions secrets (gh CLI), DNS (CF API), secret generation (openssl)
without delegating back to the user. Only deviates when the
operation genuinely lacks an API surface (rare).

### UD Converter Vercel edge body limit → free-tier 4 MB cap  `[BLOB_ARCHITECTURE]`

The Guaranty PDF (13.5 MB) failed on production with a generic "Could
not process this file" toast. Investigation showed Vercel Hobby's edge
proxy returns HTTP 413 for any request body > ~4.5 MB **before the
function runs**. The route's own `MAX_FREE_BYTES = 10 MB` was
unreachable. The client's `res.json().catch()` swallowed the edge's
HTML 413 → generic toast. **Decision** (PR #16, universal-document):
ship a 4 MB client-side gate with an honest error message + a
defense-in-depth server gate; **not** upgrade to Vercel Pro for $20/mo
(stays Hobby per founding constraints) and **not** rush a blob-upload
architecture (4–6 hours of work for a feature most users don't need
yet). Larger files get a "Files over 4 MB aren't supported on free
tier yet — direct upload is coming" message in all 7 locales.

### `@hive/onboarding` inlined in universal-document → cross-tree React deduplication

When UD Converter (in the `universal-document` repo) tried to consume
`@hive/onboarding` (in the `hivebaby` repo), early attempts at a
cross-tree workspace dependency produced two React instances:
`useState` returned `null` at SSR-prerender time because the hook
context was bound to the other React copy. Root cause:
universal-document doesn't have a root `node_modules` tree, so
transitive React resolution from a shared package via a path alias
was fragile. **Decision** (PR #17): inline the package source at
`apps/converter/src/lib/hive-onboarding/` with a sync-pointer README
referencing the canonical hivebaby copy. Import statements stay
identical to ParkBack's pattern (`import { ... } from
'@hive/onboarding'`) via a tsconfig path alias + webpack alias to
the local source. When the canonical package bumps, mirror the
changes in the inlined copy as a follow-up PR. This is the canonical
pattern for engines outside the hivebaby monorepo until a workspace
solution lands.

### "Coming soon" labels in production → bait-and-switch UX

UD Converter PR #11 fixed a bug where the From-format dropdown showed
234 potential output formats, but only ~30 were actually implemented.
Selecting an unimplemented pair surfaced "coming soon — disabled"
states that frustrated users who'd already invested in selecting their
file. **Decision:** hide unsupported pairs entirely from the dropdown,
and add a "Don't see your format? Tell us" mailto link beneath. The
broader rule (§II): no "coming soon" / "not yet" / "TODO" placeholders
in production user-facing copy. Hide the absent feature; surface a
demand-capture signal instead.

### Anthropic whole-PDF fallback timeout → diagnose-first rule

UD Converter PR #2 added per-page graceful degradation but kept an
Anthropic whole-PDF fallback that exceeded the Vercel function 30s
timeout. The user-visible symptom was the same generic toast; the
actual cause was a silent timeout from a fallback path. PR #5 removed
the auto-fallback (Anthropic gated to Pro-tier opt-in only). **Rule
(§IV):** pull Vercel build + runtime logs FIRST on any deployment
error. Don't speculate from the symptom.

### CI workflow only installed hive-ops deps → install all consumed packages

HiveOps v0.2 Phase 1 wired hive-finalize's `validate.ts` into the
runner. The local audit worked because a prior `npm install` had
populated `tools/hive-finalize/node_modules`. CI's clean checkout
exposed the gap: `gray-matter` was unreachable, audit crashed with
`ERR_MODULE_NOT_FOUND`. **Fix:** workflow now installs both
packages. **Lesson:** when a tool grows a new transitive dependency
on a sibling package, audit every CI workflow that invokes it.

### Stale PR conflicts after parallel i18n landings → catalog edits over JSX edits

PR #15 originally edited the hardcoded TierIndicator CTA text. While
that PR was open, a separate i18n refactor (PR #14) moved the CTA
into the locale catalog. PR #15 went DIRTY. **Decision:** close PR
#15, reopen as PR #19 editing the locale catalog instead of the
hardcoded text. **Rule:** for engines that have already migrated to
locale-catalog-driven UI, prefer catalog edits over component-source
edits. The catalog is the i18n contract; touching the component is
a regression in the abstraction.

### Engine-class profiles (HiveOps v0.2 Phase 2)

The v0.1 audit treated every rule as universally applicable. A
static-html engine like the hivebaby planet would have failed the
Next.js app-router rule (H02) despite legitimately not needing one.
v0.2 introduced engine-class profiles and a small applicability
matrix. **Lesson:** uniform enforcement is a regression in usability;
class-aware enforcement is the canonical approach. Adding new engine
classes is a deliberate decision (today: `nextjs`, `static-html`,
`api-only`, `hybrid`) — not a free-for-all.

---

## VIII. Update Mechanism  `[GOVERNANCE_LOCATION]`

- **Constitution updates require a PR** with the constitution diff.
  No direct-to-main, no exceptions, including for typo fixes.
- **CLAUDE.md is downstream of HIVE_CONSTITUTION.md.** When a rule
  changes here, the operational mirror in CLAUDE.md updates in the
  same PR. Don't update CLAUDE.md without reflecting the change here
  first.
- **Memory rules from claude.ai user memory are reflected here, not
  vice versa.** When the user asks CC to "remember X" and X is a
  governance rule (not a session-local preference), capture it here
  as part of the next constitution PR.
- **HiveOps rules** can be added by updating this document AND the
  corresponding rule definition in `tools/hive-ops/rules.ts` (H-rules)
  or `tools/hive-finalize/validate.ts` (V-rules). The PR description
  lists which rule was added and why.
- **Lessons Learned (§VII) grows over time; never prune.** A lesson
  may be marked superseded with a one-line note explaining what
  replaced it, but the historical incident stays. The point is to
  preserve institutional memory of the *why*, not to keep the
  document tidy.

> **TODO (governance loop):** Today the constitution is updated by
> hand. Once HiveOps v0.3 lands cross-engine consistency rules
> (X01–X03 in [hivebaby#89](https://github.com/saggarsonny-boop/hivebaby/issues/89)),
> a CI check should fail if a HiveOps rule exists in `rules.ts` /
> `validate.ts` but isn't documented in §V here, and vice versa.
