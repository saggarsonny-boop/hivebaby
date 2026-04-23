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
| universal-document | UniversalDocument | ud.hive.baby | IN PROGRESS | Next.js + Anthropic |
| whotextedme | WhoTextedMe | whotextedme.hive.baby | LIVE | Next.js + Anthropic |
| universal-document/apps/converter | UDConverter | converter.hive.baby | LIVE | Next.js + Anthropic |
| hive-support | HiveAdminSupport | support.hive.baby | LIVE | Next.js + Anthropic |
| hive-hivememe | HiveMeme | hivememe.hive.baby | BUILDING | Next.js + Anthropic |
| hive-hivephoto | HivePhoto | hivephoto.hive.baby | BUILDING | Next.js + Anthropic + Clerk + Neon + R2 + Stripe |
| hive-aestheticbestie | HiveAestheticBestie | hiveaestheticbestie.hive.baby | LIVE | Next.js + Anthropic |
| hive-microritual | HiveMicroRitual | hivemicroritual.hive.baby | LIVE | Next.js + Anthropic |
| hive-memory-space | HiveMemorySpace | hivememoryspace.hive.baby | BUILDING | Next.js + Anthropic |
| sovereign-arbitrage | SovereignArbitrage | sovereignarbitrage.hive.baby | LIVE | Next.js + Anthropic |
| ud-utilities | UDUtilities | utilities.hive.baby | LIVE | Next.js + Anthropic |
| ud-signer | UDSigner | signer.hive.baby | LIVE | Next.js + Anthropic |
| ud-inc | UniversalDocumentInc | universaldocument.hive.baby | LIVE | Next.js + Tailwind |
| expo-hive | HiveApp | App Store / Play Store | READY TO SUBMIT | Expo + react-native-webview |

## Brand Assets (official — do not recreate as SVG)

All brand marks are PNG files. Use exactly as provided. Do not redraw, redesign, or recreate in SVG.

| Asset | File | Description | Usage |
|-------|------|-------------|-------|
| UDS mark | `ud-mark-uds.png` | Dark blue background, light UD mark, "UDS" label | UDNav logo, UDS file icon, favicon |
| UDR mark | `ud-mark-udr.png` | Light blue background, dark UD mark, "UDR" label | UDR file icon |
| HIVE icon | `hive-icon.png` | Gold glowing hexagon on dark honeycomb grid | Hive app icon, expo-hive app store icon |

### File locations (once deployed)
- UD apps: `apps/{app}/public/icons/ud-mark-uds.png`, `ud-mark-udr.png`
- Hive: `hivebaby/public/hive-icon.png`
- UDNav component: replace text "UD" mark with `<img src="/icons/ud-mark-uds.png">`
- Favicon: `ud-mark-uds.png` square-cropped → `favicon.ico` in each app

### Deployment status
- [ ] PNGs committed to universal-document repo
- [ ] PNGs copied to all app public/icons/ folders
- [ ] UDNav updated to use PNG mark
- [ ] Favicons updated
- [ ] hive-icon.png committed to hivebaby

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

## Mobile App — expo-hive
Local path: `/home/user/expo-hive` — committed, ready to push.
To publish: create `saggarsonny-boop/expo-hive` on GitHub, then:
```
cd /home/user/expo-hive
git remote set-url origin https://github.com/saggarsonny-boop/expo-hive.git
git push -u origin main
```
Then: `eas login` → `eas build:configure` (updates projectId in app.json) → `eas build --platform all`

## Email Routing — hive@hive.baby
Solved via Cloudflare Email Worker (hive-email-router). No MX record needed.
- Worker forwards every inbound email to saggarsonny@gmail.com
- Worker simultaneously POSTs to support.hive.baby/api/inbound (HiveAdminSupport webhook)
- Gmail delivery + HiveAdminSupport logging both confirmed working
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

## Universal Document™ — Trademark
Universal Document™ is a pending trademark (Serial 99774346, filed 2026-04-20).
Always use ™ symbol after "Universal Document" in all Hive properties and documents.

## Universal Document™ — File Format Specification

There are exactly THREE file formats. No others. No new extensions. Ever.

| Extension | Name | Purpose |
|-----------|------|---------|
| `.uds` | Universal Document Sealed | A sealed, tamper-evident document. Immutable once sealed. |
| `.udr` | Universal Document Revisable | A draft/working document. Can be edited. Converts to .uds on sealing. |
| `.udz` | Universal Document Bundle | A governed bundle of multiple .uds files. General-purpose. |

### .udz is universal — NOT domain-specific

`.udz` is the single bundle format for any collection of .uds files. It is not a legal format, medical format, or any other specialist format.

Specialised bundle assemblers (UDZ Legal Bundle, UDZ Deposition Package, UD FOI Bundle, UD Data Package, UD Claims Package, etc.) are **tools that output .udz files**. They are NOT new file formats.

**Rule for all bundle tool UI copy:**
- ✓ "Output: .udz bundle"
- ✓ "Creates a .udz bundle pre-configured for legal proceedings"
- ✗ "Output: .udz legal bundle"
- ✗ "Creates a .udz-legal file"

The output filename may have a descriptive suffix (e.g. `case-files-deposition.udz`) but the extension is always `.udz`.

## Beta Status
BETA STATUS: All Pro features free. Stripe in test mode.
Beta end date: TBD — Sonny will announce.
When beta ends: Sonny will instruct CC to activate Stripe live mode and implement usage limits.
Pro badges still show on Pro features so users understand the value — but clicking them works without payment.
Show "Pro · Free during beta" beneath Pro badges instead of just "Pro".

## How to Work Across Repos
Use GitHub API with token to read/write/commit to any repo.
After any hivebaby change, trigger: `curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Mj8SJS4gAlrG2PCXdUCUMmoAQAA3/CfgdTZ1r50"`
