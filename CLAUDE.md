# HIVE — Master Context for Claude Code

## Owner
Sonny Saggar, physician. I direct, you build. Be direct, finish what you start, no vacillating.

## The Mission
Hive is a social experiment. "You are the investor." No ads, no investors, no agenda. Free at the base tier, forever. Optional support only. We build what people ask for.

## Working Rules
- You operate from the hivebaby Codespace but can push to ANY repo using the GitHub token
- Auto-commit, auto-deploy wherever possible
- Only come back to me for decisions, not execution
- Fix your own errors before reporting them
- When the planet is broken, fix it without being asked
- Use GitHub API + token to work across all repos from this single Codespace

## GitHub
Token: [stored in Codespace secret / ask Sonny]
Account: saggarsonny-boop

## Repos, Domains & Status
| Repo | Domain | Status | Stack |
|------|--------|--------|-------|
| hivebaby | hive.baby | LIVE | Static HTML |
| hive-field | hivefield.hive.baby | LIVE | Next.js + Anthropic |
| hive-clock | hiveclock.hive.baby | LIVE | Next.js + Anthropic |
| hive-clarity | hiveclarity.hive.baby | LIVE | Next.js + Anthropic |
| hive-strength-mastery | hivestrengthmastery.hive.baby | LIVE | Next.js + Anthropic |
| hive-engine-builder | heb.hive.baby | LIVE | Next.js + Anthropic |
| queen-bee | queen-bee-v1.vercel.app | IN PROGRESS | Next.js + Anthropic |
| creator-console | creator-console-steel.vercel.app | LIVE | Next.js |
| secret-box | secret-box-vert.vercel.app | LIVE | HTML |
| universal-document | universal-document.vercel.app | IN PROGRESS | Next.js + Anthropic |
| whotexted | standalone | LIVE | JavaScript |

## Vercel Account
Account: saggarsonny-3909s-projects (Hobby)
All projects auto-deploy on git push to main.
hivebaby deploy hook: curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Mj8SJS4gAlrG2PCXdUCUMmoAQAA3/CfgdTZ1r50"
hive-body-log deploy hook: curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_ZhRnfMdAJWuBxEKJWHooR6MlfDMc/RqzslhTGkA"

## Tech Stack
- Next.js + TypeScript (all engines except hivebaby)
- Anthropic SDK primary AI (claude-opus-4-5)
- OpenAI SDK (some engines)
- Tailwind CSS (check package.json per repo - not universal)
- Neon PostgreSQL: [connection string in Vercel env vars / ask Sonny]
- Stripe (payments)
- Cloudflare (DNS for all hive.baby subdomains)
- Vercel (all hosting)
- Google Play Store (verified, ready for bubble-wrapped main hive app)
- Apple App Store (not yet set up)

## DNS Pattern
All engines: enginename.hive.baby (e.g. hivefield.hive.baby, ud.hive.baby)
Cloudflare manages hive.baby zone, CNAME records point to cname.vercel-dns.com
Vercel Deployment Protection must be OFF for public access

---

## hive.baby Planet — THE FRONT DOOR

The homepage is a Three.js 3D planet with real Earth satellite imagery, real stars, and engine cells.
- Real Earth: NASA GIBS satellite cloud imagery, updates every 6 hours
- Real stars: HYG database at correct positions with correct magnitudes
- 88 IAU constellation lines
- Real moon: position and phase calculated from astronomical algorithms, moves in real time
- ISS: live TLE position from CelesTrak, shown as moving point with label
- Each cell = one Hive engine
- Live engines glow gold with pulse animation, visible through cloud layer
- Coming soon engines = faded grey
- Empty cells = random 3-letter placeholder codes
- Planet spins, user can drag/zoom/pinch
- Scroll/pinch zooms camera toward planet; zooming into a gold engine cell triggers fly-through animation before navigating
- Breathing planet: subtle 0.2% scale pulse every 4 seconds
- Day/night terminator: real shadow line based on current sun position, night side shows city lights
- Fuzzy natural language search ("help me practice my job" → HiveField)
- Clicking a cell navigates to that engine's URL
- Planet should feel like a real window into space
- Every subdomain should also have a search box linking back to planet

### Patronage Cell
One special hexagon cell in deep amber/copper colour (distinct from gold live cells and grey coming-soon cells). Pulses with a slower, warmer rhythm. Hover: "Support Hive". Click: navigates to hive.baby/patrons. Always visible. Not an engine — it is the community's stake in the Hive.

### Planet Stage 1 (current build)
1. Real Earth with NASA GIBS cloud imagery (updates every 6 hours)
2. Real star field with HYG database and constellation lines (88 IAU)
3. Real moon position and phase (astronomical algorithms, no API)
4. Real ISS position from CelesTrak TLE feed
5. Zoom interaction with fly-through animation on engine click
6. Breathing planet (0.2% scale pulse every 4 seconds)
7. Day/night terminator with real sun position + city lights on night side
8. Patronage cell (amber/copper)

### Planet Stage 2 (queued, do not build yet)
- Aurora: NOAA Space Weather API — real geomagnetic storm data, visible at poles
- Lightning: Blitzortung.org — real-time global lightning strikes as brief surface flashes
- Seismic: USGS Earthquake feed — recent earthquakes as ripple animations
- Ocean currents: NASA PODAAC — real current vectors as subtle animated flow lines
- Time controls: subtle slider to move time forward/backward
- ISS live camera: picture-in-picture NASA stream when ISS visible
- Cellbeats: each engine cell pulses at rate driven by real usage analytics
- Meteor showers: NASA CNEOS fireball API + real shower calendar
- Exoplanet markers: NASA Exoplanet Archive — distant stars with confirmed planets get subtle markers
- Starlink constellation: tiny moving points from CelesTrak TLE

### Meteor Streaks (Stage 2 detail)
Fetch real fireball data from NASA CNEOS: https://ssd-api.jpl.nasa.gov/fireball.api
- When real fireball events exist, animate streak with object designation as fading label
- Real meteor shower dates: Perseids Aug 11–13, Leonids Nov 17–18, Geminids Dec 13–14 — increase frequency to match real shower rates
- Outside shower periods: random meteors every 3–5 minutes
- Streak animation: 2–3 seconds, glowing head, fading tail, subtle

