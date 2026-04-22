# ENGINE_GRAMMAR — hive.baby Planet

<GrapplerHook>
engine: HivePlanet
version: 1.0.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
</GrapplerHook>

## Engine Identity
- **Name:** hive.baby Planet
- **Domain:** hive.baby
- **Repo:** saggarsonny-boop/hivebaby
- **Status:** Live (Stage 1 complete)
- **Stack:** Static HTML + Three.js + NASA GIBS + HYG star database + CelesTrak TLE

## Purpose
The front door to the Hive ecosystem. A real-time 3D planet Earth rendered in Three.js where every hexagonal cell represents one Hive engine. Live engines glow gold. Clicking zooms in and navigates. The planet is a living map of everything Hive has built and plans to build.

## Inputs
- None (passive viewer)
- Drag / pinch / scroll: rotate and zoom
- Click gold cell: fly-through then navigate to engine
- Click moon: navigate to HiveMoon
- Click Space Station: password prompt → Hive Station

## Outputs
- 3D rotating Earth with real NASA GIBS satellite imagery
- Real star field (HYG database, 88 IAU constellation lines)
- Real moon position and phase (astronomical algorithms, no API)
- Real ISS position (CelesTrak TLE)
- Day/night terminator (real sun position)
- City lights on night side
- Breathing planet (0.2% scale pulse, 4s cycle)
- Three-tier hex cell system: Live (gold) / Building (dim gold) / Planned (outline)
- Patronage cell (amber/copper, links to /patrons)
- Fuzzy natural language search → routes to correct engine
- LCARS sidebar with live stats

## Stage 1 Checklist (complete)
- [x] Real Earth (NASA GIBS cloud imagery)
- [x] Real star field (HYG + 88 IAU constellation lines)
- [x] Real moon position and phase
- [x] Real ISS position (CelesTrak TLE)
- [x] Zoom fly-through animation on engine click
- [x] Breathing planet (0.2% scale pulse, 4s)
- [x] Day/night terminator + city lights
- [x] Patronage cell (amber/copper)

## Stage 2 (queued — do not build yet)
Aurora, lightning, seismic, ocean currents, time controls, ISS live camera, cellbeats, meteor showers, exoplanet markers, Starlink constellation.

## Safety Templates
- All real data cited: "Data: [Source], updated [frequency]"
- No unsafe content on public planet

## Multilingual Ribbon
- Status: pending (search bar localisation)

## Premium Locks
- None (planet is always free)

## UD Design System — Governance Rule
All UD-ecosystem engines (UD Reader, UD Converter, UD Creator, UD Validator, UD Utilities, UD Signer, and all future UD tools) MUST conform to the UD Design System. See CLAUDE.md § "UD Design System" for the full spec. This rule is enforced at the ENGINE_GRAMMAR level. Any UD engine whose PR does not conform must be rejected and corrected before merge. No exceptions.

## Governance Inheritance
- Governed by: QueenBee.MasterGrappler (pending)
- Safety level: standard
- Tone: neutral

## API Model Strings
- No LLM on the planet itself
- CelesTrak: https://celestrak.org/SOCRATES/query/SAT-ID/25544/TLE/ (ISS TLE)
- NASA GIBS: https://gibs.earthdata.nasa.gov/

## Deployment Notes
- Vercel: deploy hook `curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_Mj8SJS4gAlrG2PCXdUCUMmoAQAA3/CfgdTZ1r50"`
- Domain: hive.baby → www.hive.baby redirect
- Static HTML — no build step
