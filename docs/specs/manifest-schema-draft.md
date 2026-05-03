# Hive Engine Manifest Schema — Draft

Status: superseded. The three open questions in §4 have been
resolved by Sonny (2026-05-03). The locked schema lives in
`docs/specs/manifest-schema-final.md`. This draft is preserved for
provenance — sections 1–3 still describe the survey of today's
state. Refer to the final document for the canonical schema.

Derived from a survey of the existing `ENGINE_GRAMMAR.md` files in
this monorepo. Goal: formalise what engines already declare, expose
what is inconsistent, and name the fields HiveFinalize and
HiveProductionList will need to read.

## Sources surveyed

This draft is derived from reading the following six files in full:

1. `/Users/sonnyneo/hivebaby/ENGINE_GRAMMAR.md` (root — `HivePlanet`)
2. `/Users/sonnyneo/hivebaby/imgtrainer/ENGINE_GRAMMAR.md` (`HiveIMGTrainer`, building, premium)
3. `/Users/sonnyneo/hivebaby/hive-hivephoto/ENGINE_GRAMMAR.md` (`HivePhoto`, Tier 2 building, premium)
4. `/Users/sonnyneo/hivebaby/hive-imr/ENGINE_GRAMMAR.md` (`HiveIMR`, Tier 1 live)
5. `/Users/sonnyneo/hivebaby/hive-aestheticbestie/ENGINE_GRAMMAR.md` (`HiveAestheticBestie`, Tier 1 live)
6. `/Users/sonnyneo/hivebaby/apps/hive-plainscan/ENGINE_GRAMMAR.md` (`HivePlainScan`, Tier 1 building)

There are no UD-engine `ENGINE_GRAMMAR.md` files in this monorepo —
the `universal-document/` directory is empty here; the real UD apps
live in a separate repo. UD engines are therefore not represented in
this survey, and the schema may need a second pass once at least one
UD `ENGINE_GRAMMAR.md` is checked in.

---

## 1. Canonical fields

The fields below are the union of what is currently declared across
the six surveyed files, plus a small set of additions explicitly
called out in section 4 as required for HiveFinalize and
HiveProductionList. No field is invented for hypothetical future
needs.

The manifest is the `<GrapplerHook>` YAML-ish block at the top of
each `ENGINE_GRAMMAR.md`, plus the structured sections in the
markdown body that every file already follows.

### 1.1 Identity

| Field | Type | Required | Meaning | Example (real engine) |
|---|---|---|---|---|
| `engine` | string, PascalCase, `Hive*` or `UD*` prefix | required | Canonical engine name. Matches the name used in CLAUDE.md repo table and on the planet. | `HiveIMR` (hive-imr) |
| `id` | string, lowercase, no separators | required | Stable machine identifier. Used as the `localStorage` key root and as a join key for HiveProductionList. | `hiveimr` (hive-imr) |
| `name_display` | string | optional | Human-readable display name when it differs from `engine`. | `IMGTrainer` (imgtrainer — markdown body uses this; `engine` is `HiveIMGTrainer`) |
| `domain` | string, lowercase, `*.hive.baby` | required | Production domain. | `hiveimr.hive.baby` (hive-imr) |
| `domain_aliases` | array of string | optional | Additional domains that point to the same surface. | `["scan.hive.baby"]` (hive-plainscan declares `plainscan.hive.baby (alias: scan.hive.baby)`) |
| `repo` | string, `org/repo` form, may include subdir | required | Source repo. Subdir form used when an engine lives inside the hivebaby monorepo. | `saggarsonny-boop/hivebaby (subdir hive-imr/)` (hive-imr) |
| `purpose` | string, one paragraph | required | One-paragraph statement of what the engine is for. Lives in the `## Purpose` section of the markdown body. | "The post-EMR substrate. EMRs were built for billing; the IMR is built for care." (hive-imr) |

### 1.2 Classification

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `version` | string, semver | required | Manifest/engine version. | `0.1.0` (hive-imr); `1.0.0` (hivephoto, root planet) |
| `status` | enum: `live` \| `building` \| `planned` \| `deprecated` | required | Lifecycle state. Today only `live` and `building` appear; `planned` and `deprecated` are added because CLAUDE.md and the planet already model both ("Coming soon: faded grey", build-priority queue, etc.). | `live` (hive-imr); `building` (hive-plainscan, hivephoto, imgtrainer) |
| `tier` | integer, 1 or 2 (3 reserved) | required | Investment tier. Tier 1 is base; Tier 2 is engines with paid storage / external services (e.g. HivePhoto). | `1` (hive-imr, aestheticbestie, plainscan); `2` (hivephoto) |
| `schema` | string, kebab-case | required | Domain schema descriptor — the kind of work the engine does. | `intelligent-medical-records` (hive-imr); `photo-intelligence` (hivephoto); `radiology-report-explanation` (plainscan); `aesthetic-identity` (aestheticbestie) |
| `stack` | array of string, lowercase tokens | required | Tech stack tokens. | `[nextjs, typescript, tailwind, clerk, neon, r2, anthropic, stripe]` (hivephoto) |
| `premium` | boolean | required | Whether the engine has any paid surface at all. | `true` (hivephoto, imgtrainer); `false` (hive-imr, aestheticbestie, plainscan, root planet) |