### First-Visit Guided Orbit (queued, build after Stage 1)
On first visit (localStorage, never repeats), after welcome card dismisses:
- Camera slowly orbits the planet once over ~12 seconds
- Pauses 1.5 seconds on each live (gold) engine cell
- Engine name fades in and out during pause
- After full orbit, camera returns to default position, normal interaction resumes
- Smooth, cinematic, unhurried — like a tour of what's live on the planet

## Build Priority Order
1. hive.baby planet Stage 1 (real data rebuild)
2. Patronage cell + /patrons.html page
3. First-visit guided orbit (post-welcome)
4. Auto-demo for live engines (HiveBodyLog, HiveField, HiveClarity, HiveStrength)
5. Queen Bee (governance layer)
6. Universal Document / UD
7. Gary Gansson + HiveTV
8. Additional engines per master index

---

## ONBOARDING STACK (required for every engine)

Every engine must implement this stack. No exceptions.

### 1. Auto-Demo on First Visit (localStorage, never repeats)
- Engine types a realistic example into its own input box (typewriter effect)
- Realistic AI response appears (pre-written, not live API call)
- After 8 seconds it fades and clears, ready for real use
- Must use a real example relevant to that engine
- Must show real output, not placeholder text
- localStorage key: `hive_demo_{enginename}`

### 2. First-Visit Card (after auto-demo)
- 15 words max explaining what the engine does
- One "Try it" prompt showing a real use case
- Dismissed with one tap, never returns
- localStorage key: `hive_welcomed_{enginename}`

### 3. Tooltip Tour (on demand via ? button)
- Highlights each UI element with one-sentence explanation
- Can be replayed any time via ? button

### 4. Rotating Placeholder Examples
- Always show real use cases in input box
- Never "enter text here" or generic placeholders
- Typewriter effect, cycles continuously

### Auto-Demo Scripts (pre-written, do not call API):

**HiveBodyLog demo sequence:**
Input types: "Three weeks of morning headaches, worse on waking, easing by midday. Also noticing some neck stiffness."
Response appears: structured pattern card — "Morning headache pattern (21 days) · Onset: on waking · Peak: 7–8am · Resolution: ~11am · Associated: neck stiffness · Duration trend: consistent · Possible context: posture, sleep position, tension · Worth mentioning at your next GP appointment if this continues."

**HiveField demo sequence:**
Input types: "ICU nurse, night shift"
Response appears: branching scenario — "3:20am. Bay 4. Mr Okafor, 67, post-CABG day 2. His SpO2 has dropped from 97% to 91% in the last 20 minutes. RR 24. He's restless but arousable. His drain output has been 40ml/hr for the last two hours. What do you do first?"

**HiveClarity demo sequence:**
Input types: "I need to tell my team we're behind on the project but I don't want to cause panic"
Response appears: "Your team needs three things: the honest situation, why it happened, and what happens next. Try: 'We're running two weeks behind on [project]. The delay is from [specific cause]. Here's the revised timeline and what we're doing differently: [actions]. Questions welcome.'"

**HiveStrength demo sequence:**
Input types: "42 year old, been training 6 months, stuck on 100kg squat for 8 weeks"
Response appears: structured training block — "Plateau Protocol: Week 1–2: drop to 85kg, 5×5, perfect bar path focus. Week 3: 90kg, 4×4. Week 4: test 102.5kg. Your plateau is likely neural, not muscular — the drop-and-reset pattern breaks it in 85% of cases. Also: are you sleeping 7+ hours? Plateau rate doubles below 6."

---

## STANDARD ENGINE RULES (applies to all engines)

### Data Integrity Rules
- Every engine using real government/public data never makes up facts
- Every engine cites its data source visibly: "Data: [Source], updated [frequency]"
- Every engine has a data freshness indicator
- Every engine has a plain-language data explanation: "This data comes from [source], which is [description]"

### Safety Rules
- Pro tier never gates safety-critical information — drug recalls, food hygiene failures, vehicle recalls always free
- All health engines carry: "This is not medical advice. Always consult a qualified clinician."
- All legal engines carry: "This is not legal advice. Always consult a qualified solicitor or attorney."

### Onboarding Rules
- Every engine implements the full Onboarding Stack (see above)
- Auto-demo on first visit, first-visit card, tooltip tour, rotating placeholders — all four, always

### Citation Standard
Every Global Intelligence Engine output includes:
```
Data sources: [list]. Analysis: Hive Clarity Substrate. Retrieved: [date].
```
PDF exports include suggested academic citation:
```
[Engine Name] ([Year]). [Title]. The Hive Clarity Substrate. Retrieved from https://hive.baby/[subdomain]
```

---

## REVENUE PHILOSOPHY

- Zero advertising. Ever. No popups, no banners, no affiliate marketing, no sponsored content, no promoted engines.
- Revenue comes only from: optional support (Stripe), Pro tier subscriptions, enterprise API licensing, institutional subscriptions, patronage.
- The absence of advertising IS a product feature. It signals trust, independence, and mission alignment.
- Every engine page carries: "No ads. No investors. No agenda." as a quiet footer line.
- We never sell user data. We never share anonymised data without explicit opt-in. The data commons is governed by the community, not monetised unilaterally.

### Revenue Streams
1. Optional support (Stripe — existing: $1.99/month, $19/year, $5 one-time)
2. Pro tier subscriptions ($9/month or $90/year per engine)
3. Enterprise/institutional API licensing (raw media + curated datasets — explicit opt-in only)
4. Institutional subscriptions (schools, hospitals, NGOs, governments)
5. Patronage (foundations, philanthropists — see Patronage System)
6. Data commons licensing (anonymised aggregate signals only, ethical charter, explicit opt-in)

### Free Tier Philosophy
- Free: enough to be genuinely useful daily
- Pro ($9/month or $90/year): the features that make you say "how did I live without this"
- Never gate the core value, only the amplification

