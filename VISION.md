# HIVE VISION — Full Ecosystem Reference

## Planet Cell System — Redesigned 2026-04-19

**Status:** DEPLOYED — hive.baby

Three-tier hex cell system live on planet:
- **Tier 1 (Live):** Full gold border ring + dark fill + emoji icon + white label. 3.4s pulse. Click navigates. 12 engines including QB surrounds.
- **Tier 2 (Building):** 50% gold border, 6.4s pulse, "Coming soon" tooltip on click. 6 engines.
- **Tier 3 (Planned):** Dark gold outline, no pulse, "Vote for this engine" tooltip. 20 engines.
- **Queen Bee:** Center front-facing cell, larger hex, constant bright gold shimmer, gold radiating lines + dots to 6 neighbours.
- Each cell: two-mesh architecture (border ring + dark fill #0d1117) matching reference image.
- 38 total engines mapped from VISION.md.

---

## Space Station — LIVE at station.hive.baby

A password-protected internal ops hub. Password: hivebees. Dark space aesthetic, twinkling stars.

**Domain:** station.hive.baby — CNAME live, Vercel project deployed
**Repo:** hive-station (saggarsonny-boop/hive-station)
**Auth:** Session-storage password gate (hivebees)
**Contains (v1):**
- Creator Console → creator-console-steel.vercel.app
- Queen Bee → queen-bee-v1.vercel.app
- Hive Engine Builder → heb.hive.baby
- Stats → creator-console-steel.vercel.app/dashboard
- LOCK button to re-secure

**Planet integration (planned):** Small ISS-style station mesh in orbit, clicking opens password modal rather than fly-through.

---

## HiveAdminSupport — BUILT, awaiting deploy

Auto-acknowledge + Claude-generated reply to all inbound support email.

**Domain:** support.hive.baby — CNAME live, Vercel project created, **deploy pending quota reset 2026-04-19 15:20 UTC**
**Repo:** hive-support (saggarsonny-boop/hive-support)
**Webhook endpoint:** POST /api/inbound (Resend inbound email webhook)
**Flow:**
1. Email arrives at hive@hive.baby or press@hive.baby
2. Resend forwards to support.hive.baby/api/inbound
3. Enterprise keywords detected (NHS, government, procurement, ministry, contract, etc) → holding response: "This has been noted and will receive personal attention."
4. All other emails → Claude claude-opus-4-5 generates warm, Hive-voice response (3-5 sentences)
5. Reply sent via Resend from hive@hive.baby
6. Logged to Neon DB: sender, subject, body_preview, response_sent, flagged, flag_keywords

**Required Vercel env vars (add to hive-support project):**
- ANTHROPIC_API_KEY
- RESEND_API_KEY
- DATABASE_URL (Neon)

**Required Resend config:** Set up Resend inbound email routing → support.hive.baby/api/inbound

---

## Typography Standard (all engines)

- **Display/headings:** Syne 600, 700 — engine names, hero text, nav wordmarks
- **Body:** DM Sans 300, 400, 500 — paragraphs, descriptions, UI text
- **Monospace/data:** DM Mono 400, 500 — labels, badges, code, stats, metadata

Google Fonts: `family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500`

CSS variables (in globals.css of every engine):
```css
--font-display: 'Syne', sans-serif;
--font-body: 'DM Sans', sans-serif;
--font-mono: 'DM Mono', monospace;
```

Deployed: hivefield, hiveclock, hiveclarity, hivestrengthmastery, hivebodylog, hivemoon, whotextedme, queen-bee, creator-console, station, converter, creator, validator, ud-landing, ud-reader.
Not yet deployed: secret-box (no globals.css — uses inline styles), hive-strength-mastery (already had Syne).

---

## Shared UI Components (deployed to all live engines)

**HivePlanetButton** — Rotating 🌍 emoji (22px, 12s spin) in top-left nav, links to hive.baby. CSS: `@keyframes hive-planet-spin` + `.hive-planet` class in globals.css. Deployed: hivefield, hiveclock, hiveclarity, hivestrengthmastery, hivebodylog, hivemoon, whotextedme, converter, secret-box.

**HiveFooter** — Tagline: "Free forever. No ads. No investors. You are the investor." Links: hive.baby | Patronage | Feedback (mailto:hive@hive.baby). Deployed to all above engines.

This file is the source of truth for engine specs, pipeline designs, adoption architecture, revenue model, and future build plans. Claude reads this when context is needed beyond daily execution.

---

## Revenue Philosophy

- Zero advertising. Ever.
- Revenue: optional support (Stripe), Pro tier subscriptions, enterprise API licensing, institutional subscriptions, patronage.
- Every engine page: "No ads. No investors. No agenda." in footer.
- Free: enough to be genuinely useful daily. Pro ($9/month or $90/year): amplification, never gating core value.
- Safety-critical info (drug recalls, food hygiene, vehicle recalls) always free.
- We never sell user data. Anonymous aggregate signals only with explicit opt-in.

### Revenue Streams
1. Optional support (Stripe — $1.99/month, $19/year, $5 one-time)
2. Pro tier ($9/month or $90/year per engine)
3. Enterprise/institutional API licensing (explicit opt-in only)
4. Institutional subscriptions (schools, hospitals, NGOs, governments)
5. Patronage (foundations, philanthropists)
6. Data commons licensing (anonymised aggregate signals, ethical charter, explicit opt-in)

### Disaster Relief Protocol
During declared disasters (WHO, UNDRR, national agencies) in affected regions: all Pro features unlock free, all subscriptions renew free, NGO/emergency dashboards activate at no cost. Automatic, non-negotiable, permanent.

---

## Patronage System

### /patrons page
- Dark Hive aesthetic, dignified
- Headline: "The people who keep Hive free"
- Subline: "Hive is built by one person. It stays free because of these."
- Each patron: name/org, one-line reason, vector logo, website link
- Tiers: Engine Patron ($10k/year), Platform Patron ($50k/year), Founding Patron ($250k+)
- "Patrons have no influence over what we build, how we build it, or what we say."
- Target: Gates Foundation, Wellcome Trust, Rockefeller Foundation, WHO Foundation, national health agencies
- Footer links: About · Contribute · Patrons · Privacy

---

## Planet Stage 2 (queued — do not build yet)
- Aurora: NOAA Space Weather API — real geomagnetic storm data at poles
- Lightning: Blitzortung.org — real-time global strikes as surface flashes
- Seismic: USGS Earthquake feed — ripple animations
- Ocean currents: NASA PODAAC — animated flow lines
- Time controls: slider to move time forward/backward
- ISS live camera: picture-in-picture NASA stream when ISS visible
- Cellbeats: engine cells pulse at rate driven by real usage analytics
- Meteor showers: NASA CNEOS fireball API + real shower calendar
  - Perseids Aug 11–13, Leonids Nov 17–18, Geminids Dec 13–14
  - Fireball URL: https://ssd-api.jpl.nasa.gov/fireball.api
  - Outside showers: random meteors every 3–5 minutes; streak 2–3s, glowing head, fading tail
- Exoplanet markers: NASA Exoplanet Archive — stars with confirmed planets
- Starlink constellation: CelesTrak TLE tiny moving points

## First-Visit Guided Orbit (queued — build after Stage 1)
On first visit (localStorage, never repeats), after welcome card:
- Camera slowly orbits planet once over ~12 seconds
- Pauses 1.5s on each live (gold) engine cell
- Engine name fades in/out during pause
- Returns to default position; normal interaction resumes

---

## Complete Engine Index

### I. Core Governance & Meta-Engines

**Queen Bee (QB)** — Sovereign governance engine. Enforces grammar, safety, metadata, multilingual rules, pattern-bound reasoning across all engines. Contains Master Grappler, premium locks, compliance grammar, inheritance system.

**Master Grappler / Grappler Hook** — Metadata enforcement. Every engine output structured, safe, QB-compliant.

**Hive Access Engine** — Enterprise access, billing, permissions, API key, licensing. Built into QB.

**HiveAdmin** — Admin control panel for engines, users, permissions, billing, governance.

**HiveAPIAssessor** — Compliance/safety evaluator for external APIs before integration.

**HiveCustomerSupport** — Governed support engine. Consistent, emotionally safe, multilingual.

**Creator Console** — Private master dashboard for Sonny. Live at creator-console-steel.vercel.app.

---

### II. Document & Knowledge Engines

**Universal Document (UD)** — Next-gen document format replacing PDF. AI-native, semantic, revocable, expiring, multilingual (MLLR), audience-adaptive clarity layers, chain of custody, provenance. NOT executable. Repo: universal-document. Domain: ud.hive.baby (landing BUILT, awaiting deploy — Vercel daily limit hit 2026-04-18, auto-deploys on reset). iSDK: free <400KB embeddable reader. Planet cell: single "Universal Document" gold cell → ud.hive.baby. Whitepapers: 3 .uds files in repo/whitepapers/.

**UD Ecosystem — app status (2026-04-18):**
- **UD Hub (ud.hive.baby)** — Landing built (apps/landing). CNAME live. Deploy pending Vercel limit reset.
- **UD Converter (converter.hive.baby)** — LIVE. Converts DOCX/TXT/MD → .uds (iSDF v0.1.0). CNAME confirmed.
  **Pro tier scaffold BUILT (deploy pending Vercel quota reset 2026-04-19 15:20 UTC):**
  - Free: 5 files/day (IP-rate-limited in Neon), 10MB max
  - Pro ($29/mo, $249/yr via Stripe): unlimited, batch ZIP, API key, chain of custody
  - Enterprise: contact form → hive@hive.baby
  - Pages: /pricing, /pro (API key dashboard)
  - APIs: /api/checkout, /api/webhook, /api/api-key, /api/batch, /api/convert (updated)
  - Required Vercel env vars: STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY, STRIPE_WEBHOOK_SECRET, DATABASE_URL
  - Stripe webhook endpoint: https://converter.hive.baby/api/webhook
  - Stripe customer portal link in /pro (update the billing.stripe.com URL once you have a live Stripe account)
- **UD Reader** — LIVE at universal-document.vercel.app. Cross-linked to converter.
- **UD Creator (creator.hive.baby)** — BUILT v0.2 (apps/creator). Contenteditable rich text (Bold/Italic/Link toolbar, execCommand), cloud save via magic-link auth (Neon: creator_sessions, creator_magic_links, creator_documents), My Documents panel (load/delete/new). Exports valid iSDF v0.1.0 with html+text fallback in base_content. CNAME live. Deploy pending Vercel quota reset.
  - v0.2 roadmap (pending deploy confirm): Pro tier Stripe gating, UDZ export, Early Access banner, planet cell
- **UD Validator (validator.hive.baby)** — BUILT (apps/validator). Upload .uds → verify structure, show schema version/encryption/expiry/signature/language count/word count. CNAME live. Deploy pending.
- **UD Signer** — PLANNED (iSDF v0.2). Cryptographic signing, tamper-evident revocation.

---

## UD LAUNCH ITINERARY

### IMMEDIATE — THIS WEEK
- [ ] WY C Corp formation (Sonny action — online via Wyoming Secretary of State, ~$100)
- [ ] IP Agreement: Sonny personally licenses all UD IP to WY C Corp. One-page document. Attorney-as-correspondent approach: attorney's details on cover letter only — Sonny signs everything directly. USPTO allows this. Keeps filing costs low.
- [ ] USPTO trademark: "Universal Document" wordmark + UD logo, class 42. File in Sonny's name. WY C Corp listed as exclusive licensee. Assign to Corp post-formation.
- [ ] USPTO certification mark: "UD Certified" mark. Attorney-as-correspondent. Compliance standards statement drafted by Sonny, reviewed by attorney.
- [ ] IP licensing: WY C Corp licenses UD IP to Sonny (UAE entity) for international use. UAE entity collects international revenue. Transfer TM + CM registrations to UAE entity on expatriation (target 2028).
- [ ] Apache 2.0 license + NOTICE file applied to iSDK repo. NOTICE text: "Implements the Universal Document specification. Specification by Sonny Saggar MD. ud.hive.baby"
- [x] UD logo SVG (#1e2d3d slate, white Georgia serif letterforms) deployed to all UD properties — converter, reader, creator, validator, landing
- [ ] Add IP/TM footnote to white paper final version
- [ ] Stripe products created for Converter Pro ($29/mo, $249/yr)
- [ ] Converter Vercel env vars added after quota reset 15:20 UTC Apr 19
- [ ] HiveAdminSupport env vars + Resend inbound routing after quota reset
- [ ] UDZ spec paragraph added to white paper section 3.2
- [ ] Blockchain provenance paragraph added to white paper section 3.2
- [ ] Document Formatology sentence added to white paper closing

### WEEK 1 — ENGINES BEFORE LAUNCH
- [ ] Target 20 live engines on planet, all with HiveFooter + HivePlanetButton
- [ ] Quiet deploys only — no announcements
- [ ] UD ecosystem fully live: Reader, Converter (with Pro tier), Validator, Creator (on deck messaging)
- [ ] Converter Pro Stripe fully wired
- [ ] ud.hive.baby/certified — live page: explains UD Certified mark, shows badge SVG + download link, QB auto-responds with badge files + PDF compliance checklist, logs applicant email to Neon

### WEEK 2 — WHITE PAPER LAUNCH
- [ ] White paper final version complete
- [ ] Published to SSRN (Sonny Saggar MD, DOI assigned)
- [ ] Deposited at Internet Archive
- [ ] ud.hive.baby/whitepaper — live page with Reader embed + UDS download of the white paper itself
- [ ] LinkedIn announcement post

### WEEK 3 — SECTORAL BRIEFS
- [ ] Healthcare brief — LinkedIn day 1
- [ ] Judicial brief — LinkedIn day 2
- [ ] Mobile/OEM brief — LinkedIn day 3
- [ ] Enterprise brief — LinkedIn day 4
- [ ] Government brief — LinkedIn day 5
- [ ] Archive/preservation brief — LinkedIn day 6
- [ ] All briefs simultaneously on Medium and Substack
- [ ] Press release on SSRN and LinkedIn

### WEEK 4 — OUTREACH
- [ ] Siim Sikkut private note sent
- [ ] iSDK download page live: ud.hive.baby/isdk
- [ ] OEM outreach email template finalized
- [ ] Enterprise pricing page live
- [ ] UD Creator full launch

### ONGOING
- [ ] Stripe revenue routed to WY C Corp bank account
- [ ] IP agreement maintained and updated as new IP created
- [ ] Trademark renewals: USPTO requires maintenance filings
- [ ] 2028: transfer TM + CM registrations to UAE entity
- [ ] Planet DAU data wired to cell pulse animation
- [ ] Space Station expanded as admin tools grow

---

**MLLR (Multilingual Language Ribbon)** — Enterprise translation layer in UD. One document, any language. NOT "Machine Learning Legal Reasoner" — naming error, ignore that.

**OKSign** — Governed signing with audit trails, chain-of-custody, multilingual compliance.

**HiveDocument / HiveDoc** — Governed doc-generation with metadata, signatures, auditability.

**HiveArchive** — Long-term storage for governed documents, logs, metadata.

**HiveWriter** — Governed writing engine, structured, safe, multilingual.

**HiveClarity** — LIVE at hiveclarity.hive.baby. Transforms messy input into structured, decision-ready output.

**HiveDaily** — Daily logs, rituals, tasks, clarity routines.

**HiveConverter** — Format/structure transformation. UD conversion gateway (PDF→UD, DOCX→UD).

**HiveResizer** — Media resizing, cropping, reformatting.

---

### III. Creative, Media & Broadcast Engines

**Gary Gansson** — AI talk show host. West London accent, warm, curious. Pico the parrot sidekick. "Well done." Pixar-adjacent (warm gold, teal shirt, charcoal jacket). 24/7 simulcast: YouTube, TikTok, podcasts, Twitch. Part of HiveTV.

**HiveTV** — Full AI broadcast platform. Gary + daily cast: news anchors, weather, science teacher, storyteller. Repo to create: hive-tv.

**HiveStudio** — UI, branding, visual creation, video generation.

**HiveSpeak** — Speech-generation and voice output.

**HiveTranslate** — Multilingual translation using MLLR.

**HiveMusic** — Audio generation for soundtracks, voiceovers, branding.

**HiveExtremeSports** — High-adrenaline sports content, commentary, scenarios.

**Meme Engine** — Viral memes, cultural loops, infinite content. Highest NOI engines. ~6hr build.

---

### IV. Identity, Social & Emotional Engines

**Taboo Cluster (8 Engines)** — Highest NOI-per-hour: Confession, Secret, Shame, Desire, Regret, Forgiveness, Boundary, Emotional Debris. Viral, universal, low friction.

**Secret Box** — LIVE at secret-box-vert.vercel.app. Live Secret engine instance. HivePlanetButton + HiveFooter deployed.

**Universal Family** — 12 universal engines as tiles on home screen. Baseline engagement.

**HiveIdentify** — Identity modeling: preferences, roles, emotional patterns. Powers personalisation.

**HiveEmoteSense** — Emotional sensing from text or multimodal input.

**Activity Partner** — Adoption amplifier. Shared activity matching and accountability.

**Pet Familiar** — AI companion. Adoption amplifier, high retention.

---

### V. Training & Simulation Engines

**HiveField** — LIVE at hivefield.hive.baby. Multi-step branching scenarios for any profession. Coach evaluates full arc. Free-text profession input.

**Field Engine (core)** — Architecture underlying HiveField.

**HiveSim** — Simulation for training, modeling, scenarios.

**HiveStrength** — LIVE at hivestrengthmastery.hive.baby. AI strength and fitness coaching.

---

### VI. Sensory, Perception & Multimodal Engines

**HiveOptical** — Visual perception: images, diagrams, visual data.

**HiveAirSense** — Air quality, VOCs, environmental signals.

**HiveHomeSense** — Home environment: safety, monitoring, automation.

**HiveWalkSafe** — Personal safety: surroundings, risk, movement.

**HiveSleepSense** — Sleep pattern analysis.

**HiveFocus** — Cognitive performance: attention, distraction, productivity.

**HiveMaps** — Governed spatial reasoning and mapping.

**HiveClock** — LIVE at hiveclock.hive.baby. The world's most humane clock. Analog/digital, AI faces, world time, prayer times.

---

### VII. Enterprise, Compliance & Industry Engines

**Hive Engine Builder (HEB)** — LIVE at heb.hive.baby. Designs and deploys new engines.

**WhoTexted** — LIVE (original standalone JS).

**WhoTextedMe** — LIVE at whotextedme.hive.baby. Rebuilt as Next.js. Free reverse phone lookup: carrier, line type, location via AbstractAPI (free tier) with libphonenumber-js local fallback. Repo: whotextedme. Env var: ABSTRACTAPI_KEY. HivePlanetButton + HiveFooter deployed. Planet cell added.

**HiveAdmin** — Admin control panel for enterprise operators.

---

### VIII. The 8 Appliances (100–120hr engines)
1. Compliance Appliance — rules, policies, regulatory frameworks
2. Prediction Appliance — forecasting, outcomes, risk probabilities
3. Workflow Appliance — tasks, approvals, processes
4. Decision Appliance — structured decisions from messy inputs
5. Document Appliance — large-scale generation and management
6. Routing Appliance — governed task/document pathways
7. Audit Appliance — full audit-trail, chain-of-custody
8. Risk Appliance — risk analysis, exposure, mitigation

### IX. The 8 Protocols (100–120hr governance)
1. IoT Protocol — device communication, metadata, safety
2. Chain of Custody Protocol — ownership, signatures, document lineage
3. Multilingual Ribbon Protocol — translation and multilingual governance
4. Compliance Protocol — safety and governance across engines
5. Prediction Protocol — forecasting, uncertainty, risk propagation
6–8. Additional metadata, safety, industry-specific layers

### X. Hardware-Adjacent Engines

**Preston Cluster (HiveDroid)** — Autonomous agents: scanning, monitoring, multimodal reasoning. Includes HiveScoutDrone and HiveBrowser. "Preston" in Hive context = HiveDroid cluster.

**PanScan (formerly Tricorder)** — Multimodal scanning device: 48–80 modalities.

**The Nose** — VOC-based smell-sensing device.

**TriSense** — Future hardware sensor suite.

### XI. Marketplace & Economics

**HiveMarketplace** — Public marketplace for engines, templates, content.

**HivePricing / PPP Pricing Engine** — Adjusts cost by purchasing power parity.

**Trust Mesh V1** — Universal matching and micro-contract. Economic virality pillar.

**Viral Adoption Loop** — Growth engine using emotional virality and social loops.

### XII. Special Engines

**De-Extinction Engine** — Models extinct, extant, synthetic species. Education, creativity.

**Attention Engines** — Family capturing, directing, modulating user attention.

---

## Adoption Amplifier Suite (Ranked by Power)

### Tier 1 — Dominant (exponential growth)
1. Universal Input to Universal Output
2. Global Language Agnosticism — 200+ languages, dialect-aware, auto-detection
3. Activity Partner — companion, not chatbot; behavioural anchor
4. Anticipation Module — predicts next need, subtle, non-intrusive

### Tier 2 — High Impact (daily use and virality)
5. Pet Familiar — emotional anchor, travels with user across engines
6. Free Text Box with Rotating Faded Examples
7. Voice Input and Output
8. One Screen Only — no menus, no settings, no friction
9. Screenshot Ready Output — clean, shareable, virality-optimised
10. Daily Frequency Above 95%

### Tier 3 — Structural
11. AI Native Schema, Process, Metadata
12. Grappler Hook to QueenBee.MasterGrappler
13. Multimodal Input — text, voice, images, gestures, location, time
14. Multi Profession and Multi Level
15. Offline and Near Offline Resilience
16. Zero Data Retention — no accounts, no tracking
17. Micro Delight Layer — animations, seasonal skins, ambient sounds
18. Universal Need Alignment
19. Viral Simplicity — understood in 1 second, usable in 3
20. Build Time Under One Hour

### Tier 4 — Supporting
21–27: Zero Governance, Zero Backend, No Settings, No Menus, No Learning Curve, Emotional Stability, Cross Engine Continuity

---

## Pipeline Engines — Real Data Series (do not build yet)

Each follows the standard engine pattern. Pro tier adds amplification; safety info always free.

### Health Intelligence

**HiveMedSearch** — PubMed E-utilities (NIH, free). Any symptom/condition/medication → summaries of peer-reviewed research. Free: 3/day, top 3 papers. Pro: unlimited, HiveBodyLog integration.

**HiveDrugSafety** — OpenFDA (free). Real FDA adverse event data for any medication combination. Free: single lookups, top 5 events, basic recall alerts. Pro: multi-drug interaction, personalised alerts. Life-saving: CRITICAL.

**HiveWeatherHealth** — Met Office DataPoint (UK), NOAA (US), OpenAQ. Location-based health weather: pollen, UV, air quality, pressure, humidity. Free: daily summary, 3-day. Pro: personalised alerts from HiveBodyLog.

**HiveBodyLog** — LIVE at hivebodylog.hive.baby. Single screen health story. HivePlanetButton + HiveFooter deployed. Free text symptoms, patterns surfaced over time without diagnosing. Structured timeline, gentle flags, one-minute clinician summary PDF. Non-diagnostic, non-prescriptive.

**HiveBodyLog Free (forever):** Unlimited personal logging, magic link auth, basic AI pattern analysis, share function, export.

**HiveBodyLog Pro ($9/month or $90/year):** Family profiles (multiple people under one account), Apple Health + Google Fit import, wearable sync, community anonymised pattern benchmarking, advanced AI coaching, clinician-grade export in UD format, custom sharing templates, priority support.

**Trisense Calculator** — Pipeline: trisense.hive.baby. BMI/body composition viral loop that feeds into HiveBodyLog. Google Fit OAuth integration buildable now (no Mac required).

### Financial Intelligence

**HiveCompanyCheck** — Companies House (UK), OpenCorporates, SEC EDGAR. Plain-language company summary, director history, red flags. Free: basic profile. Pro: full accounts, CCJ alerts.

**HiveSEC / HiveEDGAR** — SEC EDGAR. Any US public company: revenue, debt, risk factors, insider trading. Free: latest annual summary. Pro: trend analysis, alerts.

**HiveDueDiligence** — Combo: HiveCompanyCheck + HiveSEC + court records + news. Full due diligence in minutes. Free: basic profile. Pro: full report PDF, monitoring.

### Property Intelligence

**HiveLandRegistry** — Land Registry UK (free). Every UK property transaction since 1995. Free: last 3 sales. Pro: full history, planning, flood risk.

**HivePropertyIntel (US)** — HUD, Census Bureau, ATTOM, Fannie Mae. Area intelligence, affordability trends. Free: neighbourhood scorecard. Pro: investment analysis, 5-year trend.

### Legal & Civic

**HiveCourts** — PACER, CourtListener, The Gazette. Court records for any person/company. Free: basic search, 3 results. Pro: full results, alerts.

**HiveMP / HivePolitics** — Hansard, TheyWorkForYou, Congress.gov. What has your representative actually done? Free: last 5 votes. Pro: full history, alerts.

**HiveCharity** — Charity Commission (UK), IRS 990 via ProPublica. Is this charity legitimate? Overhead ratio? Free: basic profile. Pro: trend analysis.

### Consumer Safety

**HiveHygiene** — Food Standards Agency (UK, free). Hygiene ratings for any restaurant/café.

**HiveVehicle** — DVLA (UK), NHTSA (US), DVSA MOT history. Full vehicle history from number plate. Undercuts HPI Check — data is free.

**HiveRecall** — NHTSA, DVSA, FDA, CPSC. Product recalls for cars, medications, food, baby equipment. ALWAYS FREE — no Pro gating on safety.

---

## Pipeline Engines — Ecological Intelligence Series (do not build yet)

**EarthSense** — Unified nature literacy. Multi-category ID: mushrooms, trees, insects, clouds, rocks, birds, tracks, lichen, soil. Offline-capable. Nature Journal, seasonal quests, Nature MMO. APIs: iNaturalist, GBIF, Cornell eBird, Xeno-canto, NASA, NOAA. Domain: earthsense.hive.baby. Schools: $499/month.

**HiveSymptomSignal (The Pandemic Canary)** — Aggregates anonymised HiveBodyLog signals globally. At 50M users would have detected COVID-19 weeks early. Detects clusters before traditional surveillance. APIs: HiveBodyLog (opt-in), WHO, CDC, ECDC.

**Mycelial Sentinel Engine** — Citizen fungal health monitoring. Weekly photo of any fungal growth → world's first global fungal health map. Fungi signal ecosystem stress before anything else. Domain: mycelial.hive.baby.

**HiveEarth (The Dr Dolittle Engine)** — Listens to the planet. Acoustic, biological, ecological signals → early warning of ecosystem stress. APIs: Rainforest Connection, Cornell eBird, NOAA PMEL, iNaturalist, Xeno-canto.

---

## Global Intelligence Engines (do not build yet — 100 engines)

Build after: core planet, Queen Bee, UD, Activity Partner.

Individual: $1/year. Enterprise: $1k–$100k Year 1, $10k–$250k Year 2+. Governed automatically via QB.

### Early Warning Cluster
1. Global Early Warning Meta-Engine — aggregates all engines into one planetary risk signal (crown jewel)
2. Wastewater Sentinel — CDC NWSS, ECDC
3. Health Behavior Engine — WHO, CDC, ECDC
4. Animal Health Sentinel — OIE/WOAH, FAO EMPRES
5. Satellite Anomaly Engine — NASA, ESA
6. Supply Chain Stress Engine — AIS, UNCTAD, WTO
7. Misinformation & Panic Engine — public RSS, social signals
8. Environmental Stress Engine — NOAA, NASA, ESA, FAO

### Environmental Cluster (9–20)
Air Quality, Fire & Heatwave, Flood Risk, Drought Risk, Ocean Stress, Glacier & Ice Melt, Deforestation, Biodiversity, Water Stress, Desertification, Soil Degradation, Coral Reef Stress. APIs: NASA, ESA, NOAA, FAO, IUCN, Copernicus, Global Forest Watch.

### Disaster & Risk Cluster (21–27)
Earthquake (USGS), Volcano (Smithsonian GVP), Tsunami (NOAA PTWC), Landslide (NASA/USGS), Disaster Risk (UNDRR), Heatwave Mortality (WHO/NOAA), Cold Wave Mortality (WHO/NOAA).

### Food & Agriculture Cluster (28–35)
Food Security (FAO/USDA/FEWS NET/WFP), Food Price (FAO Index/World Bank), Agricultural Yield, Crop Disease, Fisheries, Fisheries Collapse, Fertilizer Stress, Forestry.

### Economic & Financial Cluster (36–44)
Economic Stress, Inflation, Financial Stress, Commodity Price, Currency Volatility, Banking Stress, Trade Flow, Unemployment Stress, Consumer Price. APIs: IMF, World Bank, OECD, BIS, WTO, UNCTAD, ILO.

### Property & Housing Cluster (45–48)
Global Housing Affordability, Global Rent Stress, HiveLandRegistry UK, HivePropertyIntel US.

### Health Intelligence Cluster (49–58)
HiveMedSearch, HiveDrugSafety, HiveWeatherHealth, Global Disease Burden (WHO GBD/IHME), Mental Health Stress, Medication Shortage, Vaccine Coverage, Antibiotic Resistance (WHO GLASS/CDC), ICU Stress, Hospital Capacity.

### Governance & Social Cluster (59–68)
HiveMP UK, HiveCongress US, Corruption & Governance (TI/World Bank), Human Rights (UNHCR/Amnesty/HRW), Political Instability (ACLED), Protest & Civil Unrest (ACLED/GDELT), Conflict (ACLED/UCDP/SIPRI), Border Conflict, HiveCharity UK, HiveCharity US.

### Legal & Corporate Cluster (69–74)
HiveCompanyCheck, HiveSEC/EDGAR, HiveEU (EU Open Data), HiveDueDiligence, HiveCourts UK, HiveCourts US.

### Consumer Safety Cluster (75–78)
HiveFoodSafety, HiveAutoSafety, HiveRecall, HiveLabourRights.

### Transport & Infrastructure Cluster (79–86)
Shipping Lane Risk, Port Congestion, Energy Grid, Blackout Risk, Internet Outage (RIPE NCC/Cloudflare Radar), Road Safety, Aviation Safety, Maritime Safety.

### Population & Demographics Cluster (87–92)
Migration Pressure, Refugee Flow (UNHCR), Poverty & Inequality, Birth Rate, Literacy, Education Attainment.

### Specialist Cluster (93–100)
Global Cycle Engine (Ray Dalio engine for the planet), Global UAP/UFO Clarity (NUFORC/MUFON/NASA/DoD/GEIPAN), Cyber Threat (CERT/NIST/CISA), Addiction & Substance Use, Workplace Injury, Ocean Acidification, Biodiversity Loss, Antimicrobial Resistance.

### Citation Format (all Global Intelligence Engine outputs)
```
[Engine Name]. ([Year]). Multisource meta-analysis of [domain]. The Hive Clarity Substrate. https://hive.baby/[engine-subdomain]
```

---

## Hive Passive Sensor Network (do not build yet)

Every engine while serving users simultaneously builds anonymised global signal libraries.

**Anonymisation Rules:**
- No personal data ever leaves the engine
- Anonymised at source, city-level minimum (never street/postcode)
- Aggregation threshold: minimum 100 users per signal
- Explicit opt-in, opt-out any time
- No reverse-engineering of individual identity possible

**Accumulation Layer:**
- HiveBodyLog → HiveSymptomSignal (pandemic early warning)
- HiveEarth → planetary acoustic library
- EarthSense → global wildlife observation library
- All engines → Global Early Warning Meta-Engine

After 2–3 years: world's most sensitive pandemic early warning system, most comprehensive ecological health monitor. Publishable in Nature, Lancet, Science. Licensable to WHO, CDC, ECDC.

The Hive is not a collection of engines. It is a living planetary sensor.
