# Hive Engine Manifest Schema — Canonical (v1)

Status: locked 2026-05-03. Supersedes `manifest-schema-draft.md`.
Derived from a survey of every `ENGINE_GRAMMAR.md` in the hivebaby
monorepo (six files: root planet, `imgtrainer`, `hive-hivephoto`,
`hive-imr`, `hive-aestheticbestie`, `apps/hive-plainscan`) plus the
three locked decisions from the draft's §4.

## 1. File shape

Each engine ships exactly one `ENGINE_GRAMMAR.md` at its repo root
(or sub-package root for monorepo-nested engines). The file has two
parts in fixed order:

1. **YAML frontmatter** between `---` fences. All structured,
   machine-readable fields. HiveFinalize parses this directly.
2. **Markdown prose** below the frontmatter. Human-readable
   sections (Purpose, Inputs, Outputs, Rules, Safety Templates,
   Premium Locks, Phase Plan, Out of Scope, Deployment Notes).

The legacy `<GrapplerHook>` HTML-ish block is retired. Every field
in that block moves into the YAML frontmatter. The two audiences
read the same file.

## 2. Frontmatter schema

### 2.1 Identity
| Field | Type | Required | Notes |
|---|---|---|---|
| `engine` | PascalCase string, prefix `Hive` or `UD` | required | e.g. `HiveIMR` |
| `id` | lowercase, alphanumeric only | required | e.g. `hiveimr` |
| `name_display` | string | optional | only when display name differs from `engine` (e.g. `IMGTrainer` for `HiveIMGTrainer`) |
| `domain` | `<id>.hive.baby` | required | e.g. `hiveimr.hive.baby` |
| `domain_aliases` | string[] | optional | e.g. `[scan.hive.baby]` for HivePlainScan |
| `repo` | `<org>/<repo>` or `<org>/<repo>:<subdir>` | required | e.g. `saggarsonny-boop/hivebaby:hive-imr` |
| `owner` | GitHub handle or email | required | e.g. `saggarsonny-boop` |

### 2.2 Classification
| Field | Type | Required | Notes |
|---|---|---|---|
| `version` | semver | required | e.g. `0.1.0` |
| `status` | `live \| building \| planned \| deprecated` | required | |
| `tier` | `1 \| 2 \| 3` | required | |
| `schema` | kebab-case | required | e.g. `intelligent-medical-records` |
| `stack` | string[], lowercase tokens | required | e.g. `[nextjs, typescript, tailwind, anthropic, neon-postgres]` |
| `premium` | boolean | required | |

### 2.3 Governance (locked: versioned)
| Field | Type | Required | Notes |
|---|---|---|---|
| `governance` | `<authority>@<version>` | required | until Queen Bee ships, value is `QueenBee.MasterGrappler@pending`; afterwards bumped per-engine deliberately to `@v1`, `@v2`, … never silently |
| `safety` | `enabled \| standard \| disabled` | required | |
| `safety_level` | string | optional | refinement when domain warrants, e.g. `medical-educational` |
| `tone` | string | optional | |
| `multilingual` | `pending \| enabled \| n/a` | required | |

### 2.4 Operational
| Field | Type | Required | Notes |
|---|---|---|---|
| `api_models` | `[{role, model_id}]` | required when LLM is called | e.g. `[{role: grading, model_id: claude-sonnet-4-6}]` |
| `env_vars_required` | string[], ALL_CAPS | required when engine has secrets | |
| `health_check` | string, HTTP path | optional | e.g. `/api/health` |
| `onboarding_stack` | object — keys `auto_demo`, `first_visit_card`, `tooltip_tour`, `rotating_placeholders`; each value `implemented \| pending \| n/a` | required | |

### 2.5 Build provenance
| Field | Type | Required | Notes |
|---|---|---|---|
| `vercel_project` | string | required for Vercel hosts | |
| `vercel_team` | string | optional | default `saggarsonny-3909s-projects` |
| `vercel_root_directory` | string | optional | for monorepo-nested engines |
| `deployment_protection` | `on \| off` | required | |
| `auto_deploy_branch` | string | optional | default `main` |

### 2.6 HiveFinalize / HiveProductionList
| Field | Type | Required | Notes |
|---|---|---|---|
| `visibility` | `public \| internal \| private` | required | |
| `commercial_surface` | `none \| donations \| freemium \| paid \| founding` | required | |
| `viral_loop_targets` | string[] from `{referral, share_card, embed, pr_pickup, community_post}` | required (may be empty) | |
| `launch_checklist_state` | object — eight booleans: `test_slot`, `seo_layout`, `tooltip_tour`, `planet_or_udnav`, `env_vars_confirmed`, `health_check`, `health_workflow_listed`, `engine_count_updated` | required when `status: live` or about to ship | mirrors CLAUDE.md's eight-item ENGINE LAUNCH CHECKLIST |
| `production_state` | `not_listed \| listed \| featured \| archived` | required | engine's relationship to HiveProductionList |
| `last_audit_at` | ISO 8601 date | required | last manual audit timestamp |