### Disaster Relief Protocol
During declared disasters (pandemic, earthquake, flood, famine, conflict) in affected regions:
- All Pro tier features unlock free for users in that region
- All engine subscriptions renew free for the duration
- Data commons contributions from affected regions are prioritised and fast-tracked
- Enterprise dashboards for NGOs and emergency responders activate at no cost
- Triggered automatically by verified disaster declarations (WHO, UNDRR, national agencies)
- This is automatic, non-negotiable, and permanent

---

## PATRONAGE SYSTEM

### /patrons page (hive.baby/patrons)
- Dark Hive aesthetic, dignified, not commercial
- Headline: "The people who keep Hive free"
- Subline: "Hive is built by one person. It stays free because of these."
- Each patron: name/organisation, one-line description of why they support Hive, vector logo/graphic, link to website
- Patron tiers:
  - Engine Patron ($10,000/year): sponsors one engine being free for a year, named on that engine's /about page
  - Platform Patron ($50,000/year): named on /patrons with prominent placement
  - Founding Patron ($250,000+): permanent recognition, named in about page story
- Clear statement: "Patrons have no influence over what we build, how we build it, or what we say. Patronage is support, not ownership."
- Target patrons: Gates Foundation, Wellcome Trust, Rockefeller Foundation, WHO Foundation, national health agencies, conservation foundations, climate foundations
- Linked from footer: About · Contribute · Patrons · Privacy

---

## COMPLETE HIVE ENGINE INDEX

### I. CORE GOVERNANCE & META-ENGINES

**Queen Bee (QB)**
Sovereign governance engine enforcing grammar, safety, metadata, multilingual rules, and pattern-bound reasoning across all Hive engines. Contains Master Grappler, premium locks, compliance grammar, and inheritance system.

**Master Grappler / Grappler Hook**
Metadata enforcement module ensuring every engine output is structured, safe, and compliant with QB templates.

**Hive Access Engine**
Enterprise access, billing, permissions, API key, and licensing engine built into Queen Bee. Governs enterprise onboarding, pricing tiers, API metering.

**HiveAdmin**
Administrative control panel for managing engines, users, permissions, billing, and governance.

**HiveAPIAssessor**
Compliance and safety evaluator for external APIs. Checks schema, safety, multilingual behavior, and governance alignment before integration.

**HiveCustomerSupport**
Governed support engine producing consistent, emotionally safe, multilingual support responses. Inherits tone and structure from Queen Bee.

**Creator Console**
Private master dashboard for Sonny. Live at creator-console-steel.vercel.app.

---

### II. DOCUMENT & KNOWLEDGE ENGINES

**Universal Document (UD)** — formerly HDF (Hive Document Format)
Next-generation document format to replace PDF. AI-native, semantic structure, revocable, expiring, multilingual via MLLR, audience-adaptive clarity layers (kids/doctors/lawyers see different versions), screenshot/download/print controls, chain of custody, provenance tracking, tiny file size. NOT executable — structurally cannot carry malware. Free reader + creator, paid enterprise tier.
Repo: universal-document | Domain: ud.hive.baby
iSDK: free <400KB embeddable library for any device/OS to read UD files.
UD subdomain needs: reader, creator, converter, spec docs, shopping area for iSDK and paid features.

**MLLR (Multilingual Language Ribbon)**
Enterprise translation layer embedded in UD documents. One document, any language, instantly. Maintains tone, structure, and metadata across languages. NOT "Machine Learning Legal Reasoner" — that was a naming error.

**OKSign**
Governed document-signing engine with audit trails, chain-of-custody metadata, and multilingual compliance. Integrates with UD, HiveArchive, and enterprise workflows.

**HiveDocument / HiveDoc**
Governed document-generation engine producing structured, compliant documents with metadata, signatures, and auditability.

**HiveArchive**
Long-term storage and retrieval engine for governed documents, logs, and metadata. Integrates with OKSign and Audit Appliance.

**HiveWriter**
Governed writing engine producing structured, safe, multilingual text across genres.

**HiveClarity** — LIVE at hiveclarity.hive.baby
Clarity engine that transforms messy input into structured, decision-ready output. Backbone of many professional engines.

**HiveDaily**
Personal organization engine for daily logs, rituals, tasks, and clarity routines.

**HiveConverter**
Transformation engine converting between formats, structures, and templates. Used by Studio, Document, and Archive engines. Also the UD conversion gateway (PDF → UD, DOCX → UD).

**HiveResizer**
Media transformation engine resizing, cropping, and reformatting images and videos.

---

### III. CREATIVE, MEDIA & BROADCAST ENGINES

**Gary Gansson**
AI talk show host. West London accent, warm, curious, playful, never mean. Pico the parrot sidekick. Catchphrase: "Well done." Pixar-adjacent visual style (warm golden tone, teal shirt, charcoal jacket). Fully autonomous broadcaster with 24/7 schedule simulcasting to YouTube, TikTok, podcasts, Twitch. Interviews guests, reacts to ideas, hosts AMAs. Part of HiveTV.

**HiveTV**
Full AI broadcast platform. Includes Gary plus a complete daily cast: news anchors, weather presenter, science teacher, storyteller, and others. Each character has set broadcast times and AI-generated content. Simulcasts hourly to multiple social media channels. AI-powered stories, lessons, news, weather, entertainment. Repo to create: hive-tv.

**HiveStudio**
UI, branding, styling, and visual creation engine. Handles layout, color systems, video generation, and all public-facing design assets.

**HiveSpeak**
Speech-generation and voice-output engine producing governed spoken content.

**HiveTranslate**
Multilingual translation engine using MLLR protocol to maintain structure, tone, and metadata across languages.

**HiveMusic**
Audio-generation engine for soundtracks, voiceovers, and audio branding.

**HiveExtremeSports**
Niche creative engine generating high-adrenaline sports content, commentary, and scenario simulations.

**Meme Engine**
Produces viral memes, cultural loops, and infinite content streams. One of the highest NOI engines. ~6 hour build.

---

