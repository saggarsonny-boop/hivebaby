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
render-only-the-compass bug (see Constitution §VIII).

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
+ [§VIII "Coming soon labels in production"](docs/HIVE_CONSTITUTION.md#coming-soon-labels-in-production--bait-and-switch-ux).

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
+ [§VIII "CI workflow only installed hive-ops deps"](docs/HIVE_CONSTITUTION.md#ci-workflow-only-installed-hive-ops-deps--install-all-consumed-packages).

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

**Constitution reference:** [§VIII "UD Converter Vercel edge body limit"](docs/HIVE_CONSTITUTION.md#ud-converter-vercel-edge-body-limit--free-tier-4-mb-cap).

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

**Constitution reference:** [§VIII "@hive/onboarding inlined in universal-document"](docs/HIVE_CONSTITUTION.md#hiveonboarding-inlined-in-universal-document--cross-tree-react-deduplication).

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

## Today's session — locked 2026-05-08 (HiveOps GOVERNANCE)

### Rule #37 — `[HIVEOPS_GOVERNANCE]`

**Title:** HiveOps gains a GOVERNANCE rule category (G01..G05) that enforces Queen Bee consumption. Currently WARN-only; lifts to FAIL-blocking at ≥80% engine adoption.

**Body:** HiveOps now runs three rule families: H (filesystem, H01..H28), V (manifest schema, V01..V29), and **G (GOVERNANCE, G01..G05)**. G-rules detect whether engines actually inherit from Queen Bee:

- **G01** — engine `package.json` declares `@queen-bee/client` (in `dependencies`/`peerDependencies`; devDependencies-only fails).
- **G02** — engine code imports `govern` from `@queen-bee/client` and calls it from at least one `app/api/**/route.ts(x)` handler.
- **G03** — engine slug present in `queen-bee/lib/registry.ts` (verified via HTTP `GET /api/registry`; network failure reports `skip`, never `fail`).
- **G04** — `ENGINE_GRAMMAR.md` declares `queen_bee_schemas` in frontmatter, with names from the canonical 15 in `queen-bee/lib/schemas.ts`.
- **G05** — engine DB schema persists the governance stamp (column `governance_stamp`/`governanceStamp` or FK `stamp_id`/`stampId`); static-html engines exempted by applicability.

Implementation: `tools/hive-ops/checks/governance/{index.ts,g01..g05}.ts`. Tests + 3 fixture engines (PASS / FAIL / mixed-3-of-5) at `tools/hive-ops/tests/governance.test.ts`.

WARN-only mode: `GOVERNANCE_FAIL_BLOCKING = false` in `checks/governance/index.ts`. The runner softens any G-rule's `fail` into `warn` until the constant flips. Lift criterion: ≥80% of audited engines pass ≥4 of 5 G-rules. The 4-of-5 threshold lets engines migrate G02 + G05 in a separate PR from G01 + G03 + G04 without going red between PRs.

**Source:** Locked 2026-05-08. Originated from making QB consumption auditable across the fleet — without G-rules, engines could declare governance compliance in their grammar without any code path actually calling `govern()`.

**Constitution reference:** [§V "GOVERNANCE rule category"](docs/HIVE_CONSTITUTION.md#governance-rule-category--queen-bee-consumption-enforcement--hiveops_governance).

---

## Today's session — locked 2026-05-08 (architecture map)

### Rule #36 — `[HIVE_ARCHITECTURE]`

**Title:** The pan-Hive architecture map at `docs/HIVE_ARCHITECTURE.md` is the canonical layer-by-layer view of how the Hive fits together.

**Body:** The architecture doc maps the five-layer stack with Mermaid diagrams of inheritance, data flow, module reuse, and per-engine substrate adoption. CC reads it at the start of any session that touches more than one engine, and amends it whenever a new engine is scaffolded, a substrate is extracted to a `@hive/*` package, or an adoption amplifier is added.

The map distinguishes four kinds of thing — **engines** (own purpose, workflows, public domain, DB, ENGINE_GRAMMAR.md), **modules** (attach via import, no own product surface), **substrates** (registry-tracked patterns, extracted at the 3-engine threshold), and **adoption amplifiers** (HiveOps-enforced cross-cutting features). Conflating these is the most common confusion the doc exists to prevent.

v0.2 (2026-05-08) folds in T1's Queen Bee discovery PR (`[QUEEN_BEE_LOCATION]`): Layer 1 is the runtime governance engine at `queenbee.hive.baby`, inherited via `POST /api/govern` (no engine consumes yet — honest gap). Layer 2 is intentionally empty — the historical Foundry / Factory / Tarka / Broomstick / Oompa Loompas framing is retired as legacy talk (no code anywhere as of 2026-05-08). Layer 3 marks Tone Engine / AI Activity Partner / Hive Core as planned-not-built; the formal `ADOPTION_AMPLIFIERS` H-rule category contains just **2 rules** (H24, H25), not 27. HiveVitality: scope defined, build pending Queen Bee consumption pattern from first engine.

**Source:** Locked 2026-05-08. Originated from a request to make the pan-Hive architecture visible from every chat and CC session. v0.1 shipped 2026-05-08; v0.2 amendment landed same day after T1's Queen Bee discovery PR (#143).

**Constitution reference:** [§V "Pan-Hive architecture map"](docs/HIVE_CONSTITUTION.md#pan-hive-architecture-map--hive_architecture).

---

## Today's session — locked 2026-05-08 (substrate registry)

### Rule #35 — `[QUEEN_BEE_SUBSTRATES]`

**Title:** Reusable substrate patterns live in `docs/QUEEN_BEE_SUBSTRATES.md` until they cross the 3-engine threshold for `@hive/*` extraction.

**Body:** When CC builds a pattern in one engine that's a plausible candidate for reuse — operator auth, audit dashboards, the inline `@hive/onboarding` workaround, the strings/useStrings split, direct-to-blob upload, the cost-cap circuit breaker, the 7-language locale generator, the validation utility shape, defense-in-depth response stripping, the atomic bounded counter, `hive_alerts` telemetry, tier-based rate limiting, the Stripe tier subscription pattern, etc. — the pattern goes into the substrate registry at `docs/QUEEN_BEE_SUBSTRATES.md` *before* a second engine adopts it, so the second engine doesn't re-design it. Each entry documents Name, Purpose, Current implementations, Canonical shape, When to use, and When to extract.

The registry is the staging area, not a permanent home. When a pattern crosses 3 production engines, the next PR extracts it to `@hive/<package-name>` and the registry entry becomes a historical pointer. The 3-engine threshold guarantees the registry never becomes a dumping ground of single-engine "patterns" that never actually got reused.

CC adopts existing patterns from the registry when applicable, rather than re-implementing. CC adds new patterns to the registry when shipping reusable shape. CC never silently re-implements an existing substrate.

**Source:** Locked 2026-05-08. Originated from extracting 13 patterns out of the HAP scaffolding work after HAP itself was retracted (wrong product premise — companion module, not matching system); the substrate patterns survived the retraction and were captured before they were lost.

**Constitution reference:** [§V "Queen Bee Substrate Registry"](docs/HIVE_CONSTITUTION.md#queen-bee-substrate-registry--queen_bee_substrates).

---

### Rule #36 — `[QUEEN_BEE_LOCATION]`

**Title:** Queen Bee runtime governance engine lives at `saggarsonny-boop/queen-bee` → `queenbee.hive.baby`. Inherit from it before re-implementing safety/schema/language/audit.

**Body:** The runtime governance engine is at `https://github.com/saggarsonny-boop/queen-bee`, deployed at `queen-bee-v1.vercel.app` with public DNS at `queenbee.hive.baby`. It exposes `POST /api/govern` for engine output validation + envelope stamping, plus `GET /api/registry`, `GET /api/audit`, `GET /api/health`. The Master Grappler (`lib/grappler.ts`) handles schema validation, safety enforcement (`lib/safety.ts`), language detection, and envelope stamping in one pass. Schema types and required fields are in `lib/schemas.ts`.

Engines consume QB via the canonical client package [`@queen-bee/client`](https://github.com/saggarsonny-boop/queen-bee/tree/main/packages/queen-bee-client) — `import { govern } from "@queen-bee/client"` then `govern({engineId, input, content, context?})` once per response. The package handles retries, timeouts, AbortController, error classification (transport vs business), stamp extraction, and the typed Result shape (`{approved, stampedContent?, governanceStamp?, failureReason?, failureCode?, schemaErrors?}`). Engines never write a fresh fetch wrapper for `/api/govern`. The first-time wiring guide is [`packages/queen-bee-client/WIRING.md`](https://github.com/saggarsonny-boop/queen-bee/blob/main/packages/queen-bee-client/WIRING.md), which walks 10 steps from registry entry to PR merge.

Before scaffolding output schema validation, safety enforcement, language detection, compliance audits, or cross-engine reachability monitoring into a new engine, check what QB already provides — if the capability is in QB, register the engine and call `govern()` instead of re-implementing.

Honest gap as of 2026-05-08: no engine actually calls `/api/govern` in production yet. The 14 engines in `queen-bee/lib/registry.ts` are *registered* (so QB knows about them and audits their reachability), not *governed* (they don't route outputs through QB). The client package + wiring guide land first; the first engine to adopt is also the template for the next. Aspirational references to "Hive Core", "Foundry", "Factory", or "27 adoption amplifiers" do not correspond to anything in any repo and should be treated as legacy talk pending evidence.

**Source:** Locked 2026-05-08. Originated from a discovery sweep across hivebaby, queen-bee, universal-document, and standalone engine repos to make QB findable from every future CC session — without this rule the queen-bee repo is reachable only by name search and CC has historically re-implemented governance functions that QB already provides.

**Constitution reference:** [§VII "Queen Bee Architecture"](docs/HIVE_CONSTITUTION.md#vii-queen-bee-architecture--queen_bee_location).

---

### Rule #38 — `[HIVE_ACCESSIBILITY_STANDARD]`

**Title:** Primary CTAs across every Hive engine work on mouse, Enter, Space, and Cmd/Ctrl+Enter — semantic `<button>`, visible focus ring, reachable via Tab. Six A-rules in HiveOps audit at warn-only until ≥80% of engines pass at least 5 of 6.

**Body:** Every primary CTA in a Hive engine must be activatable on mouse click, Enter (when focused), Space (when focused), and Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux) when the form's textarea has focus. The CTA must be reachable via Tab navigation and have a visible focus ring (`focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2` is the canonical Tailwind v4 form). The CTA must be a semantic `<button>` element — not a `<div onClick>` or `<span onClick>`.

The canonical reference implementation is `apps/hive-plainscan/components/ReportInput.tsx`:

- Wrap the input region in `<form ref={formRef} onSubmit={handleFormSubmit}>`.
- Change the CTA to `<button type="submit">` so the form's onSubmit fires on Enter inside any input AND on click of the button.
- Add `onKeyDown` to the textarea: when `(event.metaKey || event.ctrlKey) && event.key === "Enter"`, call `formRef.current?.requestSubmit()` (which fires onSubmit, which calls `event.preventDefault()` first).
- Detect platform via `navigator.platform` (in `useEffect` for SSR safety) and render hint text "Cmd+Enter to submit" on Mac or "Ctrl+Enter to submit" elsewhere.
- Add `focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:outline-none` to the CTA's className.
- Other buttons (tab switchers, "Try sample report", etc.) must keep `type="button"` so they don't accidentally submit the form.

HiveOps enforces this via six rules added 2026-05-09: A01 (semantic button), A02 (Enter activation), A03 (Space activation), A04 (Cmd/Ctrl+Enter handler), A05 (focus ring), A06 (Tab reachable). All six are heuristics (regex over client component `.tsx` files) — false positives are preferred over silent gaps. The rules ship as `severity: "RECOMMENDED"` AND return `status: "warn"` rather than `"fail"` so they don't block existing engines on day one.

Lift criterion: when ≥80% of audited engines (count, not traffic) pass at least 5 of 6 A-rules, swap the six rule definitions' `status: "warn"` returns for `status: "fail"` in the same PR that records the lift date in Constitution §V `[HIVE_ACCESSIBILITY_STANDARD]`. Initial baseline 2026-05-09 across 19 engines: HivePlainScan passes all 6 (post-fix); A04 (Cmd+Enter, ~16% pass) and A01 (semantic button, ~26% pass) are the lowest — the migration campaign starts there.

**Source:** Locked 2026-05-09. Originated from a HivePlainScan user report — "Explain my report" only worked on mouse click, not keyboard. Fix shipped in `apps/hive-plainscan/components/ReportInput.tsx`; rule generalises the pattern across the fleet.

**Constitution reference:** [§V "ACCESSIBILITY rules (A01..A06)"](docs/HIVE_CONSTITUTION.md#accessibility-rules-a01a06--hive_accessibility_standard).

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
+ [§VIII "Anthropic whole-PDF fallback timeout"](docs/HIVE_CONSTITUTION.md#anthropic-whole-pdf-fallback-timeout--diagnose-first-rule).

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
+ [§VIII "Anthropic API key paste leak"](docs/HIVE_CONSTITUTION.md#anthropic-api-key-paste-leak--never-paste-secrets-in-cc-chat).

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

**Constitution reference:** [§IX "Update Mechanism"](docs/HIVE_CONSTITUTION.md#ix-update-mechanism).

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
