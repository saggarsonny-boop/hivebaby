# HIVE — Claude Code Instructions

## Owner
Sonny Saggar, physician. I direct, you build. Be direct, finish what you start, no vacillating.

## The Mission
Hive is a social experiment. "You are the investor." No ads, no investors, no agenda. Free at the base tier, forever. We build what people ask for.

## Working Rules
- Operate from the hivebaby Codespace but push to ANY repo using the GitHub token
- Auto-commit, auto-deploy wherever possible
- Only come back to Sonny for decisions, not execution
- Fix your own errors before reporting them
- When the planet is broken, fix it without being asked
- Use GitHub API + token to work across all repos from this single Codespace
- Read VISION.md when you need engine specs, pipeline details, adoption stack, or full ecosystem context

## GitHub
Token: [stored in Codespace secret / ask Sonny]
Account: saggarsonny-boop

## Repos, Domains & Status
| Repo | Engine Name | Domain | Status | Stack |
|------|------------|--------|--------|-------|
| hivebaby | — | hive.baby | LIVE | Static HTML |
| hive-moon | HiveMoon | hivemoon.hive.baby | LIVE | Next.js (client-only) |
| hive-field | HiveField | hivefield.hive.baby | LIVE | Next.js + Anthropic |
| hive-clock | HiveClock | hiveclock.hive.baby | LIVE | Next.js + Anthropic |
| hive-clarity | HiveClarity | hiveclarity.hive.baby | LIVE | Next.js + Anthropic |
| hive-strength-mastery | HiveStrength | hivestrength.hive.baby | LIVE | Next.js + Anthropic |
| hive-body-log | HiveBodyLog | hivebodylog.hive.baby | LIVE | Next.js + Anthropic |
| hive-engine-builder | HiveEngineBuilder | hiveenginebuilder.hive.baby | LIVE | Next.js + Anthropic |
| queen-bee | QueenBee | queenbee.hive.baby | IN PROGRESS | Next.js + Anthropic |
| creator-console | HiveCreatorConsole | creatorconsole.hive.baby | LIVE | Next.js |
| secret-box | HiveSecretBox | secretbox.hive.baby | LIVE | Next.js |
| universal-document/apps/landing | UniversalDocument | ud.hive.baby | LIVE | Next.js |
| whotextedme | WhoTextedMe | whotextedme.hive.baby | LIVE | Next.js + Anthropic |
| universal-document/apps/converter | UDConverter | converter.hive.baby | LIVE | Next.js + Anthropic |
| universal-document/apps/creator | UDCreator | creator.hive.baby | LIVE | Next.js + Anthropic |
| universal-document/apps/reader | UDReader | reader.hive.baby | LIVE | Next.js |
| universal-document/apps/validator | UDValidator | validator.hive.baby | LIVE | Next.js |
| universal-document/apps/utilities | UDUtilities | utilities.hive.baby | LIVE | Next.js + Anthropic |
| universal-document/apps/signer | UDSigner | signer.hive.baby | LIVE | Next.js |
| hive-support | HiveAdminSupport | support.hive.baby | LIVE | Next.js + Anthropic |
| hive-hivememe | HiveMeme | hivememe.hive.baby | BUILDING | Next.js + Anthropic |
| hive-hivephoto | HivePhoto | hivephoto.hive.baby | BUILDING | Next.js + Anthropic + Clerk + Neon + R2 + Stripe |
| hive-aestheticbestie | HiveAestheticBestie | hiveaestheticbestie.hive.baby | LIVE | Next.js + Anthropic |
| hive-microritual | HiveMicroRitual | hivemicroritual.hive.baby | LIVE | Next.js + Anthropic |
| hive-memory-space | HiveMemorySpace | hivememoryspace.hive.baby | BUILDING | Next.js + Anthropic |
| sovereign-arbitrage | SovereignArbitrage | sovereignarbitrage.hive.baby | LIVE | Next.js + Anthropic |
| ud-inc | UniversalDocumentInc | universaldocument.hive.baby | LIVE | Next.js + Tailwind |