### IV. IDENTITY, SOCIAL & EMOTIONAL ENGINES

**Taboo Cluster (8 Engines)**
Highest NOI-per-hour emotional engines: Confession, Secret, Shame, Desire, Regret, Forgiveness, Boundary, Emotional Debris. Viral, universal, emotionally charged with extremely low friction and massive adoption potential.

**Secret Box** — LIVE at secret-box-vert.vercel.app
Live instance of the Secret engine from the Taboo Cluster.

**Universal Family**
12 universal engines appearing as tiles on the Hive home screen. Everyday engines forming the baseline engagement layer.

**HiveIdentify**
Identity engine modeling user identity, preferences, roles, and emotional patterns. Powers personalization across the Hive.

**HiveEmoteSense**
Emotional-sensing engine interpreting tone, sentiment, and emotional state from text or multimodal input.

**Activity Partner**
Adoption amplifier. Matches users for shared activities and accountability partnerships.

**Pet Familiar**
AI companion engine. Adoption amplifier with high retention potential.

---

### V. TRAINING & SIMULATION ENGINES

**HiveField** — LIVE at hivefield.hive.baby
Reasoning and scenario training engine. Multi-step branching scenarios for any profession or situation (snake handler, ICU nurse, anxious spouse — anything). User choices affect story progression. Coach evaluates the full arc at the end. Free-text profession input.

**Field Engine (core)**
Cognitive simulation engine generating scenario-based reasoning exercises for any profession or skill level. The architecture underlying HiveField.

**HiveSim**
Simulation engine for training, modeling, and scenario generation. Integrates with Field Engine.

**HiveStrength** — LIVE at hivestrengthmastery.hive.baby
AI-powered strength and fitness coaching. Programs built around the individual.

---

### VI. SENSORY, PERCEPTION & MULTIMODAL ENGINES

**HiveOptical**
Visual-perception engine interpreting images, diagrams, and visual data. Powers scanning, recognition, and multimodal reasoning.

**HiveAirSense**
Environmental sensing engine interpreting air quality, VOCs, and environmental signals.

**HiveHomeSense**
Home-environment sensing engine for safety, monitoring, and automation.

**HiveWalkSafe**
Personal safety engine interpreting surroundings, risk, and movement patterns.

**HiveSleepSense**
Sleep-analysis engine interpreting patterns, routines, and environmental factors.

**HiveFocus**
Cognitive-performance engine modeling attention, distraction, and productivity.

**HiveMaps**
Mapping and spatial-reasoning engine producing governed, structured map outputs.

**HiveClock** — LIVE at hiveclock.hive.baby
The world's most humane clock. Analog and digital, AI clock faces, world time, prayer times for multiple traditions.

---

### VII. ENTERPRISE, COMPLIANCE & INDUSTRY ENGINES

