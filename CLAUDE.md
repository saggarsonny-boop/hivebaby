# HIVE — Claude Code Instructions

> **This file is the operational mirror of [`/docs/HIVE_CONSTITUTION.md`](docs/HIVE_CONSTITUTION.md).**
> See [`MEMORY.md`](MEMORY.md) for the full memory rule set; this file is the operational subset.
> Read the constitution for full context, identity rules, lessons-learned history, and update mechanism.
> **This file is the actionable handbook for CC sessions** — what-to-do-right-now reference, with cross-references to the constitution for the *why* on each rule.
>
> If a rule here conflicts with an in-conversation instruction, the in-conversation instruction wins for that turn only — durable changes go in the constitution + this file via PR. **Read both files at the start of every session.**

---

## A. IDENTITY

### Owner
Sonny Saggar, physician. I direct, you build. Be direct, finish what you start, no vacillating. **Sonny is positioned as peripheral consultant / advisor in all public-facing content — never founder, creator, or owner.** See [Constitution §I](docs/HIVE_CONSTITUTION.md#i-identity-and-positioning).

### The Mission
Hive is a social experiment. **"You are the investor."** No ads, no investors, no agenda. Free at the base tier, forever. We build what people ask for.

### Pricing model
Engines declare `cost_profile` in `ENGINE_GRAMMAR.md`. Free-tier rules per profile:

| Profile | Free tier |
|---|---|
| `zero_marginal` | unlimited free + optional patronage |
| `low_marginal` | 10 / day free |
| `medium_marginal` | 3 lifetime, max 1 / 24h |
| `high_marginal` | none, or 1 lifetime demo |

Plus tier: **$0.97/mo** unlimited. Pro tier: **$29/mo** with power features. UI localization in the canonical 7 languages is free for every tier. Safety-critical info (drug recalls, food hygiene, vehicle recalls, clinical safety) is **never Pro-gated**. Voluntary patronage via the planet's amber/copper Patronage cell, links to `/patrons`. Full table + rationale: [Constitution §III](docs/HIVE_CONSTITUTION.md#iii-pricing-and-cost-profiles).

---

## B. WORKFLOW RULES

These are the standing rules for how work happens. Each one came from a real session; each one stays in force until a PR changes it here.

### B1. PR-based merge — no direct-to-main commits, ever
- Every change goes through a PR. **Including ops/diagnostic workflows that feel low-stakes.** Including single-line fixes. Including YAML-only changes.
- Auto-merge on green CI is the standing pattern: `gh pr merge --merge --delete-branch` once CI is green is fine.
- "Direct push to main is faster" is never the right tradeoff. The rule exists for review-window auditability, not just safety.
- This rule applies to ops commits too — `ops:` and `chore:` prefixes do not exempt anything.

### B2. Surface blockers — don't expand scope quietly
- If the requested work needs additional surface area (extra workflows, helper tooling, refactors not in the spec), **ask before expanding.**
- When sandboxed actions get blocked (denied API key, missing creds, env hole), **report the blocker and wait** — don't invent an ops layer to route around it.
- Past mistake to not repeat: direct-pushing 3 ops workflows + adding `parkback-i18n-generate.yml` because local Anthropic key handling was sandbox-blocked. Right move was to surface the blocker, not invent infrastructure.

### B3. Always read Vercel build logs before fixing failed deploys
When a deployment fails, **never guess at root cause**. Pull the actual build logs first via `vercel inspect`, the dashboard, or the API. The logs say what broke. Acting before reading them wastes a cycle and usually produces the wrong fix.

### B4. Fix your own errors before reporting them
If a build, test, or check fails because of something you produced, fix it before handing back. Do not hand back a half-broken state with "here's what I tried."

### B5. Don't assume infrastructure doesn't exist — search first
Much of the Hive infrastructure already exists. Before declaring an item "deferred" or "not present" in an engine, search the repo for it. Examples that have caught Claude out: install-hint banners, locale loaders, Hive footer signature, planet `ENGINES` array entries. They were already there in shared packages.

### B6. Run HiveOps before opening a PR for any engine
For any change inside `apps/<engine>/` (or any engine repo), run `tsx tools/hive-ops/cli.ts <slug>` before opening the PR. The `.github/workflows/hive-ops.yml` workflow runs on every PR; failing verdicts block merge. Catching the failure locally is cheaper than a CI cycle.

### B7. Operate from hivebaby Codespace, push to any repo via GitHub token
The token is in Codespace secrets. Use `gh` CLI or the GitHub REST API. Don't ask Sonny to run cross-repo commands locally when the token can do it from here.

### B8. When the planet is broken, fix it without being asked
`hive.baby` is the front door. If the planet UI breaks, that's a P0 — fix on sight.

### B9. Auto-deploy by convention
All Vercel projects auto-deploy on push to `main`. After merging a hivebaby change, the deploy hook is:
`curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Mj8SJS4gAlrG2PCXdUCUMmoAQAA3/CfgdTZ1r50"`

### B10. Convert relative dates to absolute when recording
"Thursday", "next week", "later this month" → resolve to YYYY-MM-DD before writing it down. Today's date is in the conversation header.

### B11. Read VISION.md when you need engine specs / pipeline details / adoption stack / full ecosystem context
Don't re-derive vision from CLAUDE.md alone.

### B12. CC handles infrastructure setup autonomously
Where the operation has a working API, CC does it directly: Stripe products via API, Cloudflare Turnstile + DNS via CF API, Vercel env vars + redeploys via Vercel CLI/API, secrets via `openssl rand -base64 32`, GitHub Actions secrets via `gh secret set`. **Never** instruct the user to "go to dashboard X and click Y" except where the API genuinely lacks the operation (rare; e.g. Vercel Blob first-time provisioning). When a dashboard step is genuinely required, name the exact URL + field + value. See [Constitution §IV](docs/HIVE_CONSTITUTION.md#cc-handles-infrastructure-setup-autonomously).

### B13. Device verification mandatory
Every PR with UI changes verifies on real iOS Safari and real Android Chrome (or accurate device profiles in headless WebKit / Chromium). **Vercel CI green is not sufficient.** Past iOS Safari regressions (PR #70 in ParkBack — render-only-the-compass) shipped past green CI because the production iOS render was never verified. See [Constitution §IV](docs/HIVE_CONSTITUTION.md#device-verification-mandatory) + lessons §J.

### B14. Identity rule
Sonny is **never** to be presented as founder / creator / owner of the Hive or any engine in any code, copy, or content scaffolded by CC. Acceptable framings: *consultant on document infrastructure strategy*, *advisor on AI readiness and governance*, *contributor to the Hive ecosystem*. See [Constitution §I](docs/HIVE_CONSTITUTION.md#sonnys-role) for the canonical framings + CONSULTING FRAMEWORK in §I below for the disclosure paragraph.

---

## C. ENGINEERING STANDARDS

### C1. Naming (canonical — applies to every future engine)
- **Engine names:** `HiveEnginename` — PascalCase after `Hive` prefix (`HiveBodyLog`, `HiveClarity`, `HiveAdminSupport`).
- **UD ecosystem:** `UniversalDocument` hub; sub-engines `UDConverter`, `UDCreator`, `UDReader`, `UDValidator`, `UDUtilities`, `UDSigner`.
- **Repos:** `enginename` lowercase hyphen-separated (`hive-body-log`, `hive-strength-mastery`).
- **Domains:** `enginename.hive.baby` — all lowercase, no hyphens (`hivebodylog.hive.baby`, `hiveclarity.hive.baby`). UD hub at `ud.hive.baby`.
- **Established exceptions** — keep as-is: `WhoTextedMe`, `QueenBee`, `HiveSecretBox`, `ParkBack`, `IMGTrainer`. Do not retroactively rename. New engines must follow the canonical pattern.
- **Branches:** `dev` for feature work; `main` for deployment.

### C2. Canonical Hive free-tier locale set — 7 languages
**`en, es, fr, ar, hi, zh, pt`** — English, Spanish, French, Arabic, Hindi, Simplified Chinese, Portuguese.

- Anchored in `apps/parkback/locales/` and the `@hive/onboarding` package as of 2026-05-06.
- Every new engine ships these 7 locales as the floor. Detection via `navigator.language`, English fallback.
- Watch out: an earlier guess of `en/es/fr/de/pt/zh/ar` (with German) was wrong. The true set has Hindi, no German.
- "Add to home screen" copy must be gentle in every locale (Spanish: "agregar a la pantalla de inicio", never "instalar"). Never "Install <product>".

### C3. Canonical Hive gold — `#D4AF37`
- Used for all primary CTAs, the ♥ glyph in footer signature, planet engine cells.
- Audited canonical value. Do **not** introduce a different gold (`#c8960a` and `#FFD700` are not Hive gold).
- Goes in `metadata.themeColor`, `manifest.theme_color`, primary button fill, and footer ♥ color.

### C4. Hive dark palette
| Token | Hex | Use |
|---|---|---|
| Ink | `#0a0a0a` | Page text, dark backgrounds |
| Paper | `#f5f1e6` | Page background |
| Muted | `#9a9588` | Secondary text |
| Gold-dim | `#8a6f1f` | Inactive accents |
| Gold | `#D4AF37` | Primary CTAs, brand mark |

### C5. Hive integration — required on every engine
- **HIVE_HEADER_LOGO** — full Hive logo at the top of every screen, clickable, links to `https://hive.baby` in a new tab, alt `Hive ecosystem`. Asset: `packages/hive-onboarding/assets/hive-logo-full.png` (and `.webp`). 32px tall mobile, 40px tall desktop, inside iOS safe-area-top inset.
- **HIVE_FOOTER_SIGNATURE** — footer ends with `packages/hive-onboarding/assets/hive-mark.svg` (18–22px) and the text "Made with ♥ in the Hive". ♥ in `#D4AF37`. The word "Hive" links to `https://hive.baby` in a new tab. "Made with" / "in the" come from per-locale catalogs; brand name "Hive" stays English.
- **Hive footer link row** — `hive.baby · social experiment · contribute · patronage · privacy`.
- **TAB_TITLE_DESCRIPTIVE** — `<title>` and `metadata.title` are exactly `"[Engine name] — [tagline]"`. No bare engine name, no marketing fluff.
- **THEME_COLOR_CANONICAL** — `metadata.themeColor` and `manifest.theme_color` are exactly `#D4AF37`.
- **APPLE_WEB_APP_META** — `metadata.appleWebApp = { capable: true, title: "<EngineName>", statusBarStyle: "black-translucent" }`.
- **MANIFEST_COMPLETE** — `public/manifest.json` has `name`, `short_name`, `description`, `theme_color: #D4AF37`, `background_color: #000000`, `display: standalone`, `start_url: /`, `scope: /`, `id: /`, full `icons` array with `purpose: any` and `purpose: maskable`.
- **FAVICON_COMPLETE** — `favicon.ico` (16+32 multi-res), `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180×180), `maskable-icon.png` (512×512 with safe zone). Canonical pattern: gold flat-top hex with the engine's letter or symbol centred.

### C6. Onboarding stack — use `@hive/onboarding` (do not re-implement)
The shared package is at `packages/hive-onboarding/` (v0.1, extracted from ParkBack). Every engine consumes:
- `<HiveInstallHint />` — PWA install banner with platform-specific instructions (iOS Safari, Android Chrome, desktop, unknown). Programmatic install via `beforeinstallprompt` where supported; iOS guided overlay where not.
- `<HiveFirstVisitExplainer />` — under-CTA one-line explainer; auto-dismissed on first successful primary action.
- `<HiveAHTSPrompt />` — Add-to-Home-Screen card mounted after first successful primary action.
- `<AppInstalledToast />` — engine-local layout toast.
- 7-locale catalog ships with the package; engine-specific copy passed via `customMessage` props.
- `localStorage` keys: `hive_<feature>_<enginename>` (e.g. `hive_demo_parkback`, `hive_welcomed_parkback`).

### C7. Auto-Demo scripts — required for engines with a chat surface
- Typewriter types a real example, pre-written AI response appears, fades after 8s.
- `localStorage: hive_demo_<enginename>`.
- Canonical scripts for HiveBodyLog, HiveField, HiveClarity, HiveStrength remain in `docs/auto-demo-scripts.md` (or this file's history). Don't paraphrase — these were tuned for medical/coaching domain accuracy.

### C8. Plain-language user-voice phrasing
All user-facing button labels and headings must use plain-language user-voice phrasing, not app-voice technical shorthand. Avoid metaphors that don't translate (e.g. "drop pin"). Reviewers ask: would a non-tech-fluent user in any language understand this label without explanation?

### C9. Standard engine rules
- Never make up facts when using real data — cite source visibly: "Data: [Source], updated [frequency]".
- Health engines: "This is not medical advice. Always consult a qualified clinician."
- Legal engines: "This is not legal advice. Always consult a qualified solicitor or attorney."
- Every engine page footer: "No ads. No investors. No agenda."
- Global Intelligence Engine citation: `Data sources: [list]. Analysis: Hive Clarity Substrate. Retrieved: [date].`
- No cookies beyond session auth. No PII storage. No GA / Hotjar / Segment.
- Analytics: Plausible cloud, Umami self-hosted, or homemade Neon counter.

### C10. Standard new engine pattern
- Next.js + TypeScript, Anthropic SDK (`claude-opus-4-5` for primary models; `claude-haiku-4-5-20251001` for safety scans / classification).
- Tailwind CSS (check `package.json` — not universal).
- Deploy to Vercel; domain `enginename.hive.baby`; Cloudflare CNAME → `cname.vercel-dns.com`.
- `ANTHROPIC_API_KEY` in Vercel env vars (Production scope).
- Vercel Deployment Protection: **OFF** (else every visitor sees an SSO gate).
- Free tier forever; paid features via Stripe where appropriate.
- Full onboarding stack via `@hive/onboarding`.
- ENGINE_GRAMMAR.md at engine root with canonical YAML frontmatter (see §E).
- Repo location: subdir of `apps/` inside `hivebaby`, OR a standalone repo with the standalone reason recorded in `ENGINE_GRAMMAR.md`.

### C11. Cloudflare DNS
- `CF_API_TOKEN` in Codespace secrets (use `$CF_API_TOKEN`).
- `CLOUDFLARE_ZONE_ID`: `bcb5522993ecf90a4f1d5dfe101e5a5c` (hive.baby zone — verified).
- Add CNAME pattern:
```sh
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/bcb5522993ecf90a4f1d5dfe101e5a5c/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"type":"CNAME","name":"SUBDOMAIN","content":"cname.vercel-dns.com","ttl":1,"proxied":false}'
```

### C12. Email routing — `hive@hive.baby`
Solved via Cloudflare Email Worker (`hive-email-router`). No MX record needed.
- Forwards every inbound email to `saggarsonny@gmail.com`.
- Simultaneously POSTs to `support.hive.baby/api/inbound` (HiveAdminSupport webhook).
- Both Gmail delivery and HiveAdminSupport logging confirmed working.

### C13. Canonical secret names — use these names, never variants
These are **the names CC must use** in code, env vars, GitHub Actions secrets, and Vercel project env vars. If an existing engine uses a variant, migrate it; don't propagate the variant.

```
ANTHROPIC_API_KEY      Anthropic API key
CF_TOKEN               Cloudflare API token (account scope)
CF_API_TOKEN           Cloudflare API token (zone scope, hive.baby)
CF_ZONE                Cloudflare zone ID (= bcb5522993ecf90a4f1d5dfe101e5a5c)
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

Engine-specific Stripe price IDs follow `STRIPE_PRICE_<TIER>_<INTERVAL>` (e.g. `STRIPE_PRICE_PLUS_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL`). See [Constitution §II](docs/HIVE_CONSTITUTION.md#canonical-secret-names) for full list + rationale + the v0.3 HiveOps rule that will compare an engine's `env_vars_required` against these canonical names.

### C14. Cost profiles — declare in ENGINE_GRAMMAR.md
Every engine declares `cost_profile` in its frontmatter under one of `zero_marginal | low_marginal | medium_marginal | high_marginal`. The profile drives the free-tier rules in §A. HiveOps will eventually enforce that the declared profile matches the engine's actual rate-limit implementation (v0.3 candidate, see [Constitution §III](docs/HIVE_CONSTITUTION.md#iii-pricing-and-cost-profiles)).

### C15. Production copy hygiene
- **No "coming soon" / "not yet" / "TODO"** placeholders in production user-facing copy. Hide absent features rather than advertise them as inactive (the bait-and-switch UX is worse than absence — see [Constitution §VII](docs/HIVE_CONSTITUTION.md#coming-soon-labels-in-production--bait-and-switch-ux) on UD Converter PR #11). v0.3 of HiveOps will grep `app/**/*.tsx` for these tokens and fail.
- **No third-party analytics** (GA, Hotjar, Segment, Mixpanel). Plausible cloud / Umami self-hosted / homemade Neon counter only.
- **Cite real sources visibly** when displaying third-party data; never fabricate.

---

## D. PER-ENGINE INVENTORY

Status legend: **LIVE** (in production, listed) · **BUILDING** (in active dev) · **IN PROGRESS** (paused). `cost_profile` is the engine's marginal cost class (`zero` · `low_marginal` · `medium_marginal` · `high_marginal`). `audit` is the latest HiveOps verdict (where applicable).

### Hive ecosystem (deployed)

| Repo / Path | Engine | Domain | Status | Stack | cost_profile | Audit |
|---|---|---|---|---|---|---|
| hivebaby | — (planet) | hive.baby | LIVE | Static HTML | zero | manual |
| hive-moon | HiveMoon | hivemoon.hive.baby | LIVE | Next.js (client-only) | zero | manual |
| hive-field | HiveField | hivefield.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hive-clock | HiveClock | hiveclock.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hive-clarity | HiveClarity | hiveclarity.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hive-strength-mastery | HiveStrength | hivestrength.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hive-body-log | HiveBodyLog | hivebodylog.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hive-engine-builder | HiveEngineBuilder | hiveenginebuilder.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| queen-bee | QueenBee | queenbee.hive.baby | IN PROGRESS | Next.js + Anthropic | medium_marginal | manual |
| creator-console | HiveCreatorConsole | creatorconsole.hive.baby | LIVE | Next.js | low_marginal | manual |
| secret-box | HiveSecretBox | secretbox.hive.baby | LIVE | Next.js | low_marginal | manual |
| whotextedme | WhoTextedMe | whotextedme.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hive-support | HiveAdminSupport | support.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hive-hivememe | HiveMeme | hivememe.hive.baby | BUILDING | Next.js + Anthropic | medium_marginal | manual |
| hive-hivephoto | HivePhoto | hivephoto.hive.baby | LIVE | Next.js + Anthropic + Clerk + Neon + R2 + Stripe | high_marginal | manual |
| hive-aestheticbestie | HiveAestheticBestie | hiveaestheticbestie.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | HiveOps **PASS** (canonical migration #119, 2026-05-08) |
| hive-microritual | HiveMicroRitual | hivemicroritual.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hive-memory-space | HiveMemorySpace | hivememoryspace.hive.baby | BUILDING | Next.js + Anthropic | medium_marginal | manual |
| sovereign-arbitrage | SovereignArbitrage | sovereignarbitrage.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| ud-inc | UniversalDocumentInc | universaldocument.hive.baby | LIVE | Next.js + Tailwind | low_marginal | manual |
| hivebaby/hive-imr | HiveIMR | hiveimr.hive.baby | LIVE | Next.js + Anthropic + Neon | medium_marginal | HiveOps **PASS** (canonical migration #122, 2026-05-08) |
| hivebaby/imgtrainer | IMGTrainer | imgtrainer.hive.baby | LIVE | Next.js + Anthropic | medium_marginal | manual |
| hivebaby/apps/hive-plainscan | HivePlainScan | plainscan.hive.baby | BUILDING | Next.js + Anthropic | medium_marginal | grammar pending canonical migration |
| hivebaby/apps/parkback | ParkBack | parkback.hive.baby | LIVE | Next.js (client-only PWA) | zero | HiveOps **pass with waivers** (V01/V18/V19 waived — see ENGINE_GRAMMAR.md) |
| hivebaby/apps/hive-activity-partner | HiveActivityPartner | activitypartner.hive.baby | BUILDING (Phase 1/6) | Next.js + Clerk + Neon + Anthropic + Stripe + Resend | medium_marginal | HiveOps Phase-1 with waivers (V18/V19) |

### Universal Document ecosystem

| Repo / Path | Engine | Domain | Status | Stack |
|---|---|---|---|---|
| universal-document/apps/landing | UniversalDocument | ud.hive.baby | LIVE | Next.js |
| universal-document/apps/converter | UDConverter | converter.hive.baby | LIVE | Next.js + Anthropic |
| universal-document/apps/creator | UDCreator | creator.hive.baby | LIVE | Next.js + Anthropic |
| universal-document/apps/reader | UDReader | reader.hive.baby | LIVE | Next.js |
| universal-document/apps/validator | UDValidator | validator.hive.baby | LIVE | Next.js |
| universal-document/apps/utilities | UDUtilities | utilities.hive.baby | LIVE | Next.js + Anthropic |
| universal-document/apps/signer | UDSigner | signer.hive.baby | LIVE | Next.js |

### Vercel deploy hooks (frequently used)
- **hivebaby:** `curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Mj8SJS4gAlrG2PCXdUCUMmoAQAA3/CfgdTZ1r50"`
- **hive-body-log:** `curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_ZhRnfMdAJWuBxEKJWHooR6MlfDMc/RqzslhTGkA"`
- **hive-moon:** `cd /workspaces/hive-moon && npx vercel --prod --yes` (project ID: `prj_UZ75MoGAgd3dKAFUkI5XKLybATl2`)
- Vercel account: `saggarsonny-3909s-projects` (Hobby).

### GitHub
- Token: stored in Codespace secret.
- Account: `saggarsonny-boop`.

---

## E. PROCESS GOVERNANCE — HiveOps & HiveFinalize

### E1. The two-tool pipeline
- **HiveOps** (`tools/hive-ops/`) — pre-PR enforcement gate. Runs filesystem checks (H-rules) and manifest schema validation (V-rules) in a single audit. Wired into `.github/workflows/hive-ops.yml`; failing verdicts block merge.
- **HiveFinalize** (`tools/hive-finalize/`) — pre-ship Foreman gate. Runs the 29-rule manifest schema validator (V01..V29) plus the operational launch checklist (DNS, SEO, backup, planet placement, env vars, health endpoint, fleet registration). Continuous post-launch monitoring is **not** HiveFinalize's job — that belongs to a future Compliance Monitor.

As of HiveOps v0.2 the audit is unified: a single CLI invocation runs both H-rules and V-rules, sharing the same override schema.

### E2. ENGINE_GRAMMAR.md — canonical schema
Every engine ships exactly one `ENGINE_GRAMMAR.md` at its repo root (or sub-package root for monorepo-nested engines), in two parts in fixed order:

1. **YAML frontmatter** between `---` fences — all structured, machine-readable fields. HiveFinalize parses this directly.
2. **Markdown prose** below — `## Purpose`, `## Inputs`, `## Outputs` (required); `## Rules`, `## Safety Templates`, `## Premium Locks` (required when `premium: true`), `## Phase Plan`, `## Out of Scope`, `## Deployment Notes` (conditional).

The legacy `<GrapplerHook>` HTML-ish block is **retired**. Migrate any remaining engines (HivePlainScan still uses the legacy form). Full schema in `docs/specs/manifest-schema-final.md`.

Required frontmatter fields include: `engine`, `id`, `domain`, `repo`, `owner`, `version`, `status`, `tier`, `schema`, `stack`, `premium`, `governance`, `safety`, `multilingual`, `onboarding_stack`, `vercel_project`, `deployment_protection`, `visibility`, `commercial_surface`, `viral_loop_targets`, `production_state`, `last_audit_at`. When `status: live`, `launch_checklist_state` (8 booleans) is also required.

### E3. HiveOps rules — H-rules (filesystem)
**28 rules · 26 MANDATORY · 2 RECOMMENDED.** Categories: CORE_BUILD, INTERNATIONALIZATION, SEO, FIRST_USE_ONBOARDING, HIVE_INTEGRATION, VISIBILITY_SURFACES, DESIGN_CONSISTENCY, ADOPTION_AMPLIFIERS, OPERATIONAL. Full list in `tools/hive-ops/README.md`. Highlights:

- **H05** — all 7 canonical free-tier locales present.
- **H13** — `public/hive-logo-full.png` copied from `@hive/onboarding`.
- **H14** — "Made with ♥ in the Hive" rendered.
- **H15** — full canonical favicon set.
- **H16** — `#D4AF37` in metadata + manifest.
- **H18** — `manifest.json` has all canonical fields.
- **H19** — `ENGINE_GRAMMAR.md` present with frontmatter.
- **H21** — engine entry in `hivebaby` planet `ENGINES` array.
- **H01** is `unwaivable: true`. Any other rule may be overridden via the schema in §E5.

### E4. HiveFinalize rules — V-rules (manifest schema)
**29 rules · V01..V29.** Validate the YAML frontmatter against §4 of the schema. Re-exposed by HiveOps under zero-padded IDs (V01..V29). Examples:
- V01 — engine name follows `Hive*` / `UD*` PascalCase prefix (with carved exceptions).
- V18 — onboarding stack items are `implemented` / `pending` / `n/a`; `pending` items are flagged.
- V19 — `launch_checklist_state` booleans all true when `production_state: listed`.

Cross-manifest checks (V5 uniqueness, V24 cross-engine references) and network checks (V6 GitHub repo, V28 Vercel env, V29 health endpoint) are stubbed `skip` until the cross-manifest loader and credential plumbing land in v0.3.

### E5. Override schema — when a rule legitimately can't apply
Add a YAML block to the engine's `ENGINE_GRAMMAR.md`:

```markdown
## Hive-Ops Overrides

```yaml
overrides:
  - rule: H08
    mode: warn
    reason: "OG image generator broken; fix tracked in workflow X. Will be regenerated this week."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/123
    reviewer: Sonny
    date: 2026-05-06
    warn_until: 2026-05-13   # 7 days default; 30 days max from `date`
  - rule: H21
    mode: waive
    reason: "Internal-only engine; never appears on the planet."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/124
    reviewer: Sonny
    date: 2026-05-06
```
```

**Validation rules:**
- `rule, mode, reason, issue, reviewer, date` are all REQUIRED for every entry.
- `mode` must be exactly `warn` or `waive`.
- `date` must be `YYYY-MM-DD`.
- `issue` must be `https://github.com/<owner>/<repo>/issues/<n>`.
- For `mode: warn`: `warn_until` is REQUIRED (defaults to date + 7 days), must be ≤ 30 days after `date`. When in the past, the warn lapses and the rule fires `fail` again.
- `mode: waive` ignores `warn_until`.
- Unknown rule IDs and duplicate entries are parse errors.
- Rules marked `unwaivable: true` (H01) reject any override.

### E6. Warn-mode philosophy
Warn-mode exists for one reason: an engine that's mostly ready can ship while a single legitimate fix is in flight. It is **not** a long-term hiding place. The 30-day hard ceiling guarantees today's warn becomes tomorrow's fail without anyone having to remember.

If a rule needs more than 30 days of cover, that's not warn territory — it's either a `waive` (with documented reason and reviewer) if the rule legitimately doesn't apply, OR a change to the rule itself in `tools/hive-ops/rules.ts` if it's systematically wrong.

### E7. Engine-class profiles (HiveOps v0.2)
Engines declare `engine_class` in `ENGINE_GRAMMAR.md` frontmatter. Defaults to `nextjs` if absent.

| Class | When to use | Effect |
|---|---|---|
| `nextjs` | Next.js app-router engine (canonical default) | All H-rules apply |
| `static-html` | Plain HTML/JS (e.g. hivebaby planet front door) | Skips H02, H07, H16, H17, H24, H25 |
| `api-only` | Backend-only engine, no public UI | Skips visual-surface rules (H08, H11, H12, H13, H14, H15, H22, H23, H25) |
| `hybrid` | Mixed Next.js + extra concerns | All H-rules apply (no exemptions — the safe choice) |

V-rules apply to every engine class — schema is engine-class-agnostic. Applicability matrix in `tools/hive-ops/applicability.ts`. Non-applicable rules report status `n/a` and don't count toward the verdict.

### E8. Override scaffolding — `--write-overrides`
When the audit fails:
```sh
# Review mode — print proposed entries to stdout; nothing written.
tsx tools/hive-ops/cli.ts <slug> --write-overrides

# Apply mode — splice entries into ENGINE_GRAMMAR.md.
tsx tools/hive-ops/cli.ts <slug> --write-overrides --apply

# Customize warn horizon (default 7d, max 30) and reviewer name.
tsx tools/hive-ops/cli.ts <slug> --write-overrides --apply --warn-days 14 --reviewer Sonny
```

Each proposal defaults to `mode: warn` with 7-day `warn_until`. `reason` and `issue` ship as **TODO placeholders** — fill them in before committing. `--apply` is idempotent: rules with existing overrides are skipped. CLI exits 0 in `--apply` mode (the operator's intent is to scaffold, not to gate).

### E9. Running HiveOps locally
```sh
tsx tools/hive-ops/cli.ts <engine-slug>
tsx tools/hive-ops/cli.ts <engine-slug> --json | jq .
tsx tools/hive-ops/cli.ts ud-converter --repo /path/to/universal-document   # outside hivebaby
```
Exit codes: `0` pass-or-warn, `1` fail, `2` tooling error.

### E10. Engine launch checklist — the operational source
`docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md` is the single canonical source. Every engine reads it. When asked to build or finalize an engine, **read that checklist first**. Items not yet enforced by HiveOps (real-device tests, network reachability, third-party integrations) remain manual review items — do not assume they're done.

### E11. Canonical registries
Update at the same time you check checklist items:
- `engines.json` — machine-readable canonical registry.
- `registry/engines.md` — human-readable ledger.
- `registry/dns-inventory.md` — DNS rows with live status + registered date.
- `registry/billing-reconciliation.md` — monthly COGS estimate.
- `docs/engine-archives/<engine-slug>/` — archived spec (`ENGINE_GRAMMAR.md`, `README.md`, `test-station-slot.md`).

---

## F. hive.baby PLANET — THE FRONT DOOR

Three.js 3D planet. Each hexagon cell = one Hive engine.
- Real Earth: NASA GIBS satellite + cloud imagery (updates every 6 hours).
- Real stars: HYG database, correct positions and magnitudes, 88 IAU constellation lines.
- Real moon: position and phase from astronomical algorithms; moves in real time.
- ISS: live TLE position from CelesTrak; moving point with label.
- Live engines: glow gold with pulse animation. Coming soon: faded grey. Empty cells: random 3-letter codes.
- Planet spins; drag/zoom/pinch supported.
- Zooming into a gold cell triggers fly-through animation then navigation.
- Breathing planet: 0.2% scale pulse every 4 seconds.
- Day/night terminator: real sun position, city lights on night side.
- Fuzzy natural-language search → routes to the correct engine.
- Patronage cell: deep amber/copper, slower pulse, "Support Hive" on hover, links to `/patrons`.

### Planet Stage 1 (current build — all items must be complete)
1. Real Earth with NASA GIBS cloud imagery.
2. Real star field with HYG + 88 IAU constellation lines.
3. Real moon position and phase (no API).
4. Real ISS position from CelesTrak TLE.
5. Zoom fly-through animation on engine click.
6. Breathing planet (0.2% scale pulse, 4s).
7. Day/night terminator + city lights.
8. Patronage cell (amber/copper).

### Build priority order
1. hive.baby planet Stage 1
2. Patronage cell + `/patrons.html`
3. First-visit guided orbit (post-welcome)
4. Auto-demo for live engines
5. Queen Bee
6. Universal Document / UD
7. Gary Gansson + HiveTV
8. Additional engines per VISION.md

---

## G. UD DESIGN SYSTEM — GOVERNANCE RULE (hard, no exceptions)

All UD tools, engines, apps, and commensals use the UD Design System. Enforced at the ENGINE_GRAMMAR level; any deviation is corrected before merge.

### Typography
| Role | Font |
|---|---|
| Headings | Playfair Display |
| Body | DM Sans |
| Labels / meta / code | DM Mono |

### Color palette (UD)
| Token | Hex | Use |
|---|---|---|
| Ink | `#1e2d3d` | Primary text, nav, dark backgrounds |
| Paper | `#fafaf8` | Page background |
| Gold | `#c8960a` | CTAs, accents, brand highlights |
| Paper-2 | `#f2f1ee` | Alternate section backgrounds |
| Border | `#e0ddd6` | Dividers, card borders |
| Muted | `#6b7280` | Secondary text, placeholders |

> **Note:** UD uses gold `#c8960a`. Hive uses gold `#D4AF37`. Don't cross the streams. UD properties: UD palette. Hive engines: Hive palette.

### Border radius
- Standard elements: `8px`
- Cards: `12px`

### File type icons
- **UDR** — light blue (`#93c5fd`), file-shape, "UDR" + "UNIVERSAL DOCUMENT™" wordmark below.
- **UDS** — dark navy (`#1e2d3d`), file-shape, "UDS" + "UNIVERSAL DOCUMENT™" wordmark below.
- Icon files at `/public/icons/udr.svg` and `/public/icons/uds.svg` in each UD repo.

### Scope — applies without exception to:
UD Reader · UD Converter · UD Creator · UD Validator · UD Utilities · UD Signer · every future UD tool.

---

## H. UNIVERSAL DOCUMENT™ — TRADEMARK & SECONDARY MEANING PROTOCOL

Universal Document™ is a pending trademark (Serial 99774346, filed 2026-04-20). Always use the ™ symbol after "Universal Document" in all Hive properties and documents.

### Permanent standing instruction — apply in ALL content

On first use of "Universal Document" in any piece:
→ Write as: **Universal Document™ (UD)**

On first use of "UD" as an abbreviation in any piece:
→ Write as: **UD (Universal Document™)**

The ™ is always superscripted directly after the word "Document" — not after UD, not at the end of the phrase.

On subsequent uses in the same piece:
- Universal Document™ or UD — either is fine.
- ™ on every instance of "Universal Document".
- No ™ needed on standalone "UD".

### UDR / UDS expansions
- **UDR** = Universal Document™ Revisable (also: Reviewable).
- **UDS** = Universal Document™ Sealed (also: Secure).

### Applies to:
All blog posts, Medium articles, LinkedIn content, white papers, sectoral briefs, product UIs, nav elements, emails from HiveAdminSupport, press releases, documentation, and any public-facing content. No exceptions. Overrides any previous naming guidance.

---

## I. CONSULTING FRAMEWORK — PERMANENT REFERENCE

### Sonny is available for consulting in:
- Document infrastructure strategy
- AI readiness and governance
- Digital health document governance
- Universal Document™ (UD) implementation advice
- Clinical AI evaluation

### Sonny is NOT available for:
- Non-compete arrangements of any kind
- Engagements that conflict with Universal Document Incorporated or The Hive
- Helping organisations build competing document format standards

### Standard disclosure for all consulting enquiries:
> "I have an existing relationship with Universal Document Incorporated and The Hive ecosystem. I am not available for engagements that create conflicts with that relationship. I cannot sign a non-compete. NDAs covering client-specific information learned during the engagement are acceptable. I disclose this upfront so we can assess fit before investing time on either side."

### Fee structure
- Day rate: £2,000–5,000 depending on engagement.
- Project fees: scoped and agreed in advance.
- Long-term arrangements: equity or revenue share for engagements that produce ongoing value.
- All commercial arrangements through Universal Document Incorporated or a separate consulting vehicle.

### HiveAdminSupport behaviour for consulting enquiries
- Acknowledge warmly — flag immediately (keywords: "consult", "advisory", "engagement", "retainer").
- Do **not** auto-respond with pricing.
- Route to Sonny for personal response within 24 hours.

### Credentials
- Medium articles Part 1 and Part 2 are the primary consulting credential documents.
- White paper at `universaldocument.hive.baby` is the secondary credential.

---

## J. LESSONS LEARNED — DO NOT REPEAT

These are mistakes Claude has made in past sessions. They are recorded so future sessions don't relearn them at Sonny's cost.

### J1. Don't direct-push to `main` "because it's just an ops workflow"
**What happened:** Direct-pushed `heb-verify-refine.yml`, `hive-engine-i18n-generate.yml`, and a verify-retry to main. Also added `parkback-i18n-generate.yml` as scope expansion when blocked from running the Anthropic API locally.
**Lesson:** §B1. Every change goes through a PR, including ops/diagnostic workflows. Auto-merge on green CI is fine; the PR step is non-negotiable.

### J2. Don't invent infrastructure to route around a sandbox blocker
**What happened:** Local Anthropic key handling was sandbox-blocked, so I built a one-shot ops workflow to translate locale files instead of surfacing the blocker.
**Lesson:** §B2. Surface the blocker, wait for direction. Inventing tooling to bypass a sandbox is scope expansion in disguise.

### J3. Don't guess at locale sets — anchor to shipped code
**What happened:** Initial guess of canonical free-tier locales was `en/es/fr/de/pt/zh/ar` (with German, no Hindi). The actually-shipped HiveBodyLog `lib/i18n.ts` set was `en/es/fr/ar/hi/zh/pt`. The doc said "match UD Converter" but UD Converter shipped no locales until 2026-05-06, so the doc pointed at nothing real.
**Lesson:** §C2. Canonical free-tier set is `en, es, fr, ar, hi, zh, pt`. When a doc references something, verify it actually exists. When two engines disagree, anchor to the one that actually shipped.

### J4. Don't assume infrastructure doesn't exist — search first
**What happened:** Repeatedly declared shared components "not present" before searching the repo. They were already in `@hive/onboarding`.
**Lesson:** §B5. Much of the Hive infrastructure already exists. Search before deferring. Run `grep -r` before declaring "needs to be built".

### J5. Don't fix Vercel deploys without reading build logs
**What happened:** Guessed at root cause of failed deploys, made the wrong fix, burned a deploy cycle.
**Lesson:** §B3. Always pull build logs first. The logs say what broke. Acting before reading them is wrong on average.

### J6. The "small commit" exception doesn't exist
**What happened:** Recurring temptation to skip the PR for one-line fixes, YAML-only changes, or "obviously safe" updates.
**Lesson:** §B1. There is no carve-out. The PR step exists for review-window auditability, not just safety.

### J7. Don't paraphrase the auto-demo scripts
**What happened:** Tempted to "tighten" or "improve" the canonical Auto-Demo scripts (HiveBodyLog, HiveField, HiveClarity, HiveStrength) when generating new engines.
**Lesson:** §C7. These were tuned for medical/coaching domain accuracy. Use them verbatim. Variants for new engines need explicit Sonny review.

### J8. Don't mix Hive gold and UD gold
**What happened:** Easy to use `#c8960a` (UD gold) on a Hive engine or `#D4AF37` (Hive gold) on a UD property.
**Lesson:** §C3, §G. Hive engines: `#D4AF37`. UD properties: `#c8960a`. HiveOps H16 enforces `#D4AF37` on Hive engines.

### J9. Don't introduce non-canonical accent colors at the metadata layer
**What happened:** Engine-specific accent colors leaking into `metadata.themeColor`, fragmenting the address-bar tint across engines.
**Lesson:** §C5. `metadata.themeColor` and `manifest.theme_color` are exactly `#D4AF37`. Engine-specific accents stay in component styles.

### J10. "I'll add a quick helper workflow" is scope creep
**What happened:** Adding new workflows mid-task to make the requested work easier, without flagging.
**Lesson:** §B2. Surface the blocker. Don't pre-decide what tooling Sonny needs.

---

## K. HOW TO WORK ACROSS REPOS

Use the GitHub API + token to read/write/commit to any repo. Codespace secret holds the token.

After any hivebaby change merges to main, trigger the Vercel deploy hook in §D.

For engine work in a non-hivebaby repo, clone via the token and follow the same PR workflow there. PR-based merge applies to every Hive repo, not just hivebaby.

---

## L. ENGINE LAUNCH CHECKLIST

See **[`docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md`](docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md)**. Every engine ships only when every MANDATORY item is checked or explicitly waived in the engine's `ENGINE_GRAMMAR.md` `## Hive-Ops Overrides` block.

This rule applies to ALL engines across ALL Hive properties. No engine launches without completing this checklist.
