# HIVE — Comprehensive Engine Inventory & UCOC Compliance Sweep

**Audit date:** 2026-05-08
**Audit scope:** every engine reachable from `HIVE_CONSTITUTION.md` §VI, `CLAUDE.md` §D, the planet visualization (`public/index.html` `ENGINES` + `ADMIN_ENGINES` arrays), the LCARS sidebar (same data source as the planet), and the `saggarsonny-boop` GitHub user-repo list.
**Method:** DNS resolution (`dig`), HTTP probes (root `/` + `/api/health`), `gh api` for last commits, `vercel project ls` for last deploy timestamps, GitHub raw-content checks for `ENGINE_GRAMMAR.md` (canonical YAML / legacy GrapplerHook / absent), and the most recent HiveOps verdict from §VI of the constitution. Network probes from the operator's local environment (`darwin`); Vercel deploy timestamps relative to ~13:00 UTC 2026-05-08 (so "5h" ≈ 08:00 UTC today).

**Operational classification:**
- **LIVE** — canonical domain resolves and responds 200/3xx, real iteration in the last 14 days.
- **SCAFFOLD** — code exists and builds, but the canonical domain is unreachable (NXDOMAIN, or DNS without a Vercel project attached) → no real users possible.
- **DORMANT** — was launched, domain still resolves, but no meaningful commits in the last 18+ days and no observable post-launch iteration.
- **RETIRED** — explicitly retired or abandoned.

**HiveOps audit verdict:**
- **PASS** / **WARN** / **FAIL** — from `tools/hive-ops/cli.ts <slug>` per §VI sweep dated 2026-05-06 (subsequent 2026-05-08 migrations folded in).
- **NO_SCHEMA_AUDIT (legacy)** — engine ships an old `<GrapplerHook>` HTML-ish frontmatter, not the canonical YAML. HiveOps cannot parse it; not yet audited.
- **NO_SCHEMA** — no `ENGINE_GRAMMAR.md` at all.
- **n/a** — engine class is `static-html` / non-canonical / pre-canonical (e.g. planet front door, testing rig).

> **User-visible signal column.** No third-party analytics across the Hive (constitution §C9). The only ecosystem-wide live-usage signal is the `hive_alerts` ledger (`migrations/001_hive_alerts.sql`), and only `apps/hive-activity-partner/lib/safety/alerts.ts` + `tools/ci-doctor/index.ts` write to it today. So this column reports **observable operational signal** (planet integration, LCARS placement, testing-station registration, `hive_alerts` emitter wired in, daily-active-deploy cadence) — not user counts.

---

## Engine table

