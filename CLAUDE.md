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
hivebaby deploy hook: curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_abTaG41xhWQ8kCm4dqT44fn6NQY0/hNU7KkMpOW"

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

## hive.baby Planet — THE FRONT DOOR
The homepage is a Three.js 3D planet covered in hexagonal cells.
- Each cell = one Hive engine
- Live engines glow gold with pulse animation
- Coming soon engines = faded grey
- Empty cells = random 3-letter placeholder codes
- Planet spins, user can drag/zoom/pinch
- Fuzzy natural language search ("help me practice my job" → HiveField)
- Clicking a cell navigates to that engine's URL
- Planet should feel alive — glow intensity will eventually correlate with MAU/DAU
- Every subdomain should also have a search box linking back to planet

### Planet TODO (current priority)
1. Fix black screen / Three.js not rendering bug
2. Add support section: "Support Hive" with Stripe links
   - $1.99/month: https://buy.stripe.com/14A6oJ6Mv3sReEa0YV0RG00
   - $19/year: https://buy.stripe.com/7sYcN79YHe7v53AcHD0RG01
   - $5 one-time: https://buy.stripe.com/9B6aEZ7Qzd3rcw2bDz0RG02
3. Add Idea Box: "Got an idea for an engine?" with text field
4. Add Feedback Box: "Feedback on an existing engine?" with text field
5. Social experiment copy: "Hive is a social experiment. You are the investor. We build what you ask for. No ads. No investors. No agenda. Free forever."

## Build Priority Order
1. Finish hive.baby planet (fix + support links + idea/feedback boxes)
2. Queen Bee (governance layer — keeps everything coherent as engines multiply)
3. Universal Document / UD (formerly HDF — see UD section)
4. Gary Gansson + HiveTV (AI broadcast character + platform)
5. Additional engines per the master index below

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

## How to Work Across Repos from This Codespace
Use GitHub API with the token to read/write/commit to any repo.
For hivebaby after any change, also trigger:
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_abTaG41xhWQ8kCm4dqT44fn6NQY0/hNU7KkMpOW"

## Philosophy
- No ads, no investors, no agenda
- Free at base tier forever
- Community first — build what people ask for
- "You are the investor"
- Social experiment, not a startup
- Rate-limiting step is Sonny's creativity, not execution time