## Naming Standards (canonical — all future engines must follow)

### Engine Names
- Format: `HiveEnginename` — PascalCase after Hive prefix (e.g., `HiveBodyLog`, `HiveClarity`)
- Multi-word: PascalCase (e.g., `HiveEngineBuilder`, `HiveAdminSupport`)
- UD ecosystem: `UniversalDocument` hub, sub-engines as `UDConverter`, `UDCreator`, `UDReader`, `UDValidator`
- Exception: `WhoTextedMe`, `QueenBee`, `HiveSecretBox` — established names, keep as-is

### Repos
- Format: `enginename` lowercase hyphen-separated (e.g., `hive-body-log`, `hive-strength-mastery`)

### Domains
- Format: `enginename.hive.baby` — all lowercase, no hyphens (e.g., `hiveclarity.hive.baby`, `hivebodylog.hive.baby`)
- UD hub: `ud.hive.baby`
- Internal tools: may use temp Vercel URLs until DNS migration confirmed

### Git Branches
- `dev` — feature work
- `main` — deployment only (ops commits direct to main are acceptable)

### Required per Repo
- `ENGINE_GRAMMAR.md` in repo root with GrapplerHook metadata block

## Vercel
Account: saggarsonny-3909s-projects (Hobby). All projects auto-deploy on git push to main.
hivebaby deploy hook: `curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Mj8SJS4gAlrG2PCXdUCUMmoAQAA3/CfgdTZ1r50"`
hive-body-log deploy hook: `curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_ZhRnfMdAJWuBxEKJWHooR6MlfDMc/RqzslhTGkA"`
hive-moon deploy: `cd /workspaces/hive-moon && npx vercel --prod --yes` (project ID: prj_UZ75MoGAgd3dKAFUkI5XKLybATl2)

## Tech Stack
- Next.js + TypeScript (all engines except hivebaby)
- Anthropic SDK primary AI (claude-opus-4-5)
- Tailwind CSS (check package.json — not universal)
- Neon PostgreSQL (connection string in Vercel env vars)
- Stripe (payments), Cloudflare (DNS), Vercel (hosting)

## Cloudflare DNS
- CF_API_TOKEN: stored in Codespace secret (use `$CF_API_TOKEN`)
- CLOUDFLARE_ZONE_ID: `bcb5522993ecf90a4f1d5dfe101e5a5c` (hive.baby zone — verified correct)
- Add CNAME: `curl -s -X POST "https://api.cloudflare.com/client/v4/zones/bcb5522993ecf90a4f1d5dfe101e5a5c/dns_records" -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" --data '{"type":"CNAME","name":"SUBDOMAIN","content":"cname.vercel-dns.com","ttl":1,"proxied":false}'`

## DNS Pattern
All engines: enginename.hive.baby — Cloudflare CNAME → cname.vercel-dns.com
Vercel Deployment Protection must be OFF for public access

---

## hive.baby Planet — THE FRONT DOOR

Three.js 3D planet. Each hexagon cell = one Hive engine.
- Real Earth: NASA GIBS satellite + cloud imagery (updates every 6 hours)
- Real stars: HYG database, correct positions and magnitudes, 88 IAU constellation lines
- Real moon: position and phase from astronomical algorithms, moves in real time
- ISS: live TLE position from CelesTrak, shown as moving point with label
- Live engines: glow gold with pulse animation
- Coming soon: faded grey. Empty cells: random 3-letter codes
- Planet spins; drag/zoom/pinch supported
- Zooming into a gold cell triggers fly-through animation then navigation
- Breathing planet: 0.2% scale pulse every 4 seconds
- Day/night terminator: real sun position, city lights on night side
- Fuzzy natural language search → routes to correct engine
- Patronage cell: deep amber/copper, slower pulse, "Support Hive" on hover, links to /patrons