### 1.3 Governance

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `governance` | string, dotted reference | required | Governance authority. Today every engine declares the same value, parked as a forward reference until Queen Bee ships. | `QueenBee.MasterGrappler` (all six) |
| `governance_status` | enum: `pending` \| `remote` \| `enforced` | optional | Whether governance is declarative-only (`pending`), pointed at a deployed Queen Bee but not yet enforced (`remote`), or actually enforced in code (`enforced`). Today `pending` and `remote` both appear in the body text and are used inconsistently. | `(pending)` (root planet, imgtrainer); `(remote)` (hivephoto, hive-imr, aestheticbestie, plainscan) |
| `safety` | enum: `enabled` \| `standard` \| `disabled` | required | Safety posture flag. | `enabled` (5 engines); `standard` (hivephoto) |
| `safety_level` | string | optional | Body-text refinement of `safety` when the engine has a domain-specific safety regime. Sometimes matches `safety`, sometimes does not. | `medical-educational` (imgtrainer body, while block declares `enabled`); `standard` (hivephoto, matches block) |
| `tone` | string | optional | Voice/tone constraint. Free-text today. | `clinical, precise, role-aware` (hive-imr); `warm, plain, calm, factual` (plainscan) |
| `rules` | array of string | optional | Hard rules the engine must follow. Section name varies — see inconsistencies below. | `Patient data never leaves the server unencrypted` (hive-imr `## Rules`); `owner_check: photo.user_id === clerk.userId on every request` (hivephoto `## GrapplerHook Rules`) |
| `safety_templates` | array of string | optional | Standing safety/disclaimer templates for UI and AI output. | `Health disclaimer in footer: "This is not medical advice. Always consult a qualified clinician."` (imgtrainer) |
| `multilingual` | enum: `pending` \| `enabled` \| `n/a` | required | Multilingual ribbon status. Today every surveyed engine declares `pending`. | `pending` (all six) |

### 1.4 Operational

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `inputs` | array of string | required | What the engine accepts from users. | `Pasted text from a finalized radiology report` (plainscan) |
| `outputs` | array of string | required | What the engine produces. | `Plain-English summary at 6th to 8th grade reading level` (plainscan) |
| `api_models` | array of `{role, model_id}` | required for engines that call an LLM | LLM model strings actually called, plus what role each plays. Today this lives as a free-text `## API Model Strings` section. | `[{role: "patient simulation", model_id: "claude-haiku-4-5-20251001"}, {role: "grading", model_id: "claude-sonnet-4-6"}]` (imgtrainer) |
| `env_vars_required` | array of string | required for any engine with secrets | Production env vars that must be present in Vercel. Today free-text under `## Deployment Notes`. | `[ANTHROPIC_API_KEY, DATABASE_URL, SESSION_SECRET, NODE_ENV]` (hive-imr) |
| `health_check` | string, HTTP path | optional | Health endpoint. Must exist per CLAUDE.md launch checklist (item 6). | `GET /api/health` (hive-imr, plainscan) |
| `onboarding_stack` | object: `{auto_demo, first_visit_card, tooltip_tour, rotating_placeholders}`, each `implemented \| pending \| n/a` | required | The four-part onboarding stack required by CLAUDE.md. Today expressed as bullets in `## Onboarding Stack`. Only some files declare it. | `{auto_demo: pending, first_visit_card: pending, tooltip_tour: pending, rotating_placeholders: implemented}` (plainscan) |
| `premium_locks` | array of string | required when `premium: true` | What is gated and how. | `Two free cases per user lifetime; Three plans: $24/month recurring · $59 three-month one-time · $179/year recurring; 7-day grace on invoice.payment_failed; 90-day lazy expiry on three-month one-time` (imgtrainer) |
| `phase_plan` | array of `{n, label, done}` | optional | Numbered phase plan — present on engines actively building. | `[1: Scaffold (done); 2: Vercel + DNS; 3: test.hive.baby slot; ...]` (plainscan) |
| `out_of_scope` | array of string | optional | Explicit non-goals for the current phase. | `Stripe, Clerk, file storage, multi-tenant, HIPAA infrastructure, OCR for scanned PDFs` (plainscan) |

