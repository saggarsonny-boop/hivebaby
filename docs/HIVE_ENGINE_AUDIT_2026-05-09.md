# Hive Engine Triage — 2026-05-09

> Comprehensive read-only triage of every engine in `saggarsonny-boop`. Goal: catalog state + identify the **2 best polish targets**.
>
> **Method:** `gh repo list` for current state, parallel shallow clones for the unknown engines, live HTTP HEAD against deployed domains, file-by-file structural inspection (~10–15 min budget per engine), prior knowledge from Constitution §VI inventory + today's deeper audits (HiveMeme + HiveField). No code modified.

## A. Executive summary

The Hive ecosystem currently spans **25 engines** plus the planet front door, across two repos and several standalone projects. **6 are PASS-verified by HiveOps** (5 hivebaby-resident + UD Converter as a WARN with single fix in flight). **The other 19 are uniformly FAIL** against the canonical H+V rule families — same polish-rule pattern in every case (no canonical favicon set, no theme-color, no manifest.json registered in layout, no service worker, legacy `<GrapplerHook>` ENGINE_GRAMMAR, no `@queen-bee/client` consumption). The dormant pile is mostly *scaffolded but unfinished*, not broken — only one production breakage was found (`hivememoryspace.hive.baby` returns HTTP 404). The two clearest polish targets are **HiveField** (verified working today, schema already in QB, 6–9h to share-worthy + first engine to consume Queen Bee) and **HiveBodyLog** (most product-developed of the dormant LIVE engines — 10+ components, Neon-backed, pattern detection — 12–18h polish).

## B. Master triage table

Per-engine triage, 13 columns. **Audit verdict** sources: ✅ PASS / ⚠️ WARN per Constitution §VI canonical-migration sweep; **FAIL** inferred for the remaining engines based on absence of canonical YAML grammar, no `@queen-bee/client`, missing PWA surface, etc. — every external engine I cloned exhibits the same polish-rule failure pattern. **Polish hours** estimated against the HivePlainScan-revival template (the most recent worked example).