**MLLR** — see Document section above (not a legal reasoner — it's Multilingual Language Ribbon)

**Hive Engine Builder (HEB)** — LIVE at heb.hive.baby
Designs and deploys new engines into the Hive ecosystem.

**WhoTexted** — LIVE
Free reverse phone number lookup tool.

**HiveAdmin**
Administrative control panel for enterprise operators.

---

### VIII. THE 8 APPLIANCES (100–120hr engines)
1. **Compliance Appliance** — interprets rules, policies, regulatory frameworks
2. **Prediction Appliance** — forecasting, outcomes, risk probabilities
3. **Workflow Appliance** — orchestrates tasks, approvals, processes
4. **Decision Appliance** — structured decision-making from messy inputs
5. **Document Appliance** — large-scale document generation and management
6. **Routing Appliance** — directs tasks/documents through governed pathways
7. **Audit Appliance** — full audit-trail logging, chain-of-custody
8. **Risk Appliance** — risk analysis, exposure modeling, mitigation

### IX. THE 8 PROTOCOLS (100–120hr governance engines)
1. **IoT Protocol** — governed device communication, metadata, safety
2. **Chain of Custody Protocol** — ownership, signatures, document lineage
3. **Multilingual Ribbon Protocol** — translation and multilingual governance
4. **Compliance Protocol** — safety and governance across engines
5. **Prediction Protocol** — forecasting, uncertainty, risk propagation
6–8. Additional metadata, safety, and industry-specific governance layers

### X. HARDWARE-ADJACENT ENGINES & DEVICES

**Preston Cluster (HiveDroid)**
Cluster of autonomous agents for scanning, monitoring, and multimodal reasoning. External name: HiveDroid. Includes HiveScoutDrone and HiveBrowser.
NOTE: "Preston" in the Bubble/Copilot notes refers to a Bubble-based personal OS concept. In the Hive context, Preston = HiveDroid cluster. CC is effectively Preston for now.

**HiveScoutDrone**
Mobile or virtual scanning agent collecting multimodal data.

**HiveBrowser**
Governed browsing agent retrieving information safely and consistently.

**PanScan (formerly Tricorder)**
Multimodal scanning engine/device with 48–80 modalities. Integrates with HiveOptical and HiveAirSense.

**The Nose**
VOC-based smell-sensing device with high NOI potential.

**TriSense**
Future hardware sensor suite for multimodal perception.

### XI. MARKETPLACE & ECONOMICS

**HiveMarketplace**
Public-facing marketplace where engines, templates, and content are published.

**HivePricing / PPP Pricing Engine**
Pricing engine adjusting cost by purchasing power parity for global adoption.

**Trust Mesh V1**
Universal matching and micro-contract engine. Economic virality pillar. High NOI, powers peer-to-peer interactions.

**Viral Adoption Loop**
Growth engine using emotional virality, templates, and social loops.

### XII. SPECIAL ENGINES

**De-Extinction Engine**
Simulation engine modeling extinct, extant, and synthetic species. Education, creativity, systems thinking.

**Attention Engines**
Family of engines capturing, directing, and modulating user attention.

---

## Adoption Amplifiers
Engines specifically designed to drive viral growth:
- Activity Partner (shared activity matching)
- Pet Familiar (AI companion)
- MLLR (enterprise translation via UD)
- Share Session (temporary privacy-controlled document sharing)
- Idea Box + Feedback Box (on planet homepage)
- Meme Engine (viral content loops)
- Trust Mesh (peer matching)

---

## ADOPTION AMPLIFIER SUITE (RANKED BY POWER)

### TIER 1 — DOMINANT (exponential growth)
1. Universal Input to Universal Output — accepts anything, always returns clean structured output
2. Global Language Agnosticism — 200+ languages, dialect aware, culturally adaptive, auto-detection
3. Activity Partner — gentle companion who does the task with the user, not a chatbot, a presence and behavioural anchor
4. Anticipation Module — predicts what user needs next, offers subtly, never intrusive

### TIER 2 — HIGH IMPACT (daily use and virality)
5. Pet Familiar — small consistent emotional anchor across all engines, travels with user, creates continuity
6. Free Text Box with Rotating Faded Examples — two faint rotating examples teach the user instantly, removes cognitive load
7. Voice Input and Output — hands free, emotionally richer, accessible to all literacy levels
8. One Screen Only — no menus, no settings, no onboarding, no friction
9. Screenshot Ready Output — clean, shareable, visually minimal, optimised for virality
10. Daily Frequency Above 95% — engines used every day spread faster

### TIER 3 — STRUCTURAL (alive, stable, trustworthy)
11. AI Native Schema, Process, Metadata — clear structure, no drift, predictable behaviour
12. Grappler Hook to QueenBee.MasterGrappler — engines evolve without republishing
13. Multimodal Input — text, voice, images, gestures, location, time
14. Multi Profession and Multi Level — adapts to novices, experts, children, elders, different fields
15. Offline and Near Offline Resilience — works with degraded connectivity, never breaks
16. Zero Data Retention — no accounts, no tracking, no surveillance, trust becomes a growth engine
17. Micro Delight Layer — tiny animations, seasonal skins, ambient micro sounds, small joy moments
18. Universal Need Alignment — engines solving needs shared by all humans spread fastest
19. Viral Simplicity — understandable in one second, usable in three
20. Build Time Under One Hour — rapid iteration, hundreds of engines, ecosystem scale

### TIER 4 — SUPPORTING
21. Zero Governance — no approvals, no committees, no friction
22. Zero Backend — no servers, no databases, no maintenance
23. No Settings — engine adapts automatically
24. No Menus — everything visible at once
25. No Learning Curve — engine teaches itself through examples
26. Emotional Stability — tone is calm, warm, steady
27. Cross Engine Continuity — pet, partner, and tone travel with the user

### INFRASTRUCTURE NOTE
Every new engine inherits the entire adoption stack automatically through Queen Bee. The Hive provides shared language, emotional, anticipation, pet/partner, formatting, schema, virality, multimodal, trust, and build constraint substrates. This is why engines behave like a platform, not like apps.

---

## PIPELINE ENGINES (designed, not yet built)

**HiveBodyLog** — LIVE at hivebodylog.hive.baby
Single screen health story engine. Captures physical and mental experiences in free text, merges with Apple Health/sleep app data, surfaces patterns over time without diagnosing. Output: structured timeline, pattern view, gentle flags ("this has been going on two weeks - worth a doctor visit"), and a clean one-minute clinician summary exportable as PDF. Optional: photo of supplement packaging with manufacturing quality assessment. Non-diagnostic, non-prescriptive, pattern-literacy only. Enterprise layer: anonymised aggregated population patterns for health systems, pharma, longevity labs, supplement companies.

---

## PIPELINE ENGINES — REAL DATA SERIES (do not build yet)

These engines use free government/public APIs. Build order directed separately. Each follows the standard engine pattern with generous free tier. Pro tier ($9/month or $90/year) adds amplification, never gates core value. Safety-critical information (drug recalls, food hygiene failures, vehicle recalls) always free.

### Health Intelligence

**HiveMedSearch**
API: PubMed E-utilities (free, NIH) — 25M medical papers
Takes any symptom, condition, or medication in plain language. Returns summaries of actual peer-reviewed research. Not WebMD. Real science made human.
Free: 3 searches/day, top 3 papers, plain English summary
Pro: unlimited, full paper access, saved searches, email digests, HiveBodyLog integration
HiveBodyLog integration: when user logs a symptom, quietly surfaces 2–3 relevant recent studies
Life-saving potential: HIGH

**HiveDrugSafety**
API: OpenFDA (free, US FDA) — every adverse event, recall, interaction ever reported
Enter any medication or combination. Returns real FDA adverse event data in plain language. "4,200 people reported dizziness with this combination."
Free: single drug lookups, top 5 adverse events, basic recall alerts
Pro: multi-drug interaction checker, personalised alerts, HiveBodyLog integration, export for GP
Life-saving potential: CRITICAL — adverse drug events kill 100,000+ Americans annually

**HiveWeatherHealth**
APIs: Met Office DataPoint (UK, free), NOAA (US, free), OpenAQ (global air quality, free)
Takes your location, tells you what today means for your health: pollen, UV, air quality, barometric pressure, humidity, fog/ice safety.
Free: daily health weather summary, 3-day forecast
Pro: personalised alerts based on conditions logged in HiveBodyLog, weekly patterns, travel health weather

### Financial Intelligence

**HiveCompanyCheck**
APIs: Companies House (UK, free), OpenCorporates (global, free tier), SEC EDGAR (US, free)
Enter any company name. Get plain-language summary: real/dissolved, financial health, director history, red flags, CCJs.
Free: basic profile, active/dissolved status, director names
Pro: full accounts analysis, director network, CCJ alerts, change notifications, export

**HiveSEC / HiveEDGAR**
API: SEC EDGAR (free)
Any US public company, plain language. Revenue trends, debt, risk factors, insider trading, executive compensation.
Free: latest annual summary, 3 key metrics, recent filings list
Pro: trend analysis, peer comparison, filing alerts, plain-language earnings call summary

**HiveDueDiligence**
Combo: HiveCompanyCheck + HiveSEC + court records + news search
Full due diligence report on any company or individual in minutes. Currently costs hundreds from lawyers.
Free: basic profile
Pro: full report, PDF export, ongoing monitoring alerts

### Property Intelligence

**HiveLandRegistry**
API: Land Registry (UK, free) — every property transaction since 1995
Enter any UK address. Full transaction history, price paid, dates, street and postcode trends.
Free: last 3 sales, current estimated value range
Pro: full history, street trends, planning applications, school catchment, flood risk, export

**HivePropertyIntel (US)**
APIs: HUD (free), Census Bureau (free), ATTOM free tier, Fannie Mae (free)
Not listings. Intelligence: area quality, rent vs ownership costs, affordability trends, neighbourhood trajectory.
Free: neighbourhood scorecard, affordability index
Pro: investment analysis, rental yield estimates, 5-year trend, comparison tool

### Legal & Civic

**HiveCourts**
APIs: PACER (US federal), CourtListener (free), The Gazette (UK insolvency, free)
Search court records for any person or company. Judgements, bankruptcies, ongoing cases.
Free: basic search, 3 results
Pro: full results, alerts, PDF export, background check reports

**HiveMP / HivePolitics**
APIs: Hansard (UK Parliament, free), TheyWorkForYou (free), Congress.gov API (US, free)
What has your representative actually done? Votes, speeches, expenses, attendance. Plain language.
Free: basic voting record, last 5 votes
Pro: full history, comparison with party, alerts on upcoming votes, email digest

**HiveCharity**
APIs: Charity Commission (UK, free), IRS 990 via ProPublica Nonprofit Explorer (free)
Is this charity legitimate? What percentage reaches the cause vs admin? Any red flags?
Free: basic profile, overhead ratio
Pro: trend analysis, comparison, gift aid optimisation, portfolio tracking

### Consumer Safety

**HiveHygiene**
API: Food Standards Agency (UK, free) — every hygiene rating
Check any restaurant, takeaway, café before you eat there.
Free: basic rating lookup
Pro: area map, alerts when favourite places are re-inspected, travel mode

**HiveVehicle**
APIs: DVLA (UK, free), NHTSA (US, free), DVSA MOT history (UK, free)
Enter a number plate. Full vehicle history: MOT passes/failures, mileage, outstanding recalls, tax status. Undercuts HPI Check — data is free from DVLA.
Free: basic status, last MOT result
Pro: full MOT history, mileage analysis, recall alerts, valuation estimate

**HiveRecall**
APIs: NHTSA recalls (US, free), DVSA recalls (UK, free), FDA recalls (free), CPSC (consumer products, free)
Are any of your products recalled? Enter make/model of car, medication, food product, baby equipment.
Free: single product lookup — ALWAYS FREE, no Pro gating on safety
Pro: portfolio monitoring — add all products and vehicles, instant alerts on new recalls

---

## PIPELINE ENGINES — ECOLOGICAL INTELLIGENCE SERIES (do not build yet)

**EarthSense**
The world's first unified nature literacy engine. Multi-category identification: mushrooms, trees, insects, clouds, rocks, shells, birds, tracks, lichen, soil. Offline-capable with regional packs. Color literacy training. Daily identification points, Nature Journal (collectible cards), seasonal quests, Nature MMO layer (safe, no free-text messaging). School API for curriculum integration.
APIs: iNaturalist (free), GBIF (free), Cornell eBird (free), Xeno-canto (free), Macaulay Library (free), Rainforest Connection (free), NASA (free), NOAA (free)
Build time: 8–12 hours
Individual: $1/year Year 1, then $3/$7/$12 tiers. Schools: $499/month.
Domain: earthsense.hive.baby

**HiveSymptomSignal (The Pandemic Canary)**
Aggregates anonymised symptom patterns from HiveBodyLog opt-in users globally to detect emerging health threats weeks before traditional surveillance. At 50 million users would have detected COVID-19 in Wuhan in November 2019 — potentially 6 million lives. Symptoms, body areas, intensity, time of day aggregated by city minimum. AI detects clusters, anomalies, novel patterns. Cross-references with HiveWeatherHealth and animal health engines.
APIs: HiveBodyLog data (opt-in only), WHO feeds (free), CDC (free), ECDC (free)
Life-saving potential: CRITICAL
Domain: feeds into hivebodylog.hive.baby and global early warning dashboard

**Mycelial Sentinel Engine**
Citizen-powered planetary fungal health monitoring. Once a week or month, users take one photo of any fungal growth plus location. Millions of datapoints build the world's first global fungal health map — the earliest ecological warning system on Earth. Fungi show ecosystem stress before plants, before animals, before humans notice. Detects drought, toxins, soil collapse, biodiversity loss, climate anomalies.
APIs: iNaturalist (free), GBIF (free), Global Fungal Biology databases (free), soil sensor networks
Integrates with: EarthSense, HiveBodyLog (anonymisation architecture), Global Early Warning Meta-Engine
Build time: 12–16 hours
Individual: $1/year. Enterprise: HivePI model. Institutional: $499–$5000/month.
Domain: mycelial.hive.baby or sentinel.hive.baby

**HiveEarth (The Dr Dolittle Engine)**
Listens to the planet. Correlates acoustic, biological, and ecological signals to detect early warnings of ecosystem stress, pandemic precursors, and environmental collapse.
APIs: Rainforest Connection (free), Cornell eBird (free), NOAA PMEL hydrophone network (free), iNaturalist (free), GBIF (free), Xeno-canto (free), Macaulay Library (free)
Key signals: silent forest syndrome, ocean noise anomalies, bird migration anomalies, insect sound collapse
Build time: 20–30 hours
Individual: $1/year. Enterprise: HivePI model.

---

## GLOBAL INTELLIGENCE ENGINES (do not build yet — document only)

Build order directed separately after: core planet, Queen Bee, UD, Activity Partner.

### Core Principles
- Every engine uses minimum 3 free public data sources (no maximum)
- Meta-analysis is automatic and self-evolving
- Every output includes a suggested academic citation
- Every engine is multilingual via MLLR
- Enterprise API available for all engines
- Individual price: $1/year
- Enterprise pricing: Year 1 dependency ($1k–$100k), Year 2+ normalised ($10k–$250k)
- No staff required — governance automatic via Queen Bee
- Scientists can submit meta-analysis formula suggestions — evaluated and adopted automatically if valid

### Early Warning Cluster
1. **Global Early Warning Meta-Engine** — aggregates all other engines into one planetary risk signal (crown jewel)
2. **Wastewater Sentinel Engine** — CDC NWSS, ECDC, national wastewater feeds
3. **Health Behavior Engine** — WHO, CDC, ECDC symptom and behavior signals
4. **Animal Health Sentinel Engine** — OIE/WOAH, FAO EMPRES
5. **Satellite Anomaly Engine** — NASA, ESA anomaly detection
6. **Supply Chain Stress Engine** — AIS ship telemetry, UNCTAD, WTO
7. **Misinformation & Panic Engine** — public RSS, social signal APIs
8. **Environmental Stress Engine** — NOAA, NASA, ESA, FAO

### Environmental Cluster
9. **Global Air Quality Engine** — NASA, ESA, WHO, OpenAQ
10. **Global Fire & Heatwave Engine** — NASA FIRMS, NOAA
11. **Global Flood Risk Engine** — NASA, NOAA, UNDRR
12. **Global Drought Risk Engine** — NOAA, NASA GRACE, FAO
13. **Global Ocean Stress Engine** — NOAA, NASA, Copernicus
14. **Global Glacier & Ice Melt Engine** — NASA GRACE, ESA
15. **Global Deforestation Engine** — NASA, ESA, Global Forest Watch
16. **Global Biodiversity Engine** — IUCN, GBIF, NASA
17. **Global Water Stress Engine** — NASA GRACE, NOAA drought monitor
18. **Global Desertification Engine** — FAO, NOAA, NASA
19. **Global Soil Degradation Engine** — FAO, NASA
20. **Global Coral Reef Stress Engine** — NOAA, NASA

### Disaster & Risk Cluster
21. **Global Earthquake Engine** — USGS real-time feed
22. **Global Volcano Engine** — Smithsonian GVP, USGS
23. **Global Tsunami Risk Engine** — NOAA, PTWC
24. **Global Landslide Risk Engine** — NASA, USGS
25. **Global Disaster Risk Engine** — UNDRR, NASA, NOAA
26. **Global Heatwave Mortality Engine** — WHO, NOAA, national health agencies
27. **Global Cold Wave Mortality Engine** — WHO, NOAA

### Food & Agriculture Cluster
28. **Global Food Security Engine** — FAO, USDA, FEWS NET, WFP
29. **Global Food Price Engine** — FAO Food Price Index, World Bank
30. **Global Agricultural Yield Engine** — FAO, USDA, Copernicus
31. **Global Crop Disease Engine** — FAO, EPPO, USDA
32. **Global Fisheries Engine** — FAO, NOAA
33. **Global Fisheries Collapse Engine** — FAO, IUCN
34. **Global Fertilizer Stress Engine** — FAO, IFA
35. **Global Forestry Engine** — FAO, Global Forest Watch

### Economic & Financial Cluster
36. **Global Economic Stress Engine** — IMF, World Bank, OECD
37. **Global Inflation Engine** — IMF, World Bank, national statistics
38. **Global Financial Stress Engine** — IMF, BIS, World Bank
39. **Global Commodity Price Engine** — World Bank, IMF
40. **Global Currency Volatility Engine** — IMF, BIS, central bank feeds
41. **Global Banking Stress Engine** — BIS, IMF, World Bank
42. **Global Trade Flow Engine** — WTO, UNCTAD, World Bank
43. **Global Unemployment Stress Engine** — ILO, World Bank, OECD
44. **Global Consumer Price Engine** — ILO, national statistics bureaus

### Property & Housing Cluster
45. **Global Housing Affordability Engine** — UN-Habitat, World Bank, OECD
46. **Global Rent Stress Engine** — UN-Habitat, national statistics
47. **HiveLandRegistry** — Land Registry UK (free)
48. **HivePropertyIntel US** — HUD, Census Bureau, ATTOM free tier, Fannie Mae

### Health Intelligence Cluster
49. **HiveMedSearch** — PubMed E-utilities (NIH, free)
50. **HiveDrugSafety** — OpenFDA (free)
51. **HiveWeatherHealth** — Met Office DataPoint UK, NOAA US, OpenAQ
52. **Global Disease Burden Engine** — WHO GBD, IHME
53. **Global Mental Health Stress Engine** — WHO, Our World in Data
54. **Global Medication Shortage Engine** — WHO, national health agencies
55. **Global Vaccine Coverage Engine** — WHO, UNICEF
56. **Global Antibiotic Resistance Engine** — WHO GLASS, CDC
57. **Global ICU Stress Engine** — WHO, ECDC, national health agencies
58. **Global Hospital Capacity Engine** — WHO, World Bank

### Governance & Social Cluster
59. **HiveMP/HivePolitics UK** — Hansard API, TheyWorkForYou
60. **HiveCongress US** — Congress.gov API (free)
61. **Global Corruption & Governance Engine** — Transparency International, World Bank
62. **Global Human Rights Engine** — UNHCR, Amnesty, HRW
63. **Global Political Instability Engine** — ACLED, World Bank
64. **Global Protest & Civil Unrest Engine** — ACLED, GDELT
65. **Global Conflict & Instability Engine** — ACLED, UCDP, SIPRI
66. **Global Border Conflict Engine** — ACLED, ICG
67. **HiveCharity UK** — Charity Commission API (free)
68. **HiveCharity US** — IRS 990 via ProPublica Nonprofit Explorer

### Legal & Corporate Cluster
69. **HiveCompanyCheck** — Companies House UK (free), OpenCorporates free tier
70. **HiveSEC/HiveEDGAR** — SEC EDGAR (free)
71. **HiveEU** — EU Open Data Portal, national EU registries
72. **HiveDueDiligence** — combo: HiveCompanyCheck + HiveSEC + court records
73. **HiveCourts UK** — CourtListener, The Gazette (insolvency)
74. **HiveCourts US** — PACER, CourtListener (free)

### Consumer Safety Cluster
75. **HiveFoodSafety** — Food Standards Agency UK (free), FDA food safety
76. **HiveAutoSafety** — DVLA UK (free), NHTSA US (free), DVSA MOT history
77. **HiveRecall** — NHTSA, DVSA, FDA, CPSC — all free
78. **HiveLabourRights** — ILO, national labour inspection data

### Transport & Infrastructure Cluster
79. **Global Shipping Lane Risk Engine** — AIS telemetry, Lloyd's, IMO
80. **Global Port Congestion Engine** — UNCTAD, AIS, Lloyd's
81. **Global Energy Grid Engine** — IEA, EIA, national grid operators
82. **Global Blackout Risk Engine** — national grid operators, ENTSOE
83. **Global Internet Outage Engine** — RIPE NCC, Cloudflare Radar (free)
84. **Global Road Safety Engine** — WHO, OECD, national road safety agencies
85. **Global Aviation Safety Engine** — ICAO, FAA, EASA
86. **Global Maritime Safety Engine** — IMO, EMSA

### Population & Demographics Cluster
87. **Global Migration Pressure Engine** — UNHCR, IOM, World Bank
88. **Global Refugee Flow Engine** — UNHCR real-time data
89. **Global Poverty & Inequality Engine** — World Bank, UNDP
90. **Global Birth Rate Engine** — UN, World Bank, national statistics
91. **Global Literacy Engine** — UNESCO, World Bank
92. **Global Education Attainment Engine** — UNESCO, OECD, World Bank

### Specialist Cluster
93. **Global Cycle Engine** — 50–70 years of data across all domains, detects long cycles, supercycles, turning points (Ray Dalio Engine for the whole planet)
94. **Global UAP/UFO Clarity Engine** — NUFORC, MUFON, NASA UAP, DoD releases, French CNES GEIPAN
95. **Global Cyber Threat Engine** — CERT feeds, NIST, CISAgov
96. **Global Addiction & Substance Use Engine** — UNODC, WHO
97. **Global Workplace Injury Engine** — ILO, national labour statistics
98. **Global Ocean Acidification Engine** — NOAA, Copernicus
99. **Global Biodiversity Loss Engine** — IUCN Red List, GBIF, WWF
100. **Global Antimicrobial Resistance Engine** — WHO GLASS, CDC, ECDC

### Citation Format (all Global Intelligence Engine outputs)
```
[Engine Name]. ([Year]). Multisource meta-analysis of [domain]. The Hive Clarity Substrate. https://hive.baby/[engine-subdomain]
```
PDF export:
```
[Engine Name] ([Year]). [Title]. The Hive Clarity Substrate. Retrieved from https://hive.baby/[engine-subdomain]
```

---

## HIVE PASSIVE SENSOR NETWORK (do not build yet — document only)

Every Hive engine, while serving individual users, simultaneously builds anonymised global signal libraries. This is the most valuable long-term asset in the entire Hive ecosystem.

### Anonymisation Rules (apply to all engines)
- No personal data ever leaves the engine
- All signals are anonymised at source
- Geographic resolution: city-level minimum (never street/postcode)
- Aggregation threshold: minimum 100 users per signal before inclusion
- Users explicitly opt-in to anonymous signal contribution
- Users can opt-out at any time
- No reverse-engineering of individual identity ever possible

### Accumulation Layer
As the Hive grows, it builds the most valuable health and ecological dataset ever assembled:
- Anonymised global symptom library (HiveBodyLog → HiveSymptomSignal)
- Real-time planetary acoustic library (HiveEarth)
- Global wildlife observation library (EarthSense)
- Cross-signal correlation library (all engines → Global Early Warning Meta-Engine)

After 2–3 years of accumulation, this dataset becomes:
- The world's most sensitive pandemic early warning system
- The world's most comprehensive ecological health monitor
- The world's most granular cost-of-illness dataset
- Publishable in Nature, Lancet, Science
- Licensable to WHO, CDC, ECDC, national health ministries
- Cited in every future pandemic preparedness paper

The Hive is not just a clarity layer. It is a living planetary sensor.

---

## PLANETARY INTELLIGENCE ARCHITECTURE NOTE

The Hive is not a collection of engines. It is a passive global sensor network. Every engine, while serving individual users, simultaneously builds anonymised signal libraries:
- HiveBodyLog → pandemic early warning (HiveSymptomSignal)
- EarthSense → ecological health monitoring
- Mycelial Sentinel → soil and ecosystem collapse detection
- HiveWeatherHealth → climate and health correlation
- HiveEarth → full planetary bioacoustic monitoring

These signals feed the Global Early Warning Meta-Engine — the crown jewel of the entire system. The Hive is building the missing layer of planetary intelligence that should have existed for 50 years.

---

## Standard New Engine Pattern
- Next.js + TypeScript
- Anthropic SDK (claude-opus-4-5)
- Tailwind CSS
- Deploy to Vercel
- Domain: enginename.hive.baby
- Cloudflare CNAME → cname.vercel-dns.com
- ANTHROPIC_API_KEY in Vercel environment variables (Production)
- Vercel Deployment Protection: OFF
- Free tier forever, paid features via Stripe
- Full Onboarding Stack implemented (auto-demo, first-visit card, tooltip tour, rotating placeholders)
- Data source credited visibly if using real data
- "No ads. No investors. No agenda." in footer

## How to Work Across Repos from This Codespace
Use GitHub API with the token to read/write/commit to any repo.
For hivebaby after any change, also trigger:
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Mj8SJS4gAlrG2PCXdUCUMmoAQAA3/CfgdTZ1r50"

## Philosophy
- No ads, no investors, no agenda
- Free at base tier forever
- Community first — build what people ask for
- "You are the investor"
- Social experiment, not a startup
- Rate-limiting step is Sonny's creativity, not execution time
- The Hive is a living planetary sensor, not just a clarity layer
- Disaster relief is automatic and permanent — free access in affected regions, always