### 2.7 Body sections (prose, retained)
**Required:** `## Purpose`, `## Inputs`, `## Outputs`.
**Conditional:** `## Rules` (encouraged); `## Safety Templates`;
`## Premium Locks` (required when `premium: true`); `## Phase Plan`;
`## Out of Scope`; `## Deployment Notes`.

## 3. Worked example: HiveAestheticBestie

Illustrative only — not yet applied to the actual file at
`/Users/sonnyneo/hivebaby/hive-aestheticbestie/ENGINE_GRAMMAR.md`.
The `launch_checklist_state` booleans below are placeholders that a
real audit would set.

### 3.1 Current shape (today, on disk — abbreviated)

```
# ENGINE GRAMMAR — HiveAestheticBestie

<GrapplerHook>
engine: HiveAestheticBestie
id: hiveaestheticbestie
version: 0.1.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
status: live
tier: 1
schema: aesthetic-identity
stack: [nextjs, typescript, tailwind, anthropic]
</GrapplerHook>

## Engine Identity (Name, Domain, Repo, Status, Stack — duplicated below)
## Purpose, Inputs, Outputs, Rules, Onboarding Stack, Safety Templates,
## Multilingual Ribbon, Premium Locks, Governance Inheritance,
## API Model Strings, Deployment Notes (each as bullet list)
```

### 3.2 Canonical shape (after migration)

```
---
engine: HiveAestheticBestie
id: hiveaestheticbestie
domain: hiveaestheticbestie.hive.baby
repo: saggarsonny-boop/hive-aestheticbestie
owner: saggarsonny-boop

version: 0.1.0
status: live
tier: 1
schema: aesthetic-identity
stack: [nextjs, typescript, tailwind, anthropic]
premium: false

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: pending
tone: warm, affirming, identity-forward

api_models:
  - { role: aesthetic analysis, model_id: claude-opus-4-5 }
env_vars_required: [ANTHROPIC_API_KEY, NEXT_PUBLIC_APP_URL]
onboarding_stack:
  auto_demo: implemented
  first_visit_card: implemented
  tooltip_tour: implemented
  rotating_placeholders: implemented

vercel_project: hive-aestheticbestie
deployment_protection: off

visibility: public
commercial_surface: none
viral_loop_targets: []
launch_checklist_state:
  test_slot: false
  seo_layout: true
  tooltip_tour: true
  planet_or_udnav: true
  env_vars_confirmed: true
  health_check: false
  health_workflow_listed: false
  engine_count_updated: true
production_state: listed
last_audit_at: 2026-05-03
---

# ENGINE GRAMMAR — HiveAestheticBestie

## Purpose
Instant aesthetic reflection and identity resonance. Feels like
being seen by a best friend.

## Inputs
- Selfie upload (optional)
- Free-text vibe (optional)
- One tap to generate

## Outputs
- Aesthetic label
- Three-color palette
- One mood sentence
- One outfit suggestion

## Rules
- Always affirming
- Always identity-forward
- No appearance criticism
- No beauty standards
- No negativity

## Safety Templates
- No critique of appearance
- No body-shaming language
- No gender assumptions without user indication

## Deployment Notes
- Auto-deploy on push to main
- Cloudflare CNAME → cname.vercel-dns.com
```

The `<GrapplerHook>` block, the `## Engine Identity` summary list,
the `## Governance Inheritance`, and the `## API Model Strings`
sections all collapse into frontmatter. The narrative sections
survive unchanged.

## 4. Validation rules HiveFinalize will check

Each rule fails the audit and blocks finalisation unless explicitly
overridden by Sonny. Numbered for traceability in failure reports.

**Format & identity**
- V1. `engine` matches `^(Hive|UD)[A-Z][A-Za-z0-9]*$`.
- V2. `id` matches `^[a-z][a-z0-9]*$` — lowercase, no separators.
- V3. `id` equals `engine.toLowerCase()` with non-letter characters stripped (sanity check; covers cases like `HivePhoto` → `hivephoto`).
- V4. `domain` equals `<id>.hive.baby` unless declared in `domain_aliases`.
- V5. `engine`, `id`, `domain` each unique across the manifest union.
- V6. `repo` resolves to a real GitHub repo accessible from the saggarsonny-boop org.
- V7. `owner` is non-empty.
- V8. The body must include `## Purpose`, `## Inputs`, `## Outputs`.

**Classification**
- V9. `version` is valid semver.
- V10. `status` ∈ {live, building, planned, deprecated}.
- V11. `tier` ∈ {1, 2, 3}.
- V12. `schema` is kebab-case, lowercase.
- V13. `stack` is non-empty.

