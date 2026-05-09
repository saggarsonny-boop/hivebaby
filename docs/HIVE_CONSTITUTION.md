# HIVE CONSTITUTION

> **Canonical governance document for the Hive ecosystem.** Every engine,
> every contributor, every CC session inherits this. CLAUDE.md is the
> operational mirror — runtime-actionable subset only. **Read this for
> the *why*; read CLAUDE.md for the *what to do right now*.**
>
> Update mechanism is in §IX. Don't edit CLAUDE.md without
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
  worse than absence — see UD Converter PR #11 lessons in §VIII).
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

### Never procrastinate  `[NEVER_PROCRASTINATE]`

**Never delay action when work can be done now.** Don't propose "we
could do this later" when it can be done now. Don't suggest stopping
when work remains. Only Sonny decides when to stop. Default behavior
is forward motion.

When CC notices follow-up work mid-task — a missing doc, a stale
config, an obvious refactor unblocked by what was just shipped —
the right move is usually to do it in the same flow (subject to
`[SCOPE_DISCIPLINE]`: ask if it materially expands the requested
work). "I'll come back to this" without a concrete trigger is
procrastination dressed up as planning. Phrases to avoid in CC
outputs: "we could revisit this later," "left as a follow-up,"
"this can wait." If the work is small and unlocked, ship it; if
it's large and out of scope, file an issue with the actual blocker
named — don't leave it as a vague intention.

### Free over paid  `[FREE_OVER_PAID]`

**When a choice exists between a free path and a paid path that
achieve similar outcomes, choose free.** Sonny's standing preference
is **$0/month operating cost.**

- Vercel Blob free tier over Vercel Pro upgrade
- Direct Anthropic API key over additional service subscriptions
  (LangSmith, Helicone, etc.) when the API gives the same data
- Native CLI / API over paid SaaS for the same capability
- Free-tier Cloudflare / Neon / Resend over paid tiers until usage
  genuinely exceeds the limit

**Honest tradeoffs are acceptable; defaulting to paid for convenience
is not.** If the paid path is materially better (e.g. Vercel Pro for a
genuine concurrency need that the architecture can't sidestep), CC
names the tradeoff and asks. The bar is "can the same outcome land at
$0?" — if yes, $0 wins by default. This is a founding constraint, not
a temporary budget choice; it expresses the "no investors, no agenda"
posture in §I.

### Machine over human  `[MACHINE_OVER_HUMAN]`

**When a task can be done by a machine OR by Sonny, the machine does
it.** CC handles all infra setup, secret management, deploy
operations, dashboard interactions, file edits, env var provisioning,
and any operation where the API or CLI permits it. Strengthens
`[INFRA_AUTONOMOUS]` with an explicit ordering rule.

- Default: CC executes the operation via API / CLI / scripted
  dashboard call.
- Fallback: CC retrieves a missing token from GitHub Actions secrets,
  generates one with `openssl rand`, or scripts the missing
  capability.
- Last resort: CC asks Sonny to perform a UI action — and only when
  CC has explicit evidence the API doesn't support the operation
  (linked docs, attempted call with the actual error, or a known
  vendor limitation). "I think the API doesn't have this" is not
  evidence; "the docs say this is a UI-only step" is.

Asking Sonny to click in a UI is the absolute last resort. Creatively
work around tooling limitations rather than offloading to human
hands. When the last resort is genuinely required, CC names the exact
URL + the exact field + the exact value, never a multi-step manual
recipe.

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
§VIII) shipped past green CI because the production iOS render was
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

### Operator Role Convention  `[OPERATOR_ROLE]`

Every Hive engine with tier gates implements operator role bypass via the shared auth pattern. Three valid markers in priority order:

1. **Clerk** — `publicMetadata.role === 'operator'` on the authenticated user. Engines that don't wire Clerk middleware can leave this dormant; the cookie + header markers cover the auth path.
2. **Signed cookie** — `ud_operator` HMAC-SHA256 cookie (or `<engine>_operator` for engines that prefix), issued by the engine's `/api/operator/login` route on first successful POST of `OPERATOR_SETUP_CODE`. Default 30-day TTL.
3. **Header** — `x-ud-operator-key` (or `x-<engine>-operator-key`) matching the engine's `OPERATOR_KEY` env var, constant-time compared. For CLI / automation use.

