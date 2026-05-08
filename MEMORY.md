# HIVE MEMORY — Canonical rule set

> **This file is the canonical, repo-resident transcription of every Hive
> governance rule that has been locked across CC sessions.** It exists so
> rules don't live exclusively in claude.ai user memory (which isn't
> portable across CC environments).
>
> Each rule has a stable `<TAG_NAME>` identifier. Every tag here MUST also
> appear somewhere in `docs/HIVE_CONSTITUTION.md` — the CI workflow
> `.github/workflows/memory-constitution-sync.yml` enforces this on every
> PR.
>
> **Append-only.** Rules are never removed; superseded rules get a
> "Superseded by …" note but stay in the file (the historical why
> outlives the rule itself).
>
> **CLAUDE.md is the runtime-actionable subset.** This file is the full
> rule set with sources and constitution cross-references. Read both at
> the start of every session.

---

## Today's session — locked 2026-05-06

### Rule #22 — `[DEVICE_VERIFY]`

**Title:** Device verification mandatory on every UI PR.

**Body:** Every PR with UI changes must verify on real iOS Safari and Android
Chrome, or accurate device-profile simulators (WebKit + iPhone profile,
Chromium + Pixel profile). Vercel CI green is necessary but not sufficient.
The verification proof points are `DEVICE_VERIFIED_IOS` and
`DEVICE_VERIFIED_ANDROID`. HiveOps v0.3 will automate this via headless
WebKit; until then, the rule is enforced by review + the engine's own
`launch_checklist_state.test_slot` boolean.

**Source:** Locked 2026-05-06. Originated from ParkBack PR #70 iOS Safari
render-only-the-compass bug (see Constitution §VII).