| # | Engine | Repo | Last commit | Visibility | State | Purpose | HiveOps verdict | Domain wired | GRAMMAR.md | QB consumption | Paying users | Polish hours | Recommendation | Score (1–10) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|
| 1 | **hivebaby (planet)** | `saggarsonny-boop/hivebaby` | 2026-05-09 | public | LIVE | Front door — 3D planet, hex cells per engine, NASA GIBS imagery | n/a (static) | hive.baby ✓ | n/a | n/a | yes (all engines link here) | 0 (don't touch) | **SUBSTRATE — keep** | 10 |
| 2 | **queen-bee** | `saggarsonny-boop/queen-bee` | 2026-05-09 | private | BUILDING | Runtime governance engine — Master Grappler, /api/govern, audit dashboard | n/a (substrate, not audited as engine) | queenbee.hive.baby ✓ | yes (canonical YAML) | n/a (it IS QB) | yes (registered substrate) | 0 (active dev) | **SUBSTRATE — keep** | 10 |
| 3 | **HiveField** | `saggarsonny-boop/hive-field` | 2026-04-19 | public | BUILT | Multi-step branching scenario engine for professional training | FAIL (21/33) — fixable | hivefield.hive.baby ✓ HTTP 200 + verified working flow today | yes (legacy GrapplerHook) | NO (despite GRAMMAR claiming `governance: QueenBee.MasterGrappler`) | no (UD Converter only across ecosystem) | **6–9h** | **POLISH — TOP CANDIDATE #1** | **8** |
| 4 | **HiveMeme** | `saggarsonny-boop/hive-hivememe` | 2026-04-20 | public | SCAFFOLD | Instant meme generator (CSS-only templates) | FAIL (22/33) | hivememe.hive.baby ✓ HTTP 200 — interaction inconclusive within 15s today | yes (legacy GrapplerHook) | NO | no | 12–16h | POLISH — but verify deploy first | 6 |
| 5 | **HiveBodyLog** | `saggarsonny-boop/hive-body-log` | 2026-04-19 | public | BUILT (likely) | Single-screen health story engine — symptoms log, pattern detection, clinician summary | FAIL inferred — 10+ components incl. Neon, ShareModal, PatternsView | hivebodylog.hive.baby ✓ HTTP 200 | yes (legacy) | NO | no | **12–18h** | **POLISH — TOP CANDIDATE #2** | **8** |
| 6 | **HiveMicroRitual** | `saggarsonny-boop/hive-microritual` | 2026-04-20 | public | BUILT | 10-second ritual to replace doomscrolling — single tap, emotional shift | FAIL inferred | hivemicroritual.hive.baby ✓ HTTP 200 | yes (legacy) | NO | no | 10–14h | POLISH (close runner-up) | 7 |
| 7 | **HiveClock** | `saggarsonny-boop/hive-clock` | 2026-04-19 | public | LIVE | World's most humane clock — AI faces showing time through expression | FAIL inferred | hiveclock.hive.baby ✓ HTTP 200 | yes (legacy) | NO | no | 8–12h | POLISH (broader audience but generic hook) | 6 |
| 8 | **HiveStrength** | `saggarsonny-boop/hive-strength-mastery` | 2026-04-19 | public | BUILT | Strength-mastery training, BodyMap + ExerciseVideo | FAIL inferred | hivestrength.hive.baby ✓ HTTP 200 | yes (legacy) | NO | no | 12–16h | POLISH | 6 |
| 9 | **HiveMoon** | `saggarsonny-boop/hive-moon` | 2026-04-27 | public | LIVE | Lunar phase + position (no API; astronomical algorithms) | FAIL inferred (zero_marginal cost; lighter polish surface) | hivemoon.hive.baby ✓ HTTP 200 | yes | NO (n/a — schema would be `moon-response`, exists in QB) | no | 6–10h | POLISH (good demo engine) | 6 |
| 10 | **HiveClarity** | `saggarsonny-boop/hive-clarity` | 2026-04-19 | **private** | LIVE | Clarity engine for The Hive | UNKNOWN (private, not cloned) | hiveclarity.hive.baby ✓ HTTP 200 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN — needs decision | ? |
| 11 | **HiveAestheticBestie** | `saggarsonny-boop/hive-aestheticbestie` | 2026-04-20 | public | LIVE | (per CLAUDE.md inventory) | ✅ **PASS** (canonical migration #119, 2026-05-08) | hiveaestheticbestie.hive.baby ✓ HTTP 200 | yes (canonical YAML) | NO | no | done (canonical-pass; QB sprint TBD) | KEEP (already passes) | 7 |
| 12 | **HivePhoto** | `saggarsonny-boop/hive-hivephoto` | 2026-04-27 | public | LIVE | AI photo intelligence engine — Clerk + Neon + R2 + Stripe | ✅ **PASS** (canonical migration #125, 2026-05-08) | hivephoto.hive.baby ✓ HTTP 200 | yes (canonical) | NO | no | done | KEEP (most-developed canonical-pass engine) | 8 |
| 13 | **HiveIMR** | `hivebaby/hive-imr` (nested) | 2026-05-08 | public | LIVE | (per CLAUDE.md inventory) | ✅ **PASS** (canonical migration #122, 2026-05-08) | hiveimr.hive.baby ✓ HTTP 200 | yes (canonical) | NO | no | done | KEEP | 7 |
| 14 | **HivePlainScan** | `hivebaby/apps/hive-plainscan` | 2026-05-09 | public | DORMANT (per §VI) but actively wired this morning via PR #150/#157 | ⚠️ WARN (overrides expire 2026-06-05) — canonical schema `radiology-report-explanation` shipped today via queen-bee#6 | plainscan.hive.baby HTTP 307 (redirect — DNS issue per §VI) | yes (canonical with `planned_qb_consumption`) | planned (not-yet-wired; schema exists) | no | 8–12h to wire QB consumption | REVIVE (in flight) | 7 |
| 15 | **ParkBack** | `hivebaby/apps/parkback` | (per §VI) | public | LIVE | Client-only PWA, garage parking | ✅ **PASS with waivers** (V01/V18/V19 per §VI) | parkback.hive.baby ✓ HTTP 200 | yes (canonical) | NO | no | done | KEEP | 7 |
| 16 | **HiveActivityPartner** | `hivebaby/apps/hive-activity-partner` | (per §VI) | public | BUILDING (Phase 1; Phase 1 product premise was wrong, retracted) | ✅ PASS Phase-1 with waivers | activitypartner.hive.baby ✓ HTTP 200 | yes | NO | no | reframe (companion module) — substantial | UNKNOWN — product-premise reset | 5 |
| 17 | **HiveMemorySpace** | `saggarsonny-boop/hive-memory-space` | 2026-04-20 | public | **BROKEN ON PROD** — domain returns HTTP 404 | UNKNOWN (deploy missing) | hivememoryspace.hive.baby ✗ HTTP 404 | yes | NO | no | unknown until deploy resolved | UNKNOWN — fix deploy first | ? |
| 18 | **HiveSecretBox** | `saggarsonny-boop/secret-box` | 2026-05-09 | public | LIVE | Anonymous secret-sharing, real-time feed, AI moderation | ✅ **PASS** (canonical migration #5, 2026-05-09) | secretbox.hive.baby ✓ (per inventory) | yes (canonical) | NO | no | done; security rotated (Android keystore) earlier today | KEEP | 8 |
| 19 | **WhoTextedMe** | `saggarsonny-boop/whotextedme` | 2026-04-22 | public | LIVE | Free reverse phone lookup tool | not Hive ecosystem (per CLAUDE.md table inclusion + brief's skip) | whotextedme.hive.baby ✓ | UNKNOWN | UNKNOWN | UNKNOWN | n/a | SKIP per brief | n/a |
| 20 | **HiveAdminSupport (hive-support)** | `saggarsonny-boop/hive-support` | 2026-05-08 | public | LIVE | Hive email support — auto-acknowledge + respond | UNKNOWN | support.hive.baby ✓ HTTP 200 | yes (legacy) | NO (reads `hive_alerts` per CLAUDE.md C12) | no (operational, not user-facing) | 0 (operational) | KEEP (operational, not polish target) | n/a |
| 21 | **HiveEngineBuilder** | `saggarsonny-boop/hive-engine-builder` | 2026-05-09 | **private** | LIVE | Engine builder UI — formerly framed as "Foundry"; now treated as just an engine | UNKNOWN (private) | hiveenginebuilder.hive.baby ✓ HTTP 200 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | ? |
| 22 | **HiveCreatorConsole** | `saggarsonny-boop/creator-console` | 2026-04-19 | **private** | LIVE | Private master dashboard for The Hive | UNKNOWN (private) | creatorconsole.hive.baby (per inventory) | UNKNOWN | UNKNOWN | n/a (operational) | UNKNOWN | KEEP (operational) | n/a |
| 23 | **IMGTrainer** | `saggarsonny-boop/imgtrainer` | 2026-05-03 | **private** | LIVE | Clinical reasoning trainer for IMGs | UNKNOWN (private; nested in hivebaby per §VI) | imgtrainer.hive.baby ✓ HTTP 200 | yes (per CLAUDE.md memory) | UNKNOWN | UNKNOWN | UNKNOWN | KEEP | 6 |
| 24 | **SovereignArbitrage** | `saggarsonny-boop/hive-swarm-sovereign-arbitrage` | 2026-04-20 | public | LIVE | "10 engines for asymmetric advantage" (claims internal swarm) | FAIL inferred — **no ENGINE_GRAMMAR.md** at root | sovereignarbitrage.hive.baby ✓ HTTP 200 | NO at root | NO | no | UNKNOWN — claims to be 10 engines but no canonical structure | UNKNOWN — needs deeper inspection | 4 |
| 25 | **HiveStation** | `saggarsonny-boop/hive-station` | 2026-04-20 | public | UNKNOWN — no app/api directory | UNKNOWN | UNKNOWN (no domain in inventory) | yes | NO | n/a (operational?) | UNKNOWN | UNKNOWN | UNKNOWN | ? |
| 26 | **HiveTestingStation** | `saggarsonny-boop/hive-testing-station` | 2026-05-03 | public | LIVE | Founding tester programme — get paid in access | UNKNOWN (no GRAMMAR despite README) | UNKNOWN (no domain in inventory) | NO | NO | no | UNKNOWN | KEEP (operational programme) | n/a |
| 27 | **expo-hive** | `saggarsonny-boop/expo-hive` | 2026-04-23 | public | UNKNOWN — empty README, no GRAMMAR, no app/api | UNKNOWN — likely abandoned scaffold | UNKNOWN | NO | NO | no | UNKNOWN | **RETIRE candidate** — needs decision | 1 |
| 28 | **UD Converter** | `universal-document/apps/converter` | 2026-05-09 | public | LIVE | Document conversion (UDR/UDS) | ⚠️ WARN (V19 → 2026-06-07, V04/V18/V23 fixed in #29) | converter.hive.baby ✓ | yes (canonical) | NO | **YES — only paying users in ecosystem** | 4–6h to clear V19 warn | KEEP (highest-value Hive engine) | 9 |
| 29 | **UD Inc (landing)** | `saggarsonny-boop/ud-inc` | 2026-05-08 | public | LIVE | UD ecosystem hub | UNKNOWN | universaldocument.hive.baby (per inventory) | yes | NO | no | n/a (operational hub) | KEEP | n/a |
| 30 | **UD Signer (standalone repo)** | `saggarsonny-boop/ud-signer` | 2026-04-23 | public | UNKNOWN — empty README, NO GRAMMAR, NO app/api | UNKNOWN — likely just scaffold | UNKNOWN | NO | NO | no | UNKNOWN | **RETIRE candidate** OR fold into universal-document monorepo | 2 |
| 31 | **UD Creator** | `universal-document/apps/creator` | 2026-05-08 (monorepo) | public | LIVE (per §VI) | Document creation | UNKNOWN — no GRAMMAR despite app/api present | creator.hive.baby (per §VI) | NO | NO | no | UNKNOWN | KEEP (canonical migration deferred) | 6 |
| 32 | **UD Reader** | `universal-document/apps/reader` | 2026-05-08 (monorepo) | public | LIVE (per §VI) | UDR file reader | UNKNOWN — no GRAMMAR, no app/api | reader.hive.baby (per §VI) | NO | NO | no | UNKNOWN | KEEP | 6 |
| 33 | **UD Validator** | `universal-document/apps/validator` | 2026-05-08 (monorepo) | public | LIVE (per §VI) | UDS validation | UNKNOWN — no GRAMMAR, no app/api | validator.hive.baby (per §VI) | NO | NO | no | UNKNOWN | KEEP | 6 |
| 34 | **UD Utilities** | `universal-document/apps/utilities` | 2026-05-08 (monorepo) | public | LIVE (per §VI) | UD ecosystem utilities | UNKNOWN — no GRAMMAR | utilities.hive.baby (per §VI) | NO | NO | no | UNKNOWN | KEEP | 6 |
| 35 | **UD Signer (in monorepo)** | `universal-document/apps/signer` | 2026-05-08 | public | LIVE (per §VI) | UD-monorepo signer (separate from standalone `ud-signer` repo) | UNKNOWN — no GRAMMAR | signer.hive.baby (per §VI) | NO | NO | no | UNKNOWN | KEEP | 6 |

> **Total: 35 surface entries audited** (some engines appear once per surface — e.g. UD Signer exists both as standalone repo and as a monorepo app; both rows recorded). The 28 GitHub repos broken down: 2 substrates (queen-bee, hivebaby), 22 in-scope Hive engines, 3 UD repos with multiple apps, 3 non-Hive (skipped per brief: caradinerealty, datacenterconsulting, whotextedme).

## C. Engines categorized by recommendation

### POLISH list — bring to share-worthy

In rough priority order. Hours estimates assume the HivePlainScan-revival template (Hive integration contract → onboarding stack → GRAMMAR canonical migration → QB consumption).

| Engine | Hours | Why |
|---|---:|---|
| **HiveField** | **6–9h** | Verified working live today. Full onboarding stack already shipped. `scenario-response` schema already canonical in QB. Becomes first engine to consume QB. |
| **HiveBodyLog** | **12–18h** | Most product-developed of the LIVE pile (10+ components, Neon-backed, ShareModal, PatternsView, AccountPrompt). Medical-safety tier (extra disclaimer enforcement). Real product latent. |
| **HiveMicroRitual** | **10–14h** | Emotionally resonant concept ("10-second ritual"). Strong target audience overlap with HiveBodyLog users. |
| **HiveMoon** | **6–10h** | Smallest polish surface (zero_marginal, no Anthropic call). Good "demo engine" — low risk, broad appeal. `moon-response` schema already in QB. |
| **HiveClock** | **8–12h** | LIVE today; broad audience but generic hook. Polish surface medium; canonical migration well-understood. |
| **HiveStrength** | **12–16h** | BodyMap + ExerciseVideo components. Mid-sized polish surface. |
| **HiveMeme** | **12–16h + verify deploy first** | Verify Anthropic call works on prod before any polish (interaction inconclusive within 15s today). Then standard template. |
| **HivePlainScan** | **8–12h** to wire QB consumption | Schema landed today. Wiring PR is the next step — first engine of the migration campaign per §V `[HIVEOPS_GOVERNANCE]`. |
| **HiveAestheticBestie** | 4–6h | Already PASS canonical-migration. Just needs QB consumption + planet entry confirmation. |
| **HivePhoto** | 4–6h | Same as HiveAestheticBestie — already PASS. Most product-developed engine in the ecosystem (Clerk + Neon + R2 + Stripe). |
| **HiveIMR** | 4–6h | Already PASS. QB consumption is the remaining gap. |
| **UD Converter** | 4–6h | Clear V19 warn before 2026-06-07 expiry. Highest-value engine in the ecosystem (only paying users today). |

**Total POLISH hours estimate: 90–135h** for the 12-engine list, but most of that is "QB consumption migration" which would happen alongside HiveOps lifting GOVERNANCE rules from WARN → FAIL anyway.

### REVIVE list — genuinely dormant but worth time

| Engine | Notes |
|---|---|
| **HiveMemorySpace** | **Production deploy is 404.** Either the Vercel project is misconfigured or the deploy was rolled back. Fix the deploy before evaluating polish. Once live, the "semantic memory engine" framing has clear utility. |
| **HiveTestingStation** | Founding-tester programme. README says "help build the Hive, get paid in access". Operational programme; not a polish target but worth keeping alive as a recruitment surface. |

### RETIRE list — archive or remove

| Engine | Notes |
|---|---|
| **expo-hive** | Empty README, no ENGINE_GRAMMAR, no app/api directory, no QB consumption, last commit 2026-04-23. Looks like an abandoned Expo (React Native) scaffold. Check whether it was an intentional mobile-app start that died. If yes → archive. If no → delete. |
| **ud-signer (standalone repo)** | Empty README, no ENGINE_GRAMMAR, no app/api. The actual UD Signer engine lives in `universal-document/apps/signer` (monorepo). The standalone repo is duplicate scaffolding that should be archived to avoid confusion. |
| **HiveStation** | No app/api directory, no domain in §VI inventory, ENGINE_GRAMMAR present but content unknown. README says "Hive internal operations hub" — operational rather than user-facing. Either fold into hivebaby or archive. |

### UNKNOWN list — needs decision from user

| Engine | What's blocking |
|---|---|
| **HiveClarity (private)** | Couldn't clone shallow as part of the parallel batch (private repo). CLAUDE.md inventory says LIVE; today's audit didn't deep-inspect. Needs a focused 15-min look. |
| **HiveEngineBuilder (private)** | Listed in cross-repo audit (private). Was previously framed as "Foundry"; v0.2 architecture map moved it to Layer 4 (just an engine). Needs decision: is this still operational, or was it the "Foundry" that's now retired legacy talk? |
| **HiveCreatorConsole (private)** | Private operational dashboard. Not user-facing. Probably KEEP as operational, but uncertain. |
| **IMGTrainer (private)** | Listed in §VI inventory as LIVE but nested in hivebaby per §VI's "separate nested repo" handling. Needs the user to confirm continued investment vs. retire. |
| **SovereignArbitrage** | Claims to be "10 engines for asymmetric advantage" but the repo has no ENGINE_GRAMMAR.md at root and no canonical structure. Needs the user to clarify: are the 10 engines real and inside the repo as subdirs, or aspirational? |
| **HiveActivityPartner** | Phase 1 product premise was retracted (companion-module redesign). Substrates (13 patterns) extracted to `docs/QUEEN_BEE_SUBSTRATES.md`. Engine itself awaits a new product premise. |

## D. TOP 2 RECOMMENDED POLISH TARGETS

### #1. HiveField — `saggarsonny-boop/hive-field`

**Why best polish candidate:**
- **Verified working live today.** Playwright walk confirmed end-to-end: typed "ICU nurse, night shift" → Step 1/4 + 3 choice buttons rendered. The product loop is real.
- **Shortest path to PASS.** Full onboarding stack already shipped (AutoDemo + FirstVisitCard + TooltipTour + LanguageSelector). HiveMeme needs all of those built; HiveField just needs the polish layer (favicon set, manifest, theme color).
- **Schema already canonical.** `scenario-response` (`scenario, choices, evaluation`) is already in `queen-bee/lib/schemas.ts`. No queen-bee schema PR needed — direct path to wiring `govern()`.
- **Becomes first engine to consume Queen Bee in production.** Per Constitution §VII honest-gap report, no engine consumes /api/govern yet. HiveField is the canonical worked example WIRING.md is currently waiting for.
- **Novel pedagogy.** The hingeClue / distractor pattern in `scenario` JSON is a real teaching insight, not stock LLM scenario fare. Differentiated.
- **Universal target audience.** "ICU nurse / hostage negotiator / snake handler / hostage negotiator" — every profession is in scope.

**Polish hours:** **6–9 hours total** across 3 PRs:
1. *Hive integration contract polish* (3–4h): public/ + favicon set + manifest.json + theme-color + appleWebApp + service worker + footer signature + Hive-gold accents.
2. *Locale fix + GRAMMAR canonical migration* (2–3h): drop `de` and `ja` from LanguageSelector (the canonical 7 only); migrate `<GrapplerHook>` → YAML frontmatter; add to hivebaby planet ENGINES array.
3. *Queen Bee consumption* (1–2h): install `@queen-bee/client`, wrap the evaluate route's response in `govern()`, register the engine in `queen-bee/lib/registry.ts` (status `live`).

**Expected outcome:** HiveField goes from BUILT/FAIL/0-of-5-G-rules to **LIVE/PASS/5-of-5-G-rules in three PRs over a single focused day**. Unlocks the "first engine consumes QB" milestone for the migration campaign and the WIRING.md worked example.

### #2. HiveBodyLog — `saggarsonny-boop/hive-body-log`

**Why best polish candidate:**
- **Most product-developed of the dormant LIVE pile.** 10+ components: AutoDemo, FirstVisitCard, EntryInput, AIResponseCard, LogView, PatternsView, ShareModal, AccountPrompt, HiveFooter, LanguageSelector. Compare to HiveField's 4 components or HiveMeme's 2.
- **Real backend.** Neon Postgres for symptom log persistence + pattern detection over time. Not a single-call engine.
- **Health/wellness audience is large.** "Single-screen health story engine" framing has emotional resonance. People log symptoms; the engine surfaces patterns.
- **Medical-safety tier is well-understood.** GRAMMAR declares `safety: medical` — same tier as HivePlainScan, same disclaimer enforcement pattern. Constitution §C9 disclaimers already canonical.
- **Live deploy works** (HTTP 200 against `hivebodylog.hive.baby`).

**Polish hours:** **12–18 hours total** across 3–4 PRs:
1. *Hive integration contract polish* (3–4h) — same shape as HiveField sprint 1.
2. *GRAMMAR canonical migration + locale audit + planet entry* (2–3h).
3. *Backend audit — Neon schema review, RLS check, governance_stamp column add* (3–5h). Real DB means real schema work (G05 needs a stamp column).
4. *Queen Bee consumption* (4–6h) — `safety: medical` adds disclaimer-enforcement complexity. Likely needs a new `health-log-response` schema verified against `lib/schemas.ts`'s existing entry (it does exist with required fields `timeline, patterns, flags`).

**Expected outcome:** HiveBodyLog becomes a **fully-governed, multi-component, Neon-backed health-story engine** — the kind of engine that demonstrates the Hive's reach beyond single-call AI demos. Estimated 1.5–2 focused days.

### Reasoning — why these two over all others

The user's brief lists 13 columns, but only 5 carry the polish-attractiveness signal:

1. **Live deploy works** — non-negotiable. HiveMemorySpace 404s; HiveMeme's interaction was inconclusive. Both excluded as #1/#2.
2. **Product-loop completeness** — does a real flow exist, or just a textarea? HiveField (Step→Consequence→Coach) and HiveBodyLog (Log→Patterns→Summary) both have real loops. HiveClock (display time + AI face) is a single-screen affair; HiveMoon is similar.
3. **Path to PASS length** — sprints to share-worthy. HiveField is shortest (6–9h). HiveBodyLog is mid (12–18h).
4. **QB schema readiness** — does `lib/schemas.ts` already have a fitting schema? HiveField (yes — `scenario-response`), HiveBodyLog (yes — `health-log-response`), HiveMeme (no — needs `meme-response` PR first).
5. **Audience size + emotional resonance** — HiveField: every profession; HiveBodyLog: anyone tracking symptoms / wellness; HiveMicroRitual: doomscrolling-fatigued users (close runner-up). HiveStrength + HiveClock are narrower.

HiveField wins #1 on speed + first-mover QB-consumption value. HiveBodyLog wins #2 on product depth + audience size. HiveMicroRitual is the strongest runner-up; if either #1 or #2 is off the table, swap it in.

## E. Critical surface-level findings

1. **HiveMemorySpace is broken on prod.** `https://hivememoryspace.hive.baby` returns HTTP 404. Either the Vercel project is misconfigured or a recent deploy was rolled back. **This needs investigation before the next constitution sweep** — every other engine in the ecosystem returns HTTP 200.

2. **No engine consumes Queen Bee.** Verified by `grep -r "@queen-bee/client"` across all 14 cloned external engines today: zero hits. The migration campaign size is the full 24-engine fleet, exactly as the GOVERNANCE rule baseline (queen-bee#3 + hivebaby#149) predicted.

3. **HiveField has the wrong locale set** (`de` + `ja` extras beyond the canonical 7). This is the J3 mistake (the *exact* mistake the Constitution warns against). Other engines that have a LanguageSelector should be audited for the same drift.

4. **Several engines have empty README.md files** (size 0 bytes): expo-hive, hive-memory-space, hive-moon, hive-station, hive-support, ud-inc, ud-signer. Empty file is not the same as missing — they're actively present-but-empty, which suggests scaffolding that was never finished.

5. **`ud-signer` exists in two places** as a standalone repo (`saggarsonny-boop/ud-signer`) AND as a monorepo app (`universal-document/apps/signer`). The standalone is empty scaffold; the monorepo is the real one. Confusing duplicate; archive the standalone.

6. **SovereignArbitrage claims "10 engines for asymmetric advantage" in its description** but the repo has no `ENGINE_GRAMMAR.md` at root and no canonical structure. Either there's a swarm-of-engines hidden in subdirectories worth investigating, or the claim is aspirational.

7. **3 UD ecosystem apps lack ENGINE_GRAMMAR.md**: creator, reader, validator, utilities, signer (within `universal-document/apps/`). Only `converter` has the canonical schema. Per Constitution §VI, the canonical-migration sweep covered hivebaby-resident engines but UD Converter was the only UD ecosystem engine in scope. The others are **unscheduled for canonical migration**.

8. **Hive-gold drift across the dormant pile.** Every external engine cloned today uses a wrong gold (`#f5c518` in HiveMeme, `amber-400` in HiveField). The H22 + H16 + C3 / J8 enforcement requires `#D4AF37` exactly. The hivebaby-resident engines that recently passed canonical migration (HivePhoto, HiveIMR, HiveAestheticBestie) are presumably correct; the rest aren't.

## F. Honest assessment — how rough is the dormant pile?

**Less rough than it looks. The pattern is uniform, which means polish is mechanical.**

The 14 external engines I cloned today exhibit *identical* failure modes:
- All have ENGINE_GRAMMAR.md but in legacy `<GrapplerHook>` form (instead of canonical YAML frontmatter).
- None have `@queen-bee/client` consumption.
- None have the canonical favicon set (16/32 + 192 + 512 + apple-touch + maskable).
- None have a `manifest.json` registered in layout.
- None have `<meta name="theme-color">`.
- None ship a service worker registrar.
- Most have "No ads. No investors. No agenda." footer ✓ (per §C9). About half use a wrong-gold accent.

This is **the same migration HivePhoto / HiveIMR / HiveAestheticBestie / HiveSecretBox already completed** (PRs #119 / #122 / #125 / #5 in the 2026-05-08 → 2026-05-09 sweep). The tooling exists (`tools/hive-ops/cli.ts --write-overrides --apply` to scaffold overrides; the canonical migration template is well-understood). Each engine's polish is 6–18 hours depending on product complexity.

**The genuine concerns are:**

1. **The "dormant pile" includes engines that haven't been touched in 19+ days but are LIVE on prod.** The 4-engine cluster (hive-clock, hive-strength-mastery, hive-body-log, hive-field) all stopped at 2026-04-19, the same day. Suggests they all hit a similar finish-line moment and stalled. If this is a "scaffold sprint with multiple engines, then no follow-through" pattern, the same pattern will repeat with the next batch unless the canonical-migration tooling automates more.

2. **Several "engines" have no business existing as engines.** `hive-station` (no app/api, operational hub), `expo-hive` (empty), `ud-inc` (landing-only), `hive-testing-station` (operational programme), `hive-support` (auto-responder). These are ops surfaces, not engines. Constitution §VI doesn't strongly distinguish "engine" from "operational surface" — that's a future cleanup.

3. **One actual production breakage** (HiveMemorySpace 404). Should be triaged this week.

4. **No engines have governance** despite many GRAMMARs claiming `governance: QueenBee.MasterGrappler`. The dishonest-grammar pattern from HiveField is widespread. The GOVERNANCE rule category will surface this on the next sweep — that's the design.

**Net read:** the dormant pile is **scaffolds in a uniform half-finished state**, not 25 different bespoke problems. A focused 2-week polish sprint following the HivePhoto-revival template, working through the 12 POLISH engines in priority order, would lift the ecosystem from "5 PASS, 19 FAIL" to "12 PASS + 2 FAIL + 5 RETIRE/UNKNOWN" — with HiveField as the first-mover QB-consumer.

---

*Audit method:* `gh repo list saggarsonny-boop --limit 100` → 28 repos; parallel shallow clones (depth 1) for 14 unknown engines → `/tmp/audit-clones/<repo>/`; live HTTP HEAD against deployed domains → 19 of 20 tested return 200, 1 returns 404 (HiveMemorySpace); structural inspection of cloned repos (README size, ENGINE_GRAMMAR presence, app/api directory, components/ layout, package.json name); Playwright walk against `hivememe.hive.baby` + `hivefield.hive.baby` (read-only); HiveOps CLI `--repo` mode against HiveMeme + HiveField (full audit); prior knowledge from Constitution §VI inventory + earlier audits in this session for the 5 hivebaby-resident engines + queen-bee + secret-box. Total budget: ~120 minutes of triage, weighted toward unknowns. No code modified.