| # | Engine / Slug | Repo | Vercel project · last deploy | Canonical domain (DNS) | HTTP root → `/api/health` | Last meaningful commit | Planet / LCARS | User-visible signal | HiveOps verdict | Class |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **hivebaby planet** (`hivebaby`) | [hivebaby](https://github.com/saggarsonny-boop/hivebaby) (root) | `hivebaby` · 5h | `hive.baby` ✅ A `216.198.79.1` | `307` → `307` (root → `/`) | 2026-05-03 — Add IMGTrainer to planet ENGINES + planet UI satellite (#53/#63) | n/a (it *is* the planet) | Front door for everything; LCARS sidebar embedded | n/a (`engine_class: static-html`) | **LIVE** |
| 2 | **ParkBack** (`parkback`) | hivebaby/`apps/parkback` | `hivebaby-7c1o` · 5h | `parkback.hive.baby` ✅ | `200` → `404` (no health endpoint by design — client-only PWA) | 2026-05-08 — fix(parkback): React/JSX-runtime types error breaking preview deploys | Planet TIER 1 LIVE | Testing-station slot #2 (2026-05-04) | ✅ **PASS** (48/0/0/6/3 — V01/V18/V19 waived) | **LIVE** |
| 3 | **HiveActivityPartner** (`hive-activity-partner`) | hivebaby/`apps/hive-activity-partner` | `hive-activity-partner` · 5h (prod URL `.vercel.app`) | `activitypartner.hive.baby` ⚠️ DNS CNAME present, HTTPS `000` (cert/handshake fails — Vercel domain not attached to project) | `000` → `000` | 2026-05-08 — middleware isPublic fix + operator audit dashboard | **NOT on planet, NOT in LCARS** | Phase 1/6 active build; emits `hive_alerts` | ✅ **PASS** (50/0/0/5/2 — V18/V19 waived for Phase-1 scaffold) | **SCAFFOLD** |
| 4 | **HiveAestheticBestie** (`hive-aestheticbestie`) | hivebaby/`hive-aestheticbestie` + ext [hive-aestheticbestie](https://github.com/saggarsonny-boop/hive-aestheticbestie) | `hive-aestheticbestie` · 15d (prod `.vercel.app`) | `hiveaestheticbestie.hive.baby` ✅ | `200` → `404` | 2026-05-08 — canonical schema migration WARN→PASS (#119) | Planet TIER 1 LIVE | — | ✅ **PASS** (52/0/0/5/0) | **LIVE** |
| 5 | **HivePhoto** (`hive-hivephoto`) | hivebaby/`hive-hivephoto` + ext [hive-hivephoto](https://github.com/saggarsonny-boop/hive-hivephoto) | `hive-hivephoto` · 12d | `hivephoto.hive.baby` ✅ | `200` → **`200`** | 2026-05-08 — canonical schema migration WARN→PASS (#125, reference template) | Planet TIER 2 BUILDING | Health endpoint live; ext-repo last code 2026-04-27 | ✅ **PASS** (53/0/0/4/0) | **LIVE** |
| 6 | **HiveIMR** (`hive-imr`) | hivebaby/`hive-imr` | `hive-imr` · 5h | `hiveimr.hive.baby` ✅ | `200` → **`200`** | 2026-05-08 — canonical schema migration WARN→PASS (#122) | Planet TIER 1 LIVE (flipped t2→t1 on 2026-04-27) | — | ✅ **PASS** (52/0/0/5/0) | **LIVE** |
| 7 | **HivePlainScan** (`hive-plainscan`) | hivebaby/`apps/hive-plainscan` | `hive-plainscan` · 5h (prod URL Vercel claims `scan.hive.baby`) | `plainscan.hive.baby` ❌ **NXDOMAIN** · `scan.hive.baby` ❌ **NXDOMAIN** | `ERR` → `ERR` | 2026-05-06 — warn-mode overrides for 23 outstanding HiveOps fails (#102) | **Planet TIER 1 LIVE — false advertising** (URL `https://plainscan.hive.baby` does not resolve) | — | ⚠️ **WARN** (6/22/0/0/0 — legacy grammar; warn expires 2026-06-05; tracked in [hivebaby#101](https://github.com/saggarsonny-boop/hivebaby/issues/101)) | **SCAFFOLD** |
| 8 | **IMGTrainer** (`imgtrainer`) | hivebaby/`imgtrainer` (nested separate repo) + ext [imgtrainer](https://github.com/saggarsonny-boop/imgtrainer) | `imgtrainer` · 5d | `imgtrainer.hive.baby` ✅ | `200` → **`200`** | 2026-05-03 — persona swap (real Robert Hayes); SEO sitemap/robots | Planet TIER 1 LIVE | Testing-station slot #1 (2026-05-03) | n/a — skipped (nested repo, [hivebaby#99 closed](https://github.com/saggarsonny-boop/hivebaby/issues/99)) | **LIVE** |
| 9 | **HiveMoon** (`hive-moon`) | [hive-moon](https://github.com/saggarsonny-boop/hive-moon) | `hive-moon` · 11d (vercel project `hive-moon-4ka4`) | `hivemoon.hive.baby` ✅ | `200` → `404` | 2026-04-27 — three quick fixes; farmsense moon phase API + local fallback | Planet TIER 1 LIVE | — | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (11d, borderline) |
| 10 | **HiveField** (`hive-field`) | [hive-field](https://github.com/saggarsonny-boop/hive-field) | `hive-field` · 15d | `hivefield.hive.baby` ✅ | `200` → `404` | 2026-04-19 — Tooltip Tour, multilingual ribbon, AutoDemo (initial onboarding round) | Planet TIER 1 LIVE | — | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (19d) |
| 11 | **HiveClock** (`hive-clock`) | [hive-clock](https://github.com/saggarsonny-boop/hive-clock) | `hive-clock` · 15d | `hiveclock.hive.baby` ✅ | `200` → `404` | 2026-04-19 — Tooltip Tour, multilingual ribbon, AutoDemo | Planet TIER 1 LIVE | — | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (19d) |
| 12 | **HiveClarity** (`hive-clarity`) | [hive-clarity](https://github.com/saggarsonny-boop/hive-clarity) | (no Vercel match by name on first 2 pages — domain still serves) | `hiveclarity.hive.baby` ✅ | `200` → `404` | 2026-04-19 — Tooltip Tour, multilingual ribbon, AutoDemo | Planet TIER 1 LIVE | — | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (19d) |
| 13 | **HiveStrength** (`hive-strength-mastery`) | [hive-strength-mastery](https://github.com/saggarsonny-boop/hive-strength-mastery) | `hive-strength-mastery` · 15d | `hivestrength.hive.baby` ✅ + `hivestrengthmastery.hive.baby` ✅ (both resolve) | `200` → `404` | 2026-04-19 — Tooltip Tour + canonical footer | Planet TIER 1 LIVE (URL `hivestrength.hive.baby`); Vercel prod URL `hivestrengthmastery.hive.baby` | Alias divergence | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (19d) |
| 14 | **HiveBodyLog** (`hive-body-log`) | [hive-body-log](https://github.com/saggarsonny-boop/hive-body-log) | `hive-body-log` · 15h (deploy infra-only) | `hivebodylog.hive.baby` ✅ + `bodylog.hive.baby` ✅ (alias) | `200` → `404` | 2026-04-19 — Tooltip Tour, multilingual ribbon, AutoDemo | Planet TIER 1 LIVE | — | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (19d code-wise) |
| 15 | **HiveEngineBuilder** (`hive-engine-builder`) | [hive-engine-builder](https://github.com/saggarsonny-boop/hive-engine-builder) | `hive-engine-builder` · 5d | `hiveenginebuilder.hive.baby` ✅ + `heb.hive.baby` ✅ | `200` → `404` | 2026-05-03 — fix(workshop): refine answers as array; INIT_SQL split per-statement (#7/#8) | Planet TIER 1 LIVE + LCARS ADMIN | Meta-engine — used to scaffold every other engine | NO_SCHEMA_AUDIT (legacy) | **LIVE** |
| 16 | **QueenBee** (`queen-bee`) | [queen-bee](https://github.com/saggarsonny-boop/queen-bee) | (Vercel project not surfaced first 2 pages) | `queenbee.hive.baby` ✅ | `200` → **`200`** | 2026-04-19 — QB governance v0.2.0: schema validation, safety enforcement, audit + health endpoints | Planet TIER 1 LIVE + LCARS ADMIN | Governance health endpoint live | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (19d, but functional service) |
| 17 | **CreatorConsole** (`creator-console`) | [creator-console](https://github.com/saggarsonny-boop/creator-console) | (no Vercel match) | `creatorconsole.hive.baby` ✅ | **`307`** → `404` (root redirect — likely auth gate) | 2026-04-19 — ENGINE_GRAMMAR.md, footer, favicon | **LCARS ADMIN only — NOT on planet** | Private ops dashboard | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (19d) |
| 18 | **HiveSecretBox** (`secret-box`) | [secret-box](https://github.com/saggarsonny-boop/secret-box) | `secret-box` · 15d | `secretbox.hive.baby` ✅ | `200` → `404` | 2026-04-19 — Tooltip Tour, AutoDemo, FirstVisitCard | Planet TIER 1 LIVE (label "Secret Box") | — | **NO_SCHEMA** | **DORMANT** (19d) |
| 19 | **WhoTextedMe** (`whotextedme`) | [whotextedme](https://github.com/saggarsonny-boop/whotextedme) | `whotextedme` · 15d | `whotextedme.hive.baby` ✅ | `200` → `404` | 2026-04-19 — Tooltip Tour wiring | Planet TIER 1 LIVE | — | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (19d) |
| 20 | **HiveAdminSupport** (`hive-support`) | [hive-support](https://github.com/saggarsonny-boop/hive-support) | `hive-support` · 13d | `support.hive.baby` ✅ | `200` → `404` | 2026-04-25 — SYSTEM_PROMPT fix + Stripe payment links wired | Planet TIER 1 LIVE | Receives inbound `hive@hive.baby` worker traffic — central to ops | NO_SCHEMA_AUDIT (legacy) | **LIVE** |
| 21 | **HiveMeme** (`hive-hivememe`) | [hive-hivememe](https://github.com/saggarsonny-boop/hive-hivememe) (hivebaby subdir empty stub) | (no Vercel match) | `hivememe.hive.baby` ✅ | `200` → `404` | 2026-04-20 — defer Anthropic key validation; turbopack config fix; init | Planet TIER 1 LIVE | Status `BUILDING` per CLAUDE.md but 200s | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (18d, no iteration past init) |
| 22 | **HiveMicroRitual** (`hive-microritual`) | [hive-microritual](https://github.com/saggarsonny-boop/hive-microritual) (hivebaby subdir empty) | `hive-microritual` · 15d (prod `.vercel.app`) | `hivemicroritual.hive.baby` ✅ | `200` → `404` | 2026-04-20 — favicon + metadata title; init 2026-04-20 | Planet TIER 1 LIVE | — | NO_SCHEMA_AUDIT (legacy) | **DORMANT** (18d) |
| 23 | **HiveMemorySpace** (`hive-memory-space`) | [hive-memory-space](https://github.com/saggarsonny-boop/hive-memory-space) (hivebaby subdir empty) | (no Vercel match) | `hivememoryspace.hive.baby` ⚠️ DNS resolves, **HTTP `404`** at root | `404` → `404` | 2026-04-20 — edge-safe passthrough middleware; Next.js 15.5.15 | **Planet TIER 2 BUILDING — false advertising** (URL serves 404) | — | HAS_CANONICAL_GRAMMAR (no audit run yet) | **SCAFFOLD** |
| 24 | **SovereignArbitrage** (`hive-swarm-sovereign-arbitrage`) | [hive-swarm-sovereign-arbitrage](https://github.com/saggarsonny-boop/hive-swarm-sovereign-arbitrage) | (no Vercel match) | `sovereignarbitrage.hive.baby` ✅ | `200` → `404` | 2026-04-20 — demo onboarding typewriter; initial 10-engine cluster | Planet TIER 1 LIVE | — | **NO_SCHEMA** | **DORMANT** (18d) |
| 25 | **UniversalDocumentInc** (`ud-inc`) | [ud-inc](https://github.com/saggarsonny-boop/ud-inc) | `ud-inc` · 14d | `universaldocument.hive.baby` ✅ | `200` → `404` | 2026-04-25 — sitemap.ts + ecosystem links + TooltipTour | Planet TIER 1 LIVE | UD landing + consultancy credential | NO_SCHEMA_AUDIT (legacy) | **LIVE** |
| 26 | **UDLanding** (`ud-landing`) | [universal-document](https://github.com/saggarsonny-boop/universal-document)/`apps/landing` | `landing` · 6h (no domain attached, prod `.vercel.app`) | `ud.hive.baby` ✅ DNS, `200` (served by another project — likely a Vercel alias on a sibling project) | `200` → `404` | 2026-05-08 — UD monorepo PR roll-up | Not separately on planet (UD ecosystem covered by UDInc tile) | — | **NO_SCHEMA** | **SCAFFOLD** (Vercel project has no domain; observable 200 comes from a sibling) |
| 27 | **UDConverter** (`ud-converter`) | universal-document/`apps/converter` | `converter` · 5h | `converter.hive.baby` ✅ | `200` → `404` | 2026-05-08 — fix(ud-converter): resolve V04/V18/V19/V23; operator audit dashboard (#26/#29) | Planet TIER 1 LIVE | Multi-PR-per-day cadence | ❌ **FAIL** (48/4/0/0/1 — pre-existing V-rule findings; `--write-overrides` proposal scaffolded, not yet committed) | **LIVE** |
| 28 | **UDCreator** (`ud-creator`) | universal-document/`apps/creator` | `ud-creator` · 6h | `creator.hive.baby` ✅ | `200` → `404` | 2026-05-08 — UD monorepo PR roll-up | Planet TIER 1 LIVE | — | **NO_SCHEMA** | **LIVE** |
| 29 | **UDReader** (`ud-reader`) | universal-document/`apps/reader` | `universal-document-mlte` · 6h | `reader.hive.baby` ✅ | `200` → `404` | 2026-05-08 — UD monorepo PR roll-up | Planet TIER 1 LIVE | — | **NO_SCHEMA** | **LIVE** |
| 30 | **UDValidator** (`ud-validator`) | universal-document/`apps/validator` | `validator` · 6h | `validator.hive.baby` ✅ | `200` → `404` | 2026-05-08 — UD monorepo PR roll-up | Planet TIER 1 LIVE | — | **NO_SCHEMA** | **LIVE** |
| 31 | **UDUtilities** (`ud-utilities`) | universal-document/`apps/utilities` | `ud-utilities` · 5h | `utilities.hive.baby` ✅ | `200` → `404` | 2026-05-08 — UD monorepo PR roll-up | Planet TIER 1 LIVE | — | **NO_SCHEMA** | **LIVE** |
| 32 | **UDSigner** (`ud-signer`) | universal-document/`apps/signer` (also separate ext repo [ud-signer](https://github.com/saggarsonny-boop/ud-signer)) | `ud-signer` · 6h | `signer.hive.baby` ✅ | `200` → `404` | 2026-05-08 — UD monorepo PR roll-up; ext repo last 2026-04-23 | Planet TIER 1 LIVE | Two-repo split: which is canonical? | **NO_SCHEMA** | **LIVE** |
| 33 | **HiveTestingStation** (`hive-testing-station`) | [hive-testing-station](https://github.com/saggarsonny-boop/hive-testing-station) | `hive-testing-station` · 5d | `test.hive.baby` ✅ | `200` → **`200`** | 2026-05-04 — Register ParkBack slot (#2); IMGTrainer slot (#1) | **NOT on planet, NOT in LCARS** (operational tooling) | Cross-engine usability test rig — 2 active slots | **NO_SCHEMA** (operational tool) | **LIVE** |
| 34 | **HiveStation / Space Station** (`hive-station`) | [hive-station](https://github.com/saggarsonny-boop/hive-station) | (no Vercel match by name; `station.hive.baby` resolves) | `station.hive.baby` ✅ | `200` → `404` | 2026-04-20 — fix: remove unused router import; add UD Utilities to LCARS | LCARS ADMIN only (label "Space Station") | "Hive internal operations hub" | **NO_SCHEMA** | **DORMANT** (18d, internal tool) |
| 35 | **expo-hive** (`expo-hive`) | [expo-hive](https://github.com/saggarsonny-boop/expo-hive) | (no Vercel match — Expo mobile, not deployed on Vercel) | n/a (mobile app) | n/a | 2026-04-23 — Initial HIVE mobile app (Expo WebView wrapper) | **Not in any planet/LCARS/constitution inventory** | Mobile WebView shell experiment | n/a (not a Vercel engine) | **DORMANT** (15d, single-commit experiment) |

**Tier 3 PLANNED entries on planet (no URL, no repo, placeholder cells):**
HiveTV · Trust Mesh · Confession · Desire · Regret · Forgiveness · HiveMic · HiveSign · HiveFocus · HiveImagine · HiveHomeSense · HiveAirSense · HiveAlmanac · HiveWeather · HiveMessage · EarthSense — 16 placeholder cells.

**Planet patron tile (not an engine):** `Patrons` → `https://hive.baby/patrons`.

---

## Gap report

### Engines visible on the planet/LCARS but NOT in the constitution §VI inventory

The constitution §VI explicitly enumerates only 6 hivebaby-tracked engines + 1 nested-skip + 1 external. CLAUDE.md §D goes broader (lists ~30) but the constitution itself is the canonical governance ledger and is incomplete by its own §VI TODO ("generate this section programmatically from `engines.json`").

- **HiveStation / Space Station** (LCARS ADMIN, repo [hive-station](https://github.com/saggarsonny-boop/hive-station), domain `station.hive.baby`). Not in §VI; not in CLAUDE.md §D. Internal ops hub.
- **CreatorConsole** (LCARS ADMIN + planet TIER 1 LIVE in CLAUDE.md §D). Not in §VI.
- **HiveTestingStation** (`test.hive.baby`). Not in §VI; mentioned only in passing in §V (testing-station slot registration).
- **All UD ecosystem sub-apps** (UDConverter is the only one in §VI; UDCreator/Reader/Validator/Utilities/Signer/Landing each absent).
- **All TIER 3 PLANNED placeholders** — 16 entries on the planet that have no repo and no URL. Constitution doesn't list them as engines (correctly), but the planet does as marketing surfaces.

### Engines in repos but NOT in the planet / LCARS (visibility gap)

- **HiveActivityPartner** — actively built (Phase 1/6), HiveOps PASS, but **not on the planet and not in LCARS**. The most surprising absence given how much code activity is happening today (multiple PRs per day). Domain `activitypartner.hive.baby` also has the Vercel attachment bug, so even if the planet linked it, the link wouldn't work. **Highest-priority visibility gap.**
- **HiveTestingStation** — `test.hive.baby` is live and serves a 200 + 200 health endpoint, but it's intentionally unlisted (admin tooling, not a public engine).
- **expo-hive** — mobile WebView wrapper experiment; intentionally unlisted (no domain).

### Engines marked LIVE in any source but unreachable via DNS/HTTP (false advertising)

These are the items that will produce a 4xx/5xx for any user who clicks through:

- **HivePlainScan** — Planet TIER 1 LIVE with URL `https://plainscan.hive.baby`. **Domain is NXDOMAIN.** Vercel project records `scan.hive.baby` as the prod URL, but **`scan.hive.baby` is also NXDOMAIN.** Either DNS was never added or it was deleted. Constitution §VI flags HiveOps WARN (legacy grammar) but doesn't flag the domain miss. **Most urgent operational fix.**
- **HiveMemorySpace** — Planet TIER 2 BUILDING with URL `https://hivememoryspace.hive.baby`. DNS resolves, but **the project returns HTTP 404 at the root.** Looks like the Vercel domain attachment is wrong (pointing at a project that doesn't have a `/` route).
- **HiveActivityPartner** — Constitution §VI lists `activitypartner.hive.baby` as PASS (HiveOps wise) but the domain has DNS without Vercel attachment, so HTTPS fails handshake. Currently SCAFFOLD per this audit.
- **UDLanding** (`ud.hive.baby`) — DNS resolves, observable 200 but the matching Vercel project (`landing`) has no domain attached on Vercel. The 200 must be coming from a sibling alias. Brittle.

### Engines in WARN/FAIL HiveOps audit (compliance gap)

Active per the 2026-05-06 sweep + 2026-05-08 follow-up migrations:

- **HivePlainScan** — ⚠️ WARN, expires **2026-06-05**. Tracked in [hivebaby#101](https://github.com/saggarsonny-boop/hivebaby/issues/101), remediation PR [#102](https://github.com/saggarsonny-boop/hivebaby/pull/102). Will FAIL on next audit if canonical-schema PR not landed by 2026-06-05.
- **UDConverter** — ❌ FAIL (48/4/0/0/1). Pre-existing V-rule findings (V04, V18, V19, V23). `--write-overrides` proposal scaffolded but not committed in `saggarsonny-boop/universal-document`. **Needs a UCOC tracking issue.**

### Engines with no `ENGINE_GRAMMAR.md` at all (not even auditable)

- **secret-box** — NO_SCHEMA. Planet LIVE, DORMANT.
- **hive-swarm-sovereign-arbitrage** — NO_SCHEMA. Planet LIVE, DORMANT.
- **hive-station** — NO_SCHEMA. LCARS ADMIN only, DORMANT.
- **hive-testing-station** — NO_SCHEMA (operational tool, not a canonical engine).
- **All UD sub-apps except UDConverter** — UDCreator, UDReader, UDValidator, UDUtilities, UDSigner, UDLanding all have **no `ENGINE_GRAMMAR.md`** in `universal-document/apps/<app>/`. UDConverter is the only one with the canonical schema. Planet has them all marked TIER 1 LIVE.

### Engines with legacy GrapplerHook grammar (parses but not by HiveOps)

hive-moon · hive-field · hive-clock · hive-clarity · hive-strength-mastery · hive-body-log · hive-engine-builder · queen-bee · creator-console · whotextedme · hive-support · hive-hivememe · hive-microritual · ud-inc · imgtrainer (15 engines; HiveOps cannot parse — counts as ungoverned).

### Domain alias divergence

- **HiveStrength** — `hivestrength.hive.baby` (CLAUDE.md canonical) and `hivestrengthmastery.hive.baby` (Vercel prod URL) both live. Pick one.
- **HiveBodyLog** — `hivebodylog.hive.baby` (CLAUDE.md canonical) and `bodylog.hive.baby` (alias) both live.
- **HiveEngineBuilder** — `hiveenginebuilder.hive.baby` (CLAUDE.md canonical) and `heb.hive.baby` (alias) both live.

### Repo-split divergence

- **UDSigner** — exists both as a stand-alone repo [ud-signer](https://github.com/saggarsonny-boop/ud-signer) (last commit 2026-04-23, single init commit) **and** in `universal-document/apps/signer/` (deployed today, `signer.hive.baby` is actively served). Which is canonical? CLAUDE.md §D says the monorepo path. The standalone repo looks dormant after one initial commit but was never deleted.

---

## Phase 4 — UCOC compliance issue plan

Per spec: tracking issues filed in the appropriate repos for engines that need to migrate to the canonical UCOC (Uniform Code Of Conduct = canonical `ENGINE_GRAMMAR.md` + HiveOps-auditable PASS verdict). Reference template: [hivebaby PR #125](https://github.com/saggarsonny-boop/hivebaby/pull/125) — HivePhoto canonical schema migration WARN→PASS.

**Filing scope (LIVE/SCAFFOLD only — DORMANT engines deferred to retirement decision):**

| Priority | Engine | Repo | Issue | Type |
|---|---|---|---|---|
| P0 | UDConverter | saggarsonny-boop/universal-document | Migrate UD Converter HiveOps FAIL → PASS (4 V-rule fails: V04, V18, V19, V23) | LIVE-FAIL |
| P0 | HiveEngineBuilder | saggarsonny-boop/hive-engine-builder | Migrate to canonical Hive UCOC (`ENGINE_GRAMMAR.md` YAML frontmatter) | LIVE-legacy |
| P0 | HiveAdminSupport | saggarsonny-boop/hive-support | Migrate to canonical Hive UCOC (`ENGINE_GRAMMAR.md` YAML frontmatter) | LIVE-legacy |
| P0 | UniversalDocumentInc | saggarsonny-boop/ud-inc | Migrate to canonical Hive UCOC (`ENGINE_GRAMMAR.md` YAML frontmatter) | LIVE-legacy |
| P0 | UDCreator/Reader/Validator/Utilities/Signer/Landing | saggarsonny-boop/universal-document | Add canonical `ENGINE_GRAMMAR.md` for 6 UD sub-apps (umbrella) | LIVE-no-manifest |
| P1 | HiveActivityPartner | saggarsonny-boop/hivebaby | DNS-attach `activitypartner.hive.baby` to Vercel project (operational, not UCOC) | SCAFFOLD-DNS |
| P1 | HivePlainScan | saggarsonny-boop/hivebaby | Operational: register DNS for `plainscan.hive.baby` (planet says LIVE but NXDOMAIN); UCOC migration tracked at [#101](https://github.com/saggarsonny-boop/hivebaby/issues/101) | SCAFFOLD-DNS+WARN |
| P2 | HiveMemorySpace | saggarsonny-boop/hive-memory-space | Operational: HTTP 404 at root despite DNS — fix Vercel project attachment | SCAFFOLD-HTTP |

P0 items (UCOC-only, not operational) are filed in this audit. P1/P2 items are operational and deferred to follow-up unless explicitly asked — they're called out here for visibility.

---

## Summary

### Counts

| Category | Count | Notes |
|---|---|---|
| Total engines (excluding 16 TIER-3 planned placeholders + Patrons page) | **35** | Includes planet front door + admin LCARS-only |
| **LIVE** | **17** | hivebaby planet, ParkBack, HiveAestheticBestie, HivePhoto, HiveIMR, IMGTrainer, HiveEngineBuilder, HiveAdminSupport, UniversalDocumentInc, UDConverter, UDCreator, UDReader, UDValidator, UDUtilities, UDSigner, HiveTestingStation + (UDInc landing tile) |
| **SCAFFOLD** | **4** | HiveActivityPartner, HivePlainScan, HiveMemorySpace, UDLanding |
| **DORMANT** | **14** | HiveMoon, HiveField, HiveClock, HiveClarity, HiveStrength, HiveBodyLog, QueenBee, CreatorConsole, HiveSecretBox, WhoTextedMe, HiveMeme, HiveMicroRitual, SovereignArbitrage, HiveStation, expo-hive |
| **RETIRED** | **0** | None formally retired |

### HiveOps verdict breakdown

| Verdict | Count | Engines |
|---|---|---|
| ✅ PASS | **5** | parkback, hive-activity-partner, hive-aestheticbestie, hive-imr, hive-hivephoto |
| ⚠️ WARN | **1** | hive-plainscan (expires 2026-06-05) |
| ❌ FAIL | **1** | ud-converter (4 V-rule fails) |
| HAS_CANONICAL_GRAMMAR (not yet audited) | **1** | hive-memory-space |
| NO_SCHEMA_AUDIT (legacy GrapplerHook) | **15** | hive-moon, hive-field, hive-clock, hive-clarity, hive-strength-mastery, hive-body-log, hive-engine-builder, queen-bee, creator-console, whotextedme, hive-support, hive-hivememe, hive-microritual, ud-inc, imgtrainer |
| NO_SCHEMA | **9** | secret-box, hive-swarm-sovereign-arbitrage, hive-station, hive-testing-station, ud-creator, ud-reader, ud-validator, ud-utilities, ud-signer, ud-landing (UD: 6 of 7 sub-apps) |
| n/a (planet front door / nested-repo skip) | **3** | hivebaby (static-html), imgtrainer (nested), expo-hive (mobile) |

So: **5 PASS / 26 not-PASS-eligible-for-audit / 4 not-applicable** out of 35.

### Top 3 engines with genuine momentum

1. **UD ecosystem** (`universal-document` monorepo). Multiple PRs per day cadence today (V-rule fixes on UD Converter, operator audit dashboard, canonical schema migration in flight for the rest). Only engine cluster with explicit external commercial framing (UD Inc.) and a daily-active deploy pulse. The 6 sub-apps without `ENGINE_GRAMMAR.md` are the largest single UCOC gap in the ecosystem.
2. **HiveActivityPartner** (`apps/hive-activity-partner`). Substantial Phase-1/6 build all this week — operator audit dashboard, server/client strings split, middleware fixes, `hive_alerts` emitter wired in. Highest commit-density engine besides the UD monorepo. Not visible to users yet because of a DNS attachment bug.
3. **The hivebaby root cluster** (planet + ParkBack + HiveIMR + HivePhoto + HiveAestheticBestie). The 2026-05-08 canonical-schema migration sweep moved 4 engines to HiveOps PASS in a single day. ParkBack's React/JSX-runtime types fix landed today. Demonstrates the migration playbook works.

### Top 3 cleanup candidates (formal retirement)

1. **The 2026-04-19 cohort that's been static for 19 days** — HiveField, HiveClock, HiveClarity, HiveStrength, HiveBodyLog, HiveSecretBox, WhoTextedMe, CreatorConsole, QueenBee. Each got the initial onboarding round (Tooltip Tour, multilingual ribbon, AutoDemo, FirstVisitCard) on 2026-04-19, then stopped. They serve 200, but no one has touched the code since the scaffolding day. None registered in hive-testing-station. None has canonical `ENGINE_GRAMMAR.md`. None is in §VI's HiveOps audit list.
2. **The 2026-04-20 one-shot cluster** — HiveMeme, HiveMicroRitual, HiveMemorySpace, SovereignArbitrage. Each has 1–2 init commits and nothing since. SovereignArbitrage's repo name (`hive-swarm-sovereign-arbitrage`) hints at an experimental 10-engine swarm that never broke out.
3. **expo-hive** — single 2026-04-23 commit (mobile WebView wrapper experiment). Either resurrect with a clear plan or delete.

### Migration recommendation (LIVE-FAIL first, LIVE-no-manifest next)

UCOC migration order, weighted by `operational_state × user_signal`:

1. **UDConverter** (LIVE-FAIL) — most mature engine cluster with active PRs, but failing HiveOps. The `--write-overrides` proposal in §VI just needs to be committed in `universal-document`.
2. **The 6 UD sub-apps without `ENGINE_GRAMMAR.md`** (UDCreator/Reader/Validator/Utilities/Signer/Landing) — same monorepo, can land as one PR that adds 6 manifests templated off UDConverter's.
3. **HiveAdminSupport** (`hive-support`) — central to ops (receives all `hive@hive.baby` inbound), legacy grammar, last touched 13d ago — easy migration win.
4. **HiveEngineBuilder** (`hive-engine-builder`) — meta-engine that scaffolds new engines; ironic that it itself doesn't ship canonical schema. Recently active (5d).
5. **UniversalDocumentInc** (`ud-inc`) — UD landing surface; legacy grammar; last touched 13–14d.

DORMANT engines are migration-deferred — either retire formally or wait for renewed commit activity to justify the audit work.

---

*Report generated by Claude Code session under the T4 audit task. No engine state was modified by this audit; the worktree contains only the new `docs/HIVE_ENGINE_AUDIT_2026_05_08.md` file. UCOC tracking issues are filed by the same session as a separate operation; their links are added to this section after filing.*

## UCOC tracking issues filed (this audit)

| Repo | Issue | Engine(s) | Type |
|---|---|---|---|
| saggarsonny-boop/universal-document | [#30 Migrate UD Converter HiveOps FAIL → PASS (UCOC)](https://github.com/saggarsonny-boop/universal-document/issues/30) | UDConverter | LIVE-FAIL (4 V-rule fails) |
| saggarsonny-boop/universal-document | [#31 Add canonical ENGINE_GRAMMAR.md manifests for 6 UD sub-apps](https://github.com/saggarsonny-boop/universal-document/issues/31) | UDLanding · UDCreator · UDReader · UDValidator · UDUtilities · UDSigner | LIVE-no-manifest (umbrella) |
| saggarsonny-boop/hive-engine-builder | [#10 Migrate to canonical Hive UCOC](https://github.com/saggarsonny-boop/hive-engine-builder/issues/10) | HiveEngineBuilder | LIVE-legacy |
| saggarsonny-boop/hive-support | [#2 Migrate to canonical Hive UCOC](https://github.com/saggarsonny-boop/hive-support/issues/2) | HiveAdminSupport | LIVE-legacy |
| saggarsonny-boop/ud-inc | [#1 Migrate to canonical Hive UCOC](https://github.com/saggarsonny-boop/ud-inc/issues/1) | UniversalDocumentInc | LIVE-legacy |

**5 UCOC tracking issues filed across 4 repos.** Existing trackers ([hivebaby#101 / PR #102](https://github.com/saggarsonny-boop/hivebaby/issues/101) for HivePlainScan WARN) are not duplicated — those are referenced in the gap report instead.

DORMANT engines on legacy grammar (HiveMoon, HiveField, HiveClock, HiveClarity, HiveStrength, HiveBodyLog, QueenBee, CreatorConsole, WhoTextedMe, HiveMeme, HiveMicroRitual) and DORMANT engines without any schema (HiveSecretBox, SovereignArbitrage, HiveStation) **were intentionally not issued** — Phase 4 scope was LIVE/SCAFFOLD only. Their fate (migrate vs. retire) is the cleanup decision flagged in the summary.