### Planet Stage 1 (current build — all items must be complete)
1. Real Earth with NASA GIBS cloud imagery
2. Real star field with HYG + 88 IAU constellation lines
3. Real moon position and phase (no API)
4. Real ISS position from CelesTrak TLE
5. Zoom fly-through animation on engine click
6. Breathing planet (0.2% scale pulse, 4s)
7. Day/night terminator + city lights
8. Patronage cell (amber/copper)

### Build Priority Order
1. hive.baby planet Stage 1
2. Patronage cell + /patrons.html page
3. First-visit guided orbit (post-welcome)
4. Auto-demo for live engines
5. Queen Bee
6. Universal Document / UD
7. Gary Gansson + HiveTV
8. Additional engines per VISION.md

---

## ONBOARDING STACK (required for every engine, no exceptions)

1. **Auto-Demo** — typewriter types a real example, pre-written AI response appears, fades after 8s. `localStorage: hive_demo_{enginename}`
2. **First-Visit Card** — 15 words max, one "Try it" prompt, dismissed with one tap, never returns. `localStorage: hive_welcomed_{enginename}`
3. **Tooltip Tour** — ? button, one sentence per UI element, replayable
4. **Rotating Placeholders** — real use cases, typewriter effect, cycles continuously. Never "enter text here."

### Auto-Demo Scripts

**HiveBodyLog:** Input: "Three weeks of morning headaches, worse on waking, easing by midday. Also noticing some neck stiffness." → "Morning headache pattern (21 days) · Onset: on waking · Peak: 7–8am · Resolution: ~11am · Associated: neck stiffness · Duration trend: consistent · Possible context: posture, sleep position, tension · Worth mentioning at your next GP appointment if this continues."

**HiveField:** Input: "ICU nurse, night shift" → "3:20am. Bay 4. Mr Okafor, 67, post-CABG day 2. His SpO2 has dropped from 97% to 91% in the last 20 minutes. RR 24. He's restless but arousable. His drain output has been 40ml/hr for the last two hours. What do you do first?"

**HiveClarity:** Input: "I need to tell my team we're behind on the project but I don't want to cause panic" → "Your team needs three things: the honest situation, why it happened, and what happens next. Try: 'We're running two weeks behind on [project]. The delay is from [specific cause]. Here's the revised timeline and what we're doing differently: [actions]. Questions welcome.'"

**HiveStrength:** Input: "42 year old, been training 6 months, stuck on 100kg squat for 8 weeks" → "Plateau Protocol: Week 1–2: drop to 85kg, 5×5, perfect bar path focus. Week 3: 90kg, 4×4. Week 4: test 102.5kg. Your plateau is likely neural, not muscular — the drop-and-reset pattern breaks it in 85% of cases. Also: are you sleeping 7+ hours? Plateau rate doubles below 6."

---

## Standard Engine Rules

- Never make up facts when using real data — cite source visibly: "Data: [Source], updated [frequency]"
- Safety-critical info (drug recalls, food hygiene, vehicle recalls) always free — never Pro-gated
- Health engines: "This is not medical advice. Always consult a qualified clinician."
- Legal engines: "This is not legal advice. Always consult a qualified solicitor or attorney."
- Every engine page: "No ads. No investors. No agenda." in footer
- Global Intelligence Engine citation: `Data sources: [list]. Analysis: Hive Clarity Substrate. Retrieved: [date].`

## Standard New Engine Pattern
- Next.js + TypeScript, Anthropic SDK (claude-opus-4-5), Tailwind CSS
- Deploy to Vercel, domain: enginename.hive.baby
- Cloudflare CNAME → cname.vercel-dns.com
- ANTHROPIC_API_KEY in Vercel env vars (Production)
- Vercel Deployment Protection: OFF
- Free tier forever; paid features via Stripe
- Full Onboarding Stack (all four components)
- Data source credited visibly if using real data