### 1.5 Build provenance / deployment

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `vercel_project` | string | required for Vercel-hosted engines | Vercel project name. | `imgtrainer` (imgtrainer); `hive-imr` (hive-imr) |
| `vercel_team` | string | optional | Vercel team slug. Defaults to `saggarsonny-3909s-projects` per CLAUDE.md. | `saggarsonny-3909s-projects` (imgtrainer) |
| `vercel_root_directory` | string | optional | Subdir within repo when the engine is monorepo-nested. | `hive-imr/` (hive-imr); `apps/hive-plainscan/` (plainscan) |
| `dns_pattern` | string, fixed shape | required | Cloudflare CNAME → `cname.vercel-dns.com`. Identical phrasing across every engine. | `Cloudflare CNAME → cname.vercel-dns.com` (all) |
| `deployment_protection` | enum: `on` \| `off` | required | Vercel Deployment Protection. CLAUDE.md mandates `off` for public engines. | `OFF` (hivephoto, hive-imr, aestheticbestie, plainscan) |
| `auto_deploy_branch` | string | optional | Branch that triggers prod auto-deploy. Defaults to `main`. | `main` (imgtrainer, hivephoto explicitly) |

---

## 2. What is currently inconsistent across engines

Observed by direct comparison of the six files. This is what the
canonical schema needs to fix or stop tolerating.

1. **Two manifest shapes coexist.** The "old" block has six fields:
   `engine, version, governance, safety, multilingual, premium`.
   The "new" block adds `id, status, tier, schema, stack`. The root
   `ENGINE_GRAMMAR.md` and `imgtrainer/ENGINE_GRAMMAR.md` use the
   old shape. The four other engines use the new shape. There is
   currently no version flag on the manifest itself to distinguish.

2. **`engine` vs display name disagree on `imgtrainer`.** The
   manifest declares `engine: HiveIMGTrainer`. The markdown body
   declares `Name: IMGTrainer`. CLAUDE.md does not list this engine
   in its repo/domain table at all, so the canonical name is
   ambiguous. No other engine has this split.

3. **Title separator inconsistent.** Files mix
   `# ENGINE GRAMMAR — <Name>` and `# ENGINE_GRAMMAR — <Name>`. Five
   engines use the space form; the imgtrainer file uses the
   underscore form.

4. **Rules section name varies.** `## Rules` (hive-imr,
   aestheticbestie, plainscan) vs `## GrapplerHook Rules`
   (hivephoto). `imgtrainer` has no rules section at all.

5. **`safety` vs `Safety level` can disagree.** `imgtrainer`
   declares `safety: enabled` in the block but
   `Safety level: medical-educational` in the body. Today these are
   two free-text fields; there is no rule that they must agree or
   that one derives from the other.

6. **`governance_status` is implicit and reads two different ways.**
   Body text uses `(pending)` (root, imgtrainer) and `(remote)`
   (hivephoto, hive-imr, aestheticbestie, plainscan) interchangeably,
   with no defined difference. There is no field for it in the
   manifest block.

7. **`Onboarding Stack` is missing on three of six files.** Root
   planet and hivephoto and imgtrainer omit it; hive-imr,
   aestheticbestie, and plainscan declare it. CLAUDE.md says the
   onboarding stack is required for every engine "no exceptions",
   so the missing declarations are non-conformant, not optional.

8. **`tier` is missing on the two old-shape files.** The root planet
   has no tier; `imgtrainer` has no tier. Every new-shape engine
   declares one.

9. **`stack` is duplicated and can drift.** It appears once in the
   manifest block as a token array and once in the markdown body as
   a free-text sentence. They can drift. `hivephoto` body says
   `Next.js + TypeScript + Tailwind + Clerk + Neon + R2 + Anthropic
   SDK + Stripe` while the block says
   `[nextjs, typescript, tailwind, clerk, neon, r2, anthropic, stripe]`
   — currently in sync, but nothing keeps them in sync.

10. **`api_models`, `env_vars_required`, and `health_check` are
    free-text bullets.** They are not parseable today. HiveFinalize
    and HiveProductionList both want these as structured arrays.

11. **`Out of Scope (Phase 1)` is a section in some engines
    (hive-imr, plainscan) but absent in others.** It is useful and
    worth keeping; it just needs to be a recognised optional
    section, not an ad-hoc one.

---

## 3. Gaps for HiveFinalize and HiveProductionList