**Constitution reference:** [§IV "Device verification mandatory"](docs/HIVE_CONSTITUTION.md#device-verification-mandatory).

---

### Rule #23 — `[LOCALE_SET]`

**Title:** Canonical Hive free-tier locale set.

**Body:** The canonical Hive free-tier locale set is `en, es, fr, ar, hi,
zh, pt` (English, Spanish, French, Arabic, Hindi, Simplified Chinese,
Portuguese). Anchored in HiveBodyLog's shipped i18n; UD Converter must
seed; every engine must match. Paid tier may extend to ≤200 languages via
`@hive/onboarding`'s `setLocaleOverrides()` hook. **UI localization in the
canonical 7 is free for all tiers regardless of cost profile** —
translation is not a paywall feature. An earlier guess of
`en/es/fr/de/pt/zh/ar` (with German) was wrong; the true set has Hindi,
no German.

**Source:** Locked 2026-05-06. Originated from session 2edabddc-b293-491c-b5c7-9b20cd4160c9.

**Constitution reference:** [§II "Canonical 7-language locale set"](docs/HIVE_CONSTITUTION.md#canonical-7-language-locale-set-free-tier-floor)
+ [§III "Internationalization is free"](docs/HIVE_CONSTITUTION.md#internationalization-is-free).

---

### Rule #24 — `[PRICING_MODEL]`

**Title:** Pricing scales with marginal cost per use.

**Body:** Engines declare `cost_profile` in `ENGINE_GRAMMAR.md`. Free-tier
rules per profile:

| Profile | Per-use marginal cost | Free-tier rule |
|---|---|---|
| `zero_marginal` | $0 (localStorage / no API) | unlimited free |
| `low_marginal` | < $0.001 (e.g. Groq-routed) | 10 / day free |
| `medium_marginal` | $0.001–$0.01 | 3 lifetime, max 1 / 24h |
| `high_marginal` | > $0.01 | none, or 1 lifetime demo |

Plus tier `$0.97/month` unlimited; Pro tier `$29/month` with power
features. UI localization 7-lang free for all. Safety-critical info
(drug recalls, food hygiene, vehicle recalls) is never Pro-gated.
HiveOps enforces.

**Source:** Locked 2026-05-06.

**Constitution reference:** [§III "Pricing and Cost Profiles"](docs/HIVE_CONSTITUTION.md#iii-pricing-and-cost-profiles).

---

### Rule #25 — `[SCOPE_DISCIPLINE]`

**Title:** Ask before expanding scope.

**Body:** If a prompt asks for X, CC ships X. If CC believes a different /
larger approach is better (workflow vs files, refactor vs patch, generic
system vs specific fix), CC asks first with rationale. Direct-to-main
commits bypassing PR/CI are not acceptable except when explicitly
authorized for that specific change. Standing merge rule is open PR +
autonomous merge on green CI, never direct push.

**Source:** Locked 2026-05-06. Originated from a prior session that
direct-pushed three ops workflows + added `parkback-i18n-generate.yml` as
unsolicited scope expansion when the original ask was narrower; the right
move was to surface the blocker, not invent infrastructure.

**Constitution reference:** [§IV "Standing merge rule"](docs/HIVE_CONSTITUTION.md#standing-merge-rule)
+ [§IV "Ask before scope expansion"](docs/HIVE_CONSTITUTION.md#ask-before-scope-expansion).

---

### Rule #26 — `[INFRA_AUTONOMOUS]`

**Title:** CC handles all infrastructure setup autonomously.

**Body:** CC handles Stripe products + prices via Stripe API, Cloudflare
Turnstile + DNS via CF API, Vercel env vars + redeploys via Vercel
CLI/API, secrets via `openssl rand`, GitHub Actions secrets via `gh secret
set`, PR creation/merge via `gh` CLI. **Never** instruct the user to "go
to dashboard X and click Y" or "run command Z" except where the API
genuinely lacks the operation (rare). When that happens, CC names the
exact dashboard URL + the exact field + what value to enter. CC has
tokens from prior work; if a token is missing, CC retrieves it from
GitHub Actions secrets or names one specific blocker — never multi-step
manual instructions.

**Source:** Locked 2026-05-06. Originated from a prior session that
asked the user to add `STRIPE_SECRET_KEY` via the Vercel dashboard UI
when the Vercel CLI could do it directly.

**Constitution reference:** [§IV "CC handles infrastructure setup autonomously"](docs/HIVE_CONSTITUTION.md#cc-handles-infrastructure-setup-autonomously).

---

### Rule #27 — `[HONEST_UX]`

**Title:** Never advertise features in UI that don't work.

**Body:** If a dropdown shows options, every option must function. If a
button is shown, it must do something. "Coming soon" placeholders are
bait-and-switch and damage trust. Either implement the feature or hide
it. HiveOps grep-checks for `coming soon` / `not yet` / `TODO` strings
in user-facing copy and fails engines that have them in production.

**Source:** Locked 2026-05-06. Originated from UD Converter PR #11 where
the From-format dropdown showed 234 potential output formats but only
~30 were actually implemented.

**Constitution reference:** [§II "Production copy hygiene"](docs/HIVE_CONSTITUTION.md#production-copy-hygiene)
+ [§VII "Coming soon labels in production"](docs/HIVE_CONSTITUTION.md#coming-soon-labels-in-production--bait-and-switch-ux).

---

### Rule #28 — `[HIVEOPS_v01]`

**Title:** HiveOps v0.1 shipped 2026-05-06.

**Body:** HiveOps v0.1 shipped 2026-05-06: `packages/hive-onboarding`
(PR #80), `tools/hive-ops` with 28 MANDATORY rules (PR #81), ParkBack
imports shared package (PR #82). Initial audits: ParkBack 26/28 pass,
UD Converter 11/28 pass; UD Converter HiveOps gaps tracked for follow-up.
Three deploy-blockers (Stripe Plus product, Turnstile, `PLUS_AUTH_SECRET`)
tracked in universal-document issue #13. Free-tier UD Converter capped at
4 MB to honor Vercel Hobby plan free constraint.

**Source:** Locked 2026-05-06. Records the v0.1 milestone for institutional
memory.

**Constitution reference:** [§V "HiveOps Governance"](docs/HIVE_CONSTITUTION.md#v-hiveops-governance)
+ [§VII "CI workflow only installed hive-ops deps"](docs/HIVE_CONSTITUTION.md#ci-workflow-only-installed-hive-ops-deps--install-all-consumed-packages).

---

### Rule #29 — `[BLOB_ARCHITECTURE]`

**Title:** UD Converter direct-to-blob upload over Vercel Pro upgrade.

**Body:** UD Converter architecture decision 2026-05-06: direct-to-blob
upload via Vercel Blob (free tier 1 GB) chosen over Vercel Pro upgrade
($20/month). Bypasses 4.5 MB edge body limit. Free tier stays at 4 MB by
application cap. Plus tier ($0.97/mo) gets 25 MB and Pro tier ($29/mo)
gets 50 MB via blob upload. **Sonny preference: $0/month operating cost
over $20/month operating cost.** Founding constraint, not a temporary
budget choice.

**Source:** Locked 2026-05-06. Architectural decision recorded so future
sessions don't propose Vercel Pro upgrade as a path.

**Constitution reference:** [§VII "UD Converter Vercel edge body limit"](docs/HIVE_CONSTITUTION.md#ud-converter-vercel-edge-body-limit--free-tier-4-mb-cap).

---

### Rule #30 — `[INLINE_PACKAGE]`

**Title:** UD Converter inlines `@hive/onboarding`.

**Body:** UD Converter inlines `@hive/onboarding` at
`apps/converter/src/lib/hive-onboarding/` rather than consuming the
workspace package. Reason: the universal-document repo has no root
`node_modules`, and cross-tree React deduplication caused two React
instances and SSR null context. Inline keeps the import statement
identical via tsconfig + webpack alias. A sync-pointer README in that
directory notes hivebaby is the canonical source. Future package
updates require manual sync until a different cross-repo strategy
lands.

**Source:** Locked 2026-05-06. Originated from PR #17 (universal-document).

**Constitution reference:** [§VII "@hive/onboarding inlined in universal-document"](docs/HIVE_CONSTITUTION.md#hiveonboarding-inlined-in-universal-document--cross-tree-react-deduplication).

---

### Rule #31 — `[OPERATOR_ROLE]`

**Title:** Operator role bypass via shared `@hive/auth` pattern.

**Body:** Every Hive engine with tier gates implements an operator role
bypass via the shared `@hive/auth` pattern. Priority order:

1. Clerk `publicMetadata.role === 'operator'`
2. Signed `ud_operator` cookie
3. `x-ud-operator-key` header

Operators bypass tier gates, captcha, and rate limits. Operator actions
log to the engine's `engine_operator_audit` Neon table. The role exists
for testing, debugging, and emergency access. HiveOps v0.3 will add a
rule verifying any tier-gated engine imports the operator auth pattern.

**Source:** Locked 2026-05-06. Brand-new rule; T1 is implementing it
tonight in the deploy-blockers PR (universal-document).

**Constitution reference:** [§V "Operator role convention"](docs/HIVE_CONSTITUTION.md#operator-role-convention).

---

## Today's session — locked 2026-05-08

### Rule #32 — `[NEVER_PROCRASTINATE]`

**Title:** Never delay action when work can be done now.

**Body:** Default behavior is forward motion. Don't propose "we could
do this later" when it can be done now. Don't suggest stopping when
work remains — only Sonny decides when to stop. When CC notices
follow-up work unblocked by what was just shipped (missing doc, stale
config, obvious refactor), the right move is usually to do it in the
same flow, subject to `[SCOPE_DISCIPLINE]` (ask if it materially
expands the requested work). Phrases to avoid: "we could revisit this
later," "left as a follow-up," "this can wait." Small + unlocked →
ship it; large + out of scope → file an issue with the actual blocker
named, don't leave a vague intention.

**Source:** Locked 2026-05-08 in the operating-principles session.
Brand-new rule; complements `[SCOPE_DISCIPLINE]` (which says don't
silently expand) by saying don't silently defer either.

**Constitution reference:** [§IV "Never procrastinate"](docs/HIVE_CONSTITUTION.md#never-procrastinate).

---

### Rule #33 — `[FREE_OVER_PAID]`

**Title:** Choose the free path when outcomes are similar.

**Body:** Sonny's standing preference is **$0/month operating cost.**
When a choice exists between a free and a paid path that achieve
similar outcomes, choose free. Examples: Vercel Blob free tier over
Vercel Pro upgrade; direct Anthropic API key over additional service
subscriptions; native CLI / API over paid SaaS for the same
capability; free-tier Cloudflare / Neon / Resend until usage genuinely
exceeds the limit. Honest tradeoffs are acceptable; defaulting to paid
for convenience is not. If a paid path is materially better, CC names
the tradeoff and asks. Founding constraint, not a temporary budget
choice — it expresses the "no investors, no agenda" posture in §I.
Strengthens the existing `[BLOB_ARCHITECTURE]` precedent (Sonny chose
direct-to-blob over $20/month Vercel Pro) into a general principle.

**Source:** Locked 2026-05-08 in the operating-principles session.
Generalizes the per-engine cost decisions visible across UD Converter
(`[BLOB_ARCHITECTURE]`) and the planet's free-tier rules in §III.

**Constitution reference:** [§IV "Free over paid"](docs/HIVE_CONSTITUTION.md#free-over-paid).

---

### Rule #34 — `[MACHINE_OVER_HUMAN]`

**Title:** When a task can be done by machine or by Sonny, the machine does it.

**Body:** CC handles all infra setup, secret management, deploy
operations, dashboard interactions, file edits, env var provisioning,
and any operation where the API or CLI permits it. Strengthens
`[INFRA_AUTONOMOUS]` with an explicit ordering rule:

1. **Default:** CC executes via API / CLI / scripted dashboard call.
2. **Fallback:** CC retrieves a missing token from GitHub Actions
   secrets, generates one with `openssl rand`, or scripts the missing
   capability.
3. **Last resort:** CC asks Sonny to perform a UI action — and only
   when CC has explicit evidence the API doesn't support the
   operation (linked docs, attempted call with the actual error, or
   a known vendor limitation). "I think the API doesn't have this"
   is not evidence; "the docs say this is a UI-only step" is.

Creatively work around tooling limitations rather than offloading to
human hands. When the last resort is genuinely required, CC names
the exact URL + exact field + exact value, never a multi-step manual
recipe.

**Source:** Locked 2026-05-08 in the operating-principles session.
Brand-new rule; tightens `[INFRA_AUTONOMOUS]` by establishing the
explicit machine-first ordering and the evidence bar required to
escalate to a human.

**Constitution reference:** [§IV "Machine over human"](docs/HIVE_CONSTITUTION.md#machine-over-human).

---

## Earlier-session rules — pre-2026-05-06

### `[ID_PROTECTION]`

**Title:** Sonny is never founder / creator / owner in public content.

**Body:** Sonny Saggar is never to be presented as founder, creator, or
owner of the Hive, Universal Document, or any engine in any code, copy,
or public-facing content. The acceptable framings are *consultant on
document infrastructure strategy*, *advisor on AI readiness and
governance*, *clinical AI evaluation consultant*, *contributor to the
Hive ecosystem*. The Hive ecosystem is independent. This rule applies
to scaffolded copy CC writes (About pages, signup confirmations, error
pages, marketing emails), not just hand-edited content.

**Source:** Standing rule from prior sessions; consolidated 2026-05-06
into Constitution §I.

**Constitution reference:** [§I "Sonny's role"](docs/HIVE_CONSTITUTION.md#sonnys-role).

---

### `[INFRA_PERMANENCE]`

**Title:** Never assume Hive infrastructure doesn't exist.

**Body:** The system spans multiple sessions, repos, and chats. Always
grep deeply for any name pattern (not just the canonical name); check
env vars with multiple variants (e.g. `STRIPE_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_API_KEY`); check both `~/.zshenv` and GitHub Actions secrets and
Vercel env vars; check both the engine's own repo and the hivebaby
monorepo; check whether a referenced file exists at multiple plausible
paths. When something genuinely doesn't exist, CC reports the exact
search performed (which paths, which name variants) so the human can
verify or correct.

**Source:** Standing rule from prior sessions.

**Constitution reference:** [§IV "Infrastructure assumption"](docs/HIVE_CONSTITUTION.md#infrastructure-assumption).

---

### `[BUILD_DIAGNOSTICS]`

**Title:** Pull Vercel build logs first on any deployment error.

**Body:** When any deployment or app returns an error, always pull the
Vercel build logs first before attempting any fix. Build logs reveal
the actual error in two-thirds of cases; speculation from the symptom
wastes a cycle and usually produces the wrong fix. CC checks build
logs automatically on any 500 or deployment failure.

**Source:** Standing rule from prior sessions; reinforced by UD Converter
PR #2 Anthropic whole-PDF fallback timeout.

**Constitution reference:** [§IV "Diagnostic rule"](docs/HIVE_CONSTITUTION.md#diagnostic-rule)
+ [§VII "Anthropic whole-PDF fallback timeout"](docs/HIVE_CONSTITUTION.md#anthropic-whole-pdf-fallback-timeout--diagnose-first-rule).

---

### `[CANONICAL_SECRETS]`

**Title:** Use canonical secret names, never variants.

**Body:** Active GitHub / Vercel secrets use specific canonical names:
`ANTHROPIC_API_KEY`, `CF_TOKEN`, `CF_API_TOKEN`, `CF_ZONE`, `CF_ACCOUNT`,
`DATABASE_URL`, `RESEND_API_KEY`, `VERCEL_TOKEN`, `CLERK_SK`, `CLERK_PK`,
`STRIPE_KEY`, `STRIPE_PK`, `STRIPE_WEBHOOK_SECRET`, `CRON_SECRET`,
`PLUS_AUTH_SECRET`, `HEB_CREATOR_SECRET`. Never variant names. If an
existing engine uses a variant, migrate it; don't propagate. Engine-
specific Stripe price IDs follow `STRIPE_PRICE_<TIER>_<INTERVAL>`.
Secrets live in `~/.zshenv` (local), GitHub Actions Secrets (CI), Vercel
project env vars (production); CC reads via `process.env.<NAME>` or
`gh secret list` and never asks the user to paste a secret value into
the prompt.

**Source:** Standing rule from prior sessions; reinforced by an Anthropic
key paste leak incident.

**Constitution reference:** [§II "Canonical secret names"](docs/HIVE_CONSTITUTION.md#canonical-secret-names)
+ [§VII "Anthropic API key paste leak"](docs/HIVE_CONSTITUTION.md#anthropic-api-key-paste-leak--never-paste-secrets-in-cc-chat).

---

### `[ENGINE_FINALIZATION]`

**Title:** Engine finalization checklist is the source of truth.

**Body:** The canonical engine finalization checklist lives at
`docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md` in hivebaby and is the
source of truth — never reconstructed from memory. Before declaring an
engine launch-ready, walk the checklist; do not approximate it. HiveOps
encodes the MANDATORY items as H-rules H01..H28; HiveFinalize encodes
the manifest schema items as V-rules V01..V29. Engines declare waivers
via the override schema; silent divergence is not acceptable.

**Source:** Standing rule from prior sessions; load-bearing for HiveOps.

**Constitution reference:** [§V "HiveOps Governance"](docs/HIVE_CONSTITUTION.md#v-hiveops-governance).

---

### `[PWA_STANDARDS]`

**Title:** Full PWA + favicon set + iOS appleWebApp meta on every engine.

**Body:** Every engine ships with a full favicon set (`favicon.ico`
multi-res, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
180×180, `maskable-icon.png` 512×512 with safe zone), descriptive tab
title (`<Engine name> — <tagline>` exactly), `public/manifest.json` with
all canonical PWA fields, themed Android Chrome bar at `#D4AF37`
(`metadata.themeColor` AND `manifest.theme_color`), iOS appleWebApp
meta (`metadata.appleWebApp = { capable: true, title, statusBarStyle:
"black-translucent" }`). Copy uses **"Add to home screen"** never
**"Install"** — that framing reads as Play Store / App Store, which the
Hive deliberately bypasses.

**Source:** Standing rule from prior sessions; canonical brand
integration.

**Constitution reference:** [§II "Canonical brand integration"](docs/HIVE_CONSTITUTION.md#canonical-brand-integration-every-engine)
+ [§II "Canonical onboarding"](docs/HIVE_CONSTITUTION.md#canonical-onboarding-hiveonboarding).

---

### `[OFFLINE_COPY]`

**Title:** Offline copy says "no cell or wifi signal" not "offline mode".

**Body:** When an engine works in dead zones (e.g. ParkBack in
underground garages), the user-facing copy must say "no cell or wifi
signal" — concrete language users recognize from real life. Generic
"offline mode" / "no internet connection" framings are vaguer and read
as bug states rather than designed-for capability.

**Source:** Standing rule from prior sessions; codified in ParkBack
copy.

**Constitution reference:** [§II "Canonical brand integration"](docs/HIVE_CONSTITUTION.md#canonical-brand-integration-every-engine)
(under the offline-shell standard for service workers).

---

### `[FOOTER_SIGNATURE]`

**Title:** Hive logo header + "Made with ♥ in the Hive" footer on every engine.

**Body:** Every Hive engine includes the canonical Hive logo
(`public/hive-logo-full.png`) in the header linking to
`https://hive.baby`, and the canonical footer signature row "Made with
♥ in the Hive" in canonical Hive gold (`#D4AF37`) where the word "Hive"
links to `https://hive.baby` in a new tab. The footer also surfaces the
canonical link set: `hive.baby · social experiment · contribute ·
patronage · privacy`.

**Source:** Standing rule from prior sessions; HIVE_HEADER_LOGO and
HIVE_FOOTER_SIGNATURE in HiveOps.

**Constitution reference:** [§II "Canonical brand integration"](docs/HIVE_CONSTITUTION.md#canonical-brand-integration-every-engine).

---

### `[GOVERNANCE_LOCATION]`

**Title:** Hive governance lives at `docs/HIVE_CONSTITUTION.md`.

**Body:** Hive governance lives in
`/Users/sonnyneo/hivebaby/docs/HIVE_CONSTITUTION.md` as the canonical
source of truth. `CLAUDE.md` mirrors the operational subset for CC
sessions. Per-engine `ENGINE_GRAMMAR.md` declares per-engine compliance.
HiveOps enforces automatically. Memory rules and userMemories should be
reflected in the constitution + this MEMORY.md file so every CC session
inherits the rule set without re-stating it in prompts. Constitution
updates require a PR; no direct-to-main, no exceptions.

**Source:** Standing rule from prior sessions; locked when Constitution
shipped 2026-05-06 (PR #91).

**Constitution reference:** [§VIII "Update Mechanism"](docs/HIVE_CONSTITUTION.md#viii-update-mechanism).

---

## How to add a new rule

1. Append a new section to this file with a unique `<TAG_NAME>`, title,
   body, source line, and constitution reference.
2. Update `docs/HIVE_CONSTITUTION.md` so the tag literal `<TAG_NAME>`
   appears in the relevant section.
3. Open a PR with both edits.
4. The CI workflow `memory-constitution-sync` will fail if a tag exists
   here but isn't found in the constitution. Fix the constitution before
   merging.
5. Update `CLAUDE.md` if (and only if) the rule is runtime-actionable
   for CC sessions — CLAUDE.md is the operational subset, not a mirror.