## UD Design System — GOVERNANCE RULE (hard, no exceptions)

All UD tools, engines, apps, and commensals must use the UD Design System. This is a governance rule enforced at the ENGINE_GRAMMAR level. Any build that deviates must be corrected before merge.

### Typography
| Role | Font |
|------|------|
| Headings | Playfair Display |
| Body | DM Sans |
| Labels / meta / code | DM Mono |

### Color Palette
| Token | Hex | Use |
|-------|-----|-----|
| Ink | `#1e2d3d` | Primary text, nav, dark backgrounds |
| Paper | `#fafaf8` | Page background |
| Gold | `#c8960a` | CTAs, accents, brand highlights |
| Paper-2 | `#f2f1ee` | Alternate section backgrounds |
| Border | `#e0ddd6` | Dividers, card borders |
| Muted | `#6b7280` | Secondary text, placeholders |

### Border Radius
- Standard elements: `8px`
- Cards: `12px`

### File Type Icons
- **UDR** — light blue (`#93c5fd`), file-shape, "UDR" + "UNIVERSAL DOCUMENT™" wordmark below
- **UDS** — dark navy (`#1e2d3d`), file-shape, "UDS" + "UNIVERSAL DOCUMENT™" wordmark below
- Icon files live at `/public/icons/udr.svg` and `/public/icons/uds.svg` in each UD repo

### Scope — applies without exception to:
UD Reader · UD Converter · UD Creator · UD Validator · UD Utilities · UD Signer · every future UD tool

## Universal Document™ — Trademark
Universal Document™ is a pending trademark (Serial 99774346, filed 2026-04-20).
Always use ™ symbol after "Universal Document" in all Hive properties and documents.

## SECONDARY MEANING PROTOCOL — PERMANENT STANDING INSTRUCTION

In ALL content produced for the Hive ecosystem and Universal Document properties, apply this naming convention without exception:

On first use of "Universal Document" in any piece:
→ Write as: Universal Document™ (UD)

On first use of "UD" as an abbreviation in any piece:
→ Write as: UD (Universal Document™)

The ™ is always superscripted directly after the word "Document" — not after UD, not at the end of the phrase. Like this:
Universal Document™ (UD)
UD (Universal Document™)

On subsequent uses in the same piece:
→ Universal Document™ or UD — either is fine
→ ™ on every instance of "Universal Document"
→ No ™ needed on standalone "UD"

### UDR / UDS Full Expansions
- **UDR** = Universal Document™ Revisable (also: Reviewable)
- **UDS** = Universal Document™ Sealed (also: Secure)

### This protocol applies to:
- All blog posts and Medium articles
- All LinkedIn content
- All white papers and sectoral briefs
- All product UIs and nav elements
- All emails sent from HiveAdminSupport
- All press releases
- All documentation
- All public-facing content of any kind

No exceptions. This is a permanent standing instruction that overrides any previous naming guidance.

## CONSULTING FRAMEWORK — PERMANENT REFERENCE

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

### Fee structure:
- Day rate: £2,000–5,000 depending on engagement
- Project fees: scoped and agreed in advance
- Long-term arrangements: equity or revenue share for engagements that produce ongoing value
- All commercial arrangements through Universal Document Incorporated or a separate consulting vehicle

### HiveAdminSupport behaviour for consulting enquiries:
- Acknowledge warmly — flag immediately (keywords: "consult", "advisory", "engagement", "retainer")
- Do NOT auto-respond with pricing
- Route to Sonny for personal response within 24 hours

### Credentials:
- Medium articles Part 1 and Part 2 are the primary consulting credential documents
- White paper at universaldocument.hive.baby is the secondary credential
- LinkedIn overhaul needed — see session notes

---

## How to Work Across Repos
Use GitHub API with token to read/write/commit to any repo.
After any hivebaby change, trigger: `curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Mj8SJS4gAlrG2PCXdUCUMmoAQAA3/CfgdTZ1r50"`