These are fields that *are not* declared anywhere in the current
six files, but that HiveFinalize (the engine-launch finishing
pipeline) and HiveProductionList (the aggregated public list of
shipped engines) cannot work without. Each one is justified by an
existing piece of CLAUDE.md or by an existing operational pattern,
not by a hypothetical future need.

| Field | Type | Why it's needed |
|---|---|---|
| `visibility` | enum: `public` \| `internal` \| `private` | CLAUDE.md says "Vercel Deployment Protection must be OFF for public access" but never declares which engines are *meant* to be public. Today every engine implicitly assumes `public`. HiveProductionList needs this to know what to render; HiveFinalize needs this to know whether to add an entry to the planet surface. |
| `commercial_surface` | enum: `none` \| `donations` \| `freemium` \| `paid` \| `founding` | `premium` is binary today and cannot tell the difference between HivePhoto's founding-slot model, IMGTrainer's three-plan paid model, the donation-only Patronage cell, and the no-revenue free engines. HiveFinalize needs this to wire Stripe correctly; HiveProductionList needs it to show pricing badges. |
| `viral_loop_targets` | array of enum: `referral` \| `share_card` \| `embed` \| `pr_pickup` \| `community_post` | Build-priority order in CLAUDE.md (#3 first-visit guided orbit, #4 auto-demo) implies a deliberate growth surface but no engine declares which loops it actually exposes. HiveFinalize cannot finalise the launch checklist without knowing what to verify. |
| `launch_checklist_state` | object — one boolean per CLAUDE.md launch-checklist item | The "ENGINE LAUNCH CHECKLIST" in CLAUDE.md has eight numbered items (test.hive.baby slot, SEO `layout.tsx`, TooltipTour, planet/UDNav presence, env vars, `/api/health`, health-check workflow URL, engine-count update). No engine declares its progress against these items today. HiveFinalize is exactly the engine that walks this checklist; it needs a structured place to write the result. |
| `production_state` | enum: `not_listed` \| `listed` \| `featured` \| `archived` | HiveProductionList is, by definition, a list. It needs each engine to declare whether it should appear on it, and at what prominence. Different from `status` (which describes the engine itself); `production_state` describes the engine's relationship to the public list. |
| `finalize_artifacts` | array of `{type, path}` | HiveFinalize's job is to produce launch artefacts (sitemap entry, planet hex-cell config, test.hive.baby slot YAML, SEO metadata, health-check URL list entry). Each engine should declare which artefacts it has already produced or still owes. |
| `owner` | string, GitHub handle or email | CLAUDE.md treats Sonny as the implicit owner of every engine. Once contributors land (e.g. "Phase 8 owner: Sonny" appears in `hive-imr` body text), this needs to be a structured field so HiveProductionList can show maintainer info and HiveFinalize knows who to ping on a failed checklist item. |
| `last_audit_at` | ISO 8601 date string | Engines drift. HiveFinalize should refuse to mark an engine `live` if it has not been audited within some window (TBD). Today there is no audit timestamp anywhere. |

Two further fields are *almost* present but only as free text:

- `inputs` and `outputs` exist as bullet lists in every file. They
  should keep their current form but be recognised as the canonical
  parseable surface for HiveProductionList's "what does this engine
  do" card.
- `api_models` exists as `## API Model Strings` bullets. HiveFinalize
  needs to read it programmatically to verify that the model IDs
  declared still resolve against the Anthropic SDK at deploy time
  (per the working rule about checking Vercel build logs).

---

## 4. Open questions — RESOLVED 2026-05-03

All three calls were made by Sonny on 2026-05-03 and are now locked
in `docs/specs/manifest-schema-final.md`. Recorded here for
provenance.

1. **One file or two? — One file.** Keep one `ENGINE_GRAMMAR.md`
   per engine. Add structured YAML frontmatter at the top for
   machine-readable fields. Keep prose below for humans. Both
   audiences read the same file.

2. **Governance — versioned reference.** Engines declare governance
   as `QueenBee.MasterGrappler@v1`. When Queen Bee ships and
   updates, the version is bumped per-engine deliberately, never
   silently. Until Queen Bee ships, the version is `@pending`.

3. **Canonical source of truth — manifest union, then HPL.** The
   union of every `ENGINE_GRAMMAR.md` file in the monorepo plus
   any external engine repos is the source of truth for which
   engines exist. The CLAUDE.md repo table and the hive.baby
   planet's hex cells are projections, not authorities. Once
   HiveProductionList ships, it becomes canon and everything else
   projects from it.

---

Superseded by `docs/specs/manifest-schema-final.md`.