Operators bypass tier gates, captcha, and rate limits — treated as the engine's highest tier downstream (Pro for UD Converter, equivalent for others). Every operator action logs to `<engine>_operator_audit` (Neon) with `(user_identity, action, engine_slug, file_size, file_type, timestamp, request_id)`. The operator role exists for testing, debugging, and emergency access; it is **not** a marketing tier and must never be exposed in UI or pricing.

Required env vars per engine: `OPERATOR_AUTH_SECRET` (32-byte base64; HMAC signing key), `OPERATOR_KEY` (32-byte hex; CLI header value), `OPERATOR_SETUP_CODE` (6-digit numeric; single-use bootstrap code, rotated by the operator each time a new cookie is issued).

Reference implementation: `apps/converter/src/lib/operator-auth.ts` in `saggarsonny-boop/universal-document` (PR #22). HiveOps v0.3 will add a rule (likely **H29**) verifying any tier-gated engine imports this pattern; until then, the convention is documented here and engines self-attest in their `ENGINE_GRAMMAR.md`.

### Pan-Hive architecture map  `[HIVE_ARCHITECTURE]`

The pan-Hive architecture map lives at [`docs/HIVE_ARCHITECTURE.md`](HIVE_ARCHITECTURE.md). It documents the five-layer stack — Queen Bee (foundation) → Foundry + Factory (build infrastructure) → core substrates → engines → public surfaces — with Mermaid diagrams of inheritance, data flow, module reuse, and per-engine substrate adoption.

The architecture map is the canonical answer to *"where does engine X fit?"* and *"which substrate does engine Y inherit?"* CC reads it at the start of any session that touches more than one engine. v0.1 (2026-05-08) covers everything verifiable today; sections marked **AWAITS T1 PR** will be amended when T1's Queen Bee discovery PR lands.

The architecture map distinguishes four kinds of thing in the Hive: **engines** (own purpose, workflows, output, public domain, pricing tier, DB schema, `ENGINE_GRAMMAR.md`), **modules** (attach via API or component import, no own product surface, no own deployment), **substrates** (registry-tracked patterns, extracted at the 3-engine threshold), and **adoption amplifiers** (cross-cutting growth/retention features every engine inherits). Conflating these is the most common confusion; the map exists to keep them separated.

### Queen Bee Substrate Registry  `[QUEEN_BEE_SUBSTRATES]`

When a pattern is built once for a single engine and then becomes a candidate for reuse, it lives in the substrate registry at [`docs/QUEEN_BEE_SUBSTRATES.md`](QUEEN_BEE_SUBSTRATES.md) until it crosses the **3-engine threshold** for extraction into a `@hive/*` package. The registry is the staging area between "one engine built this" and "this is part of the shared package set."

The registry is the canonical pointer for the 13 substrate patterns extracted from the 2026-05-08 HAP scaffolding work — operator auth, audit dashboards, the inline `@hive/onboarding` workaround, the strings/useStrings split, direct-to-blob upload, the cost-cap circuit breaker, the 7-language locale generator, the validation utility shape, defense-in-depth response stripping, the atomic bounded counter, `hive_alerts` telemetry, tier-based rate limiting, and the Stripe tier subscription pattern. Each entry documents its current implementations, canonical shape, when-to-use criteria, and the threshold at which it should be extracted.

When an engine needs any of these patterns, it reads the registry first. When an engine adds a new reusable pattern, the engine's PR also amends the registry. When a pattern crosses three production engines, the next PR extracts it to `@hive/<package-name>` and the registry entry becomes a historical pointer.

### Cross-repo audit — daily sweep covers external engines  `[CROSS_REPO_AUDIT]`

The daily sweep (`.github/workflows/hive-ops-daily-sweep.yml`) used to scan only `apps/<engine>/ENGINE_GRAMMAR.md` inside the hivebaby monorepo. External-repo engines — UD Converter, HiveEngineBuilder, HiveAdminSupport, UniversalDocumentInc, etc. — were invisible to it; verdict drift went undetected for days at a time. PR #131 (the T4 audit doc) surfaced this gap, and the next PR built the fix.

The sweep now ALSO clones every engine listed in `tools/hive-ops/external-engines.json`, runs the same `runHiveOps()` against each clone, and merges the results into the daily issue body under an `## External-repo engines` section. Tier-2 `hive_alerts` are inserted on every external FAIL (action_url points at the engine repo so the alert is actionable). The orchestrator is `tools/hive-ops/crossRepoAudit.ts`; it uses `GITHUB_TOKEN` to clone (read-only, public repos only) and is best-effort — clone failures or missing manifests show up as `🚧 ERROR` rows, never crash the sweep.

To register a new external engine:

```jsonc
// tools/hive-ops/external-engines.json
{
  "engines": [
    {
      "slug": "converter",                              // dir name HiveOps uses
      "engine_name": "UDConverter",                     // display label
      "repo": "saggarsonny-boop/universal-document",    // owner/name
      "default_branch": "main",
      "subdir_pattern": "monorepo",                     // "monorepo" if at apps/<slug>; "root" if standalone
      "domain": "converter.hive.baby"
    }
  ]
}
```

The runner's `resolveEngineRoot()` checks three locations in order: `<repoRoot>/apps/<slug>`, `<repoRoot>/<slug>`, `<repoRoot>` itself (when an `ENGINE_GRAMMAR.md` lives at the repo root). External-repo engines work in either monorepo or standalone form without code changes.

### Per-PR audit guardrail — every engine repo, every PR  `[PR_GUARDRAIL]`

In-tree engines (anything under `hivebaby/apps/`) are PR-audited by `.github/workflows/hive-ops.yml`. External-repo engines have a corresponding reusable workflow: `.github/workflows/hive-ops-pr-audit-reusable.yml`. Each engine repo subscribes by committing a short caller workflow:

```yaml
# .github/workflows/hive-ops-pr-audit.yml in the engine repo
name: HiveOps PR audit
on:
  pull_request:
    branches: [main]
jobs:
  audit:
    uses: saggarsonny-boop/hivebaby/.github/workflows/hive-ops-pr-audit-reusable.yml@main
    with:
      slug: <engine-slug>      # "converter" for monorepo apps, repo basename for standalone
    permissions:
      pull-requests: write     # PR comment posting
      contents: read
```

The reusable workflow:

1. Clones the engine repo's PR branch.
2. Clones hivebaby for the hive-ops + hive-finalize tooling.
3. Resolves the **baseline** verdict by running the audit on `main` of the engine repo first.
4. Runs the audit on the PR branch.
5. Posts (or updates in place via marker comment) a PR comment with the verdict, the rule-by-rule detail, and a **VERDICT REGRESSION** banner if main was PASS but this PR isn't.
6. Fails the check if PR-branch verdict is `fail`. Pass/Warn = green check.

This is the canary that prevents UD-Converter-style "regressed PASS → FAIL silently" — every PR sees its own audit and a delta against main before merge.

Engines onboarded as of the inaugural rollout: UD Converter (`saggarsonny-boop/universal-document`), HiveEngineBuilder, HiveAdminSupport, UniversalDocumentInc. Onboard a new engine by committing the caller workflow above to its repo's main branch.

---

## VI. Engine Inventory and Compliance Status

The Hive currently spans 30+ engines across multiple repos. The hivebaby
planet front door is at <https://hive.baby>. Of the engines reachable
from the hivebaby monorepo, this section records the latest HiveOps
audit verdict (last full sweep: **2026-05-06**).

### Hivebaby-resident engines (HiveOps-audited, hivebaby-tracked)

All six were swept in the 2026-05-06 audit run. Audit reproduced via
`tsx tools/hive-ops/cli.ts <slug>` from the hivebaby root.

| Engine | Slug | Domain | Status | Verdict | Tally (pass / warn / fail / skip / override) | Tracking |
|---|---|---|---|---|---|---|
| ParkBack | `parkback` | parkback.hive.baby | live | ✅ **PASS** | 48 / 0 / 0 / 6 / 3 | V01, V18, V19 waived; canonical migration PR #83 |
| HiveActivityPartner | `hive-activity-partner` | activitypartner.hive.baby | building | ✅ **PASS** | 50 / 0 / 0 / 5 / 2 | V18, V19 waived (Phase-1 scaffold); PR #4979dfc |
| HiveAestheticBestie | `hive-aestheticbestie` | hiveaestheticbestie.hive.baby | live | ✅ **PASS** | 52 / 0 / 0 / 5 / 0 | Canonical migration PR #119 (2026-05-08); [hivebaby#93](https://github.com/saggarsonny-boop/hivebaby/issues/93) closed |
| HivePhoto | `hive-hivephoto` | hivephoto.hive.baby | live | ✅ **PASS** | 53 / 0 / 0 / 4 / 0 | Canonical migration PR #125 (2026-05-08); [hivebaby#95](https://github.com/saggarsonny-boop/hivebaby/issues/95) closed |
| HiveIMR | `hive-imr` | hiveimr.hive.baby | live | ✅ **PASS** | 52 / 0 / 0 / 5 / 0 | Canonical migration PR #122 (2026-05-08); [hivebaby#97](https://github.com/saggarsonny-boop/hivebaby/issues/97) closed |
| HivePlainScan | `hive-plainscan` | plainscan.hive.baby | dormant | ⚠️ **WARN** | 6 / 22 / 0 / 0 / 0 | **Dormant (deployed but unreachable).** Vercel project alive but `plainscan.hive.baby` has no DNS record; no users, no demand signal in 11 days. Migration deferred until DNS is wired and there's a reason to ship. WARN overrides expire 2026-06-05 naturally. Tracking: [hivebaby#101](https://github.com/saggarsonny-boop/hivebaby/issues/101), DNS-or-retire decision: [hivebaby#127](https://github.com/saggarsonny-boop/hivebaby/issues/127). |

**Warn-mode rule**: every warn entry expires **2026-06-05** (30 days
from the audit run). Engines that don't ship the canonical migration
PR before that date will revert to FAIL on the next audit run.

### Hivebaby-resident, separate nested git repo (skipped)

| Engine | Slug | Domain | Status | Reason for skip |
|---|---|---|---|---|
| HiveIMGTrainer | `imgtrainer` | imgtrainer.hive.baby | live | `imgtrainer/` is a nested separate git repo (its own `.git/` directory) sitting alongside the hivebaby monorepo, not tracked by hivebaby. Remediation belongs in `saggarsonny-boop/imgtrainer`. Tracked in [hivebaby#99 (closed)](https://github.com/saggarsonny-boop/hivebaby/issues/99) — equivalent issue to be filed in the imgtrainer repo when HiveOps can run cross-repo (v0.3 candidate per [hivebaby#89](https://github.com/saggarsonny-boop/hivebaby/issues/89)). |

### External-repo engines (canonical schema present)

| Engine | Repo | Domain | HiveOps verdict (latest) | Notes |
|---|---|---|---|---|
| UD Converter | `universal-document` | converter.hive.baby | ⚠️ **WARN** — 50 pass / 1 warn (V19→2026-06-07) / 0 fail / 4 skip / 2 override (H21, V18) | V04/V18/V23 fixed in universal-document PR #29 (2026-05-08); V19 retains a 30-day warn for `tooltip_tour=pending`. Now audited daily by the cross-repo sweep + per-PR via `hive-ops-pr-audit-reusable.yml`. |

### External-repo engines (no canonical schema yet)

CLAUDE.md lists the broader inventory of 30+ engines. Most live in
their own repos and have not yet migrated to the canonical
`ENGINE_GRAMMAR.md` schema or been audited by HiveOps. Migration is
the path: each engine adds the frontmatter per `manifest-schema-final.md`,
adopts `@hive/onboarding`, runs `tsx tools/hive-ops/cli.ts <slug>`,
and lands its first audit. See CLAUDE.md "Repos, Domains & Status" for
the full ecosystem table.

### Sweep summary — 2026-05-06

- **5 PASS** (parkback, hive-activity-partner, hive-aestheticbestie, hive-imr, hive-hivephoto ← migrated 2026-05-08 via PR #125)
- **0 WARN** (hive-hivephoto cleared via PR #125)
- **1 DORMANT** (hive-plainscan) — deployed, no DNS, no users, no demand signal; migration deferred. WARN overrides expire 2026-06-05 naturally; either DNS is wired before then or the engine is formally retired (see [hivebaby#127](https://github.com/saggarsonny-boop/hivebaby/issues/127))
- **0 FAIL** (within hivebaby-tracked set)
- **1 skipped** (imgtrainer — separate nested repo)
- **6 PRs** merged: PRs #94, #96, #98, #102 (warn-mode remediation) + PR #103 (this constitution update) + PR #119 (aestheticbestie WARN→PASS)
- **5 tracking issues** filed: #93 (closed via #119), #95, #97, #99 (closed), #101

> **TODO:** generate this section programmatically from
> `engines.json` + `tools/hive-ops/cli.ts <slug> --json` per engine.
> Today it's curated by hand and will drift. v0.3 of HiveOps should
> ship a `--all-engines` mode that emits a constitution-ready
> compliance table.

---

## VII. Queen Bee Architecture  `[QUEEN_BEE_LOCATION]`

Queen Bee is the runtime governance engine of the Hive ecosystem — the Master Grappler in production. This section is the canonical pointer for every CC session: before scaffolding safety, schema validation, language detection, or audit dashboards into a new engine, check what Queen Bee already provides and inherit from it instead of re-implementing.

### Where Queen Bee lives

- **Repo:** `saggarsonny-boop/queen-bee` — `https://github.com/saggarsonny-boop/queen-bee`
- **Vercel deployment:** `queen-bee-v1.vercel.app` (live, HTTP/2 200)
- **Public domain:** `queenbee.hive.baby` (DNS wired; CNAME to Vercel)
- **Stack:** Next.js 16.2.4 + React 19.2.4 + TypeScript + Anthropic SDK
- **Status (per its `ENGINE_GRAMMAR.md`):** Building, governance engine in progress
- **CLAUDE.md in the queen-bee repo:** points to `AGENTS.md` (which contains generic Next.js notes, not QB-specific guidance) — when working in queen-bee, read this Constitution section first.

### What's actually built

Confirmed by reading the queen-bee repo on 2026-05-08:

| Component | File | Status |
|---|---|---|
| Master Grappler | `lib/grappler.ts` | Implemented. Schema field validation, safety check, language detection (zh/ar/ja/ru/en heuristic), QB envelope stamping with version `0.2.0`. |
| Engine registry | `lib/registry.ts` | 14 engines registered with `id, name, domain, status, tone, safety, schema, multilingual, description`. |
| Safety enforcement | `lib/safety.ts` | Tiered rules: universal blocks (suicide/self-harm, weapons synthesis, CSAM); standard blocks; medical-flag patterns; elevated-flag patterns; per-tier disclaimer requirements. |
| Output schemas | `lib/schemas.ts` | Required-field map for 15 schema types (`time-response`, `clarity-response`, `scenario-response`, `coaching-response`, `health-log-response`, `governance-response`, `moon-response`, `lookup-response`, `builder-response`, `conversion-response`, `reader-response`, `creator-response`, `validator-response`, `secret-response`, `generic`). |
| Public API | `app/api/` | `POST /api/govern` (validate + stamp), `GET /api/registry`, `GET /api/audit` (dashboard data), `GET /api/health` (live engine reachability). |
| Audit dashboard | `app/page.tsx` | Live UI at `queen-bee-v1.vercel.app` rendering reachability + governed-flag for every registered engine. |
| Onboarding stack | `components/{AutoDemo,FirstVisitCard,TooltipTour}.tsx` | Implemented. |

### How engines inherit from Queen Bee

An engine inherits by:

1. **Registering in `queen-bee/lib/registry.ts`** with `{id, name, domain, status, tone, safety, schema, multilingual, description}`. The engine's slug becomes the `engineId` it sends to the Grappler.
2. **Importing `@queen-bee/client`** and calling `govern(...)` before returning each output. The package wraps `POST https://queenbee.hive.baby/api/govern`, handles retries / timeouts / error classification, and returns a typed `GovernResponse` (Result-style: `approved: true` with `stampedContent` + `governanceStamp`, or `approved: false` with `failureCode` + `failureReason` + `schemaErrors`). Transport failures throw `QueenBeeUnavailableError` so engines pick fail-open vs fail-closed policy explicitly.
3. **Returning the stamp** to the client surface so users see the QB verdict (`safe`, `governed`, `language`, `flags`, `version`, `timestamp`).

The canonical client package lives at [`saggarsonny-boop/queen-bee/packages/queen-bee-client/`](https://github.com/saggarsonny-boop/queen-bee/tree/main/packages/queen-bee-client) (shipped 2026-05-09 in queen-bee PR #3). Engines should never write a fresh `fetch` wrapper for `/api/govern` — the package handles retries, timeouts, error classification, and the Result-shape mapping. First-time wiring is documented step-by-step in [`packages/queen-bee-client/WIRING.md`](https://github.com/saggarsonny-boop/queen-bee/blob/main/packages/queen-bee-client/WIRING.md).

```ts
import { govern, QueenBeeUnavailableError } from "@queen-bee/client";

const verdict = await govern({
  engineId: "your-engine-slug",
  input: userInput,
  content: structuredOutput,
  context: { tier, locale, sessionId },
});

if (verdict.approved) {
  return { ok: true, content: verdict.stampedContent, stamp: verdict.governanceStamp };
}
return { ok: false, code: verdict.failureCode, reason: verdict.failureReason };
```

External-repo engines install via the git tarball pattern (see WIRING.md) until a registry publish path is decided.

### Adoption status — honest gap report

As of 2026-05-09, **no Hive engine in this monorepo or in any standalone engine repo yet imports `@queen-bee/client` in production**. Re-verified by `grep -r "@queen-bee/client\|queenbee\.|/api/govern" --include="*.ts" --include="*.tsx"` across `hivebaby/apps/`, `hivebaby/packages/`, `universal-document/apps/`, and the standalone engine repos. The client package itself shipped in queen-bee PR #3 on 2026-05-09 (the previous "no shared library" line of this section is therefore now stale; the gap is purely adoption, not infrastructure).

The 14 engines listed in `queen-bee/lib/registry.ts` are *registered* (so QB knows about them and can audit their reachability), not *governed* (they don't route their outputs through QB). This is visible in the live audit feed at `queen-bee-v1.vercel.app/api/health`: `governed: true` is the dashboard's reachability check, not proof that the engine called QB.

The first engine to consume `@queen-bee/client` will close the adoption gap and become the reference engine for `WIRING.md`. The package crosses the 2-engine threshold for `@hive/*` extraction as soon as the second engine wires it, at which point it becomes a Substrate Registry entry per §V `[QUEEN_BEE_SUBSTRATES]`.

### Things described elsewhere that don't exist yet

When earlier conversations or notes reference these, treat them as aspirational pending evidence to the contrary:

- **"27 adoption amplifiers"** — no canonical list of 27 amplifiers exists in any repo. The closest match is HiveOps' `ADOPTION_AMPLIFIERS` H-rule category, which currently has two rules (H24, H25 — manifest registration in layout + viewport meta). When a future PR introduces a true list of amplifiers, link it from this section.
- **"Hive Core" / "Foundry" / "Factory"** — no code, no docs, no anchors anywhere in `hivebaby`, `queen-bee`, `universal-document`, or any engine repo on 2026-05-08. If these were ever shipped, they've since been deleted or renamed; the runtime governance work that those names were probably reaching for is the Master Grappler in the queen-bee repo.

### Relationship to §V "Queen Bee Substrate Registry" `[QUEEN_BEE_SUBSTRATES]`

The Substrate Registry (§V) and the Queen Bee Engine (this section) are **distinct artefacts that share a name**.

- The Substrate Registry is a markdown ledger at `docs/QUEEN_BEE_SUBSTRATES.md` listing 13 reusable code patterns (operator auth, audit dashboard, strings/useStrings split, …) with extraction thresholds. Engines copy patterns *out* of the registry into their own codebases.
- The Queen Bee Engine is a deployed runtime service at `queenbee.hive.baby` that engines *call into* via `/api/govern`. Engines do not copy QB into themselves.

A pattern in the Substrate Registry can move toward "consumed via QB" rather than "extracted to a package" — for example, the safety-disclaimer pattern is already enforced inside QB's `lib/safety.ts`. Patterns that are ergonomically embedded (strings/useStrings split, operator cookie) will probably stay package-bound; patterns that are ergonomically remote (safety classification, schema validation, language detection) belong in QB.

### When CC works on a Hive engine, the inheritance check

Before scaffolding any of the following into a new engine, check whether QB already provides it:

- Output schema validation (QB has 15 schema types in `lib/schemas.ts`)
- Safety enforcement (QB has tiered rules in `lib/safety.ts`)
- Language detection (QB has a Unicode-range heuristic in `lib/grappler.ts`)
- Compliance audit dashboard for the engine fleet (QB has `/api/audit` and the live page at `queen-bee-v1.vercel.app`)
- Cross-engine reachability monitoring (QB has `/api/health`)

If QB already has it, add the engine to `queen-bee/lib/registry.ts` and call `/api/govern` instead of re-implementing. If QB doesn't have it, document the gap in this section before building locally — the next engine will face the same question.

---

## VIII. Architecture Decisions and Lessons Learned

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

### `@hive/onboarding` inlined in universal-document → cross-tree React deduplication  `[INLINE_PACKAGE]`

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

## IX. Update Mechanism  `[GOVERNANCE_LOCATION]`

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
- **Lessons Learned (§VIII) grows over time; never prune.** A lesson
  may be marked superseded with a one-line note explaining what
  replaced it, but the historical incident stays. The point is to
  preserve institutional memory of the *why*, not to keep the
  document tidy.

> **TODO (governance loop):** Today the constitution is updated by
> hand. Once HiveOps v0.3 lands cross-engine consistency rules
> (X01–X03 in [hivebaby#89](https://github.com/saggarsonny-boop/hivebaby/issues/89)),
> a CI check should fail if a HiveOps rule exists in `rules.ts` /
> `validate.ts` but isn't documented in §V here, and vice versa.