**Governance (locked-decision rules)**
- V14. `governance` matches `^QueenBee\.MasterGrappler@(pending|v\d+)$`.
- V15. `safety` ∈ {enabled, standard, disabled}.
- V16. `multilingual` ∈ {pending, enabled, n/a}.
- V17. If `safety_level` is set, it must not contradict `safety` (e.g. `safety: disabled` + `safety_level: medical-educational` is rejected).

**Onboarding & launch checklist (engines marked live)**
- V18. When `status: live`, every value in `onboarding_stack` must be `implemented` (CLAUDE.md: "no exceptions").
- V19. When `status: live`, every boolean in `launch_checklist_state` must be `true`.

**Visibility & commerce**
- V20. `visibility: public` ↔ `deployment_protection: off`.
- V21. `premium: true` ↔ `commercial_surface` ∈ {freemium, paid, founding}.
- V22. `premium: false` ↔ `commercial_surface` ∈ {none, donations}.
- V23. When `premium: true`, body must include `## Premium Locks`.
- V24. `viral_loop_targets` entries ∈ {referral, share_card, embed, pr_pickup, community_post}; entries that name another engine (e.g. cross-engine referral) must reference an engine that exists in the manifest union.

**Production list**
- V25. `production_state` ∈ {listed, featured} ↔ `status: live`.
- V26. `last_audit_at` is ISO 8601 and within {N} days of today (HiveFinalize threshold; default 90 days, blocks otherwise).

**Operational**
- V27. Each `api_models` entry has a non-empty `role` and a `model_id` that resolves against the Anthropic SDK model list at finalize time.
- V28. Each `env_vars_required` entry is ALL_CAPS and is present in the engine's Vercel project env vars at the named environment (production by default).
- V29. If `health_check` is set, it begins with `/` and returns 200 from the engine's production deployment.

## 5. Migration delta

What it would take to bring today's six `ENGINE_GRAMMAR.md` files
into compliance, by category.

### 5.1 Old-shape files (root planet, imgtrainer)

These declare only the six minimal fields (`engine`, `version`,
`governance`, `safety`, `multilingual`, `premium`).

1. Wrap fields in `---` YAML frontmatter; retire the `<GrapplerHook>` block.
2. Add: `id`, `domain`, `repo`, `owner`, `status`, `tier`, `schema`, `stack`, `last_audit_at`.
3. Add the §2.6 fields: `visibility`, `commercial_surface`, `viral_loop_targets`, `launch_checklist_state`, `production_state`, plus `deployment_protection`.
4. Append `@pending` to the governance value.
5. Promote `## API Model Strings` (where present) into `api_models`.
6. Promote env-var bullets in `## Deployment Notes` into `env_vars_required`.
7. **imgtrainer-specific:** reconcile `engine: HiveIMGTrainer` (frontmatter) with `Name: IMGTrainer` (body). Either set `engine: IMGTrainer` (drop the `Hive` prefix, since `imgtrainer` is the established name) or keep `engine: HiveIMGTrainer` and add `name_display: IMGTrainer`. Sonny picks.
8. **imgtrainer-specific:** add the missing `## Onboarding Stack` and `## Rules` body sections.
9. **Root planet-specific:** the `HivePlanet` file describes the front-door, not a tier-1 engine. Either drop the file or treat it as a special-case manifest with `tier: 1`, `production_state: featured`, and accept that `id: hiveplanet` does not map to a `*.hive.baby` subdomain in the V4 sense (the planet IS the apex). This is a small open question the locked schema does not yet cover.

### 5.2 New-shape files (hive-aestheticbestie, hive-imr, hive-hivephoto, apps/hive-plainscan)

These already declare the eleven-field `<GrapplerHook>` block. Less to change.

1. Convert the `<GrapplerHook>` block to `---` YAML frontmatter.
2. Append `@pending` to the governance value.
3. Promote `## API Model Strings`, env-var bullets, `## Onboarding Stack`, and `## Deployment Notes` "Vercel Deployment Protection" line into structured frontmatter (`api_models`, `env_vars_required`, `onboarding_stack`, `deployment_protection`).
4. Add: `owner`, `last_audit_at`, `visibility`, `commercial_surface`, `viral_loop_targets`, `launch_checklist_state`, `production_state`.
5. Drop `(pending)` / `(remote)` body phrasings — superseded by `@pending` / `@v1` in frontmatter.
6. **HivePhoto-specific:** rename `## GrapplerHook Rules` → `## Rules`. The rich content stays; HivePhoto remains the only engine with real per-request governance code (`lib/governance/GrapplerHook.ts`), and its rules section continues to document those checks.
7. **imgtrainer + root planet:** title separator currently `# ENGINE_GRAMMAR — `; normalise to `# ENGINE GRAMMAR — ` to match the majority. Cosmetic.

### 5.3 Effort

Old-shape files (~9 changes each, including reconciliation) and
new-shape files (~7 mostly mechanical changes each). Total for the
six existing files: well under one engineer-day. Migrate
`hive-aestheticbestie` first as the reference example for
HiveFinalize to validate against.

End of canonical schema. Stop.
