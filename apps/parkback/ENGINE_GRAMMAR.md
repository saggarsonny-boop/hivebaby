---
engine: ParkBack
id: parkback
domain: parkback.hive.baby
repo: saggarsonny-boop/hivebaby:apps/parkback
owner: saggarsonny-boop

version: 0.1.0
status: live
tier: 1
schema: parking-spot-pin
stack: [nextjs, typescript]
premium: false

governance: QueenBee.MasterGrappler@pending
safety: enabled
multilingual: enabled
tone: direct, no-nonsense, plain-language

# No LLM in the runtime path — ParkBack is a client-only PWA.
env_vars_required: [NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_PLAUSIBLE_DOMAIN]
onboarding_stack:
  auto_demo: n/a
  first_visit_card: implemented
  tooltip_tour: implemented
  rotating_placeholders: n/a

vercel_project: hivebaby-7c1o
vercel_root_directory: apps/parkback
deployment_protection: off
auto_deploy_branch: main

visibility: public
commercial_surface: none
viral_loop_targets: [share_card]
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
last_audit_at: 2026-05-06
---

# ENGINE GRAMMAR — ParkBack

## Engine Identity
- **Name:** ParkBack
- **Domain:** parkback.hive.baby
- **Repo:** saggarsonny-boop/hivebaby (subdir `apps/parkback/`)
- **Status:** Live (Tier 1)
- **Stack:** Next.js + TypeScript (no AI, no backend, no database)

## Purpose
ParkBack is a client-only PWA that helps you remember where you parked. The
pin, the photo, and the voice memo all live in `localStorage` on the device
that dropped them. Nothing is uploaded. Nothing is synced. The shared spot
link only carries coordinates and a landmark string — never media.

## Inputs
- High-accuracy `getCurrentPosition` (lat, lng, accuracy, altitude, heading, timestamp)
- Optional rear-camera photo (compressed to 800px JPEG @ 0.7)
- Optional 30-second voice memo (webm/opus)
- Live `watchPosition` for distance + bearing while finding the car
- `DeviceOrientationEvent` compass for arrow rotation (with iOS 13+ permission flow)

## Outputs
- A pin saved to `localStorage` under key `parkback_pin_v1`
- A find view with rotating bearing arrow, distance, landmark, elapsed time
- A `Navigate` deep-link: `maps://` on iOS, `geo:` on Android, Google Maps web on desktop
- A shareable URL: `parkback.hive.baby/find?lat=…&lng=…&t=…&landmark=…`
- A read-only `/find` route for recipients of a shared link

## Storage schema (localStorage `parkback_pin_v1`)
```json
{
  "lat": 37.7749,
  "lng": -122.4194,
  "accuracy": 8,
  "altitude": 12,
  "heading": null,
  "timestamp": 1714780800000,
  "landmark": "Market St, SoMa",
  "photo": "data:image/jpeg;base64,…",
  "voiceMemo": "data:audio/webm;base64,…"
}
```

## Network calls
- `nominatim.openstreetmap.org/reverse` — one read on pin drop, no key, no UA header (browser default)
- No other outbound calls. No analytics beyond Plausible. No telemetry.

## Safety
- Permission denial messaging is direct, no corporate language
- Photo + voice memo never leave the source device
- Share link contains only lat/lng/timestamp/landmark
- Service worker caches the shell so the app loads in underground garages with no signal

## Onboarding
ParkBack uses the canonical Hive onboarding stack via `@hive/onboarding`:
- `<HiveInstallHint />` — install banner on home and find views
- `<HiveFirstVisitExplainer />` — under-CTA explainer ("Tap when you park…"); auto-dismissed on first pin drop
- `<HiveAHTSPrompt />` — post-first-action card mounted after the user successfully drops a pin
- `<AppInstalledToast />` — engine-local layout toast (uses ParkBack-specific copy from the strings catalog)

ParkBack-specific body copy is passed via the `customMessage` prop on each
component so the engine retains its dead-zone-focused phrasing while button
labels, ARIA, and dismiss copy localize through the package's bundled
7-locale catalog (en, es, fr, ar, hi, zh, pt).

## Out of scope (v0.1.0)
- Multi-pin history
- Parking timer / meter alerts
- Routing inside the app (we deep-link to maps)
- Anything that requires a backend

## Deployment Notes
- Auto-deploy on push to main
- Cloudflare CNAME → cname.vercel-dns.com
- Vercel Deployment Protection: off
- Required env vars (declared in `env_vars_required` frontmatter):
  - `NEXT_PUBLIC_APP_URL` — canonical URL used in metadata, OG tags, JSON-LD; defaults to `https://parkback.hive.baby` if unset
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — Plausible site domain for analytics; defaults to `parkback.hive.baby` if unset

## Hive-Ops Overrides

```yaml
overrides:
  - rule: V01
    mode: waive
    reason: "ParkBack is an established brand name predating the canonical Hive*/UD* naming convention. CLAUDE.md Naming Standards carves the same exception for WhoTextedMe, QueenBee, and HiveSecretBox."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/86
    reviewer: Sonny
    date: 2026-05-06
  - rule: V18
    mode: waive
    reason: "ParkBack is a single-action parking PWA: no chat interface (auto_demo n/a) and no rotating-placeholder input field (the primary CTA is a single button). The frontmatter declares n/a honestly; V18 treats anything non-implemented as fail, which is overly strict for engine classes that don't need every stack item."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/86
    reviewer: Sonny
    date: 2026-05-06
  - rule: V19
    mode: waive
    reason: "Three of the eight launch checklist booleans are honestly false. test_slot tracks an unfiled hive-testing-station entry. health_check + health_workflow_listed don't apply because ParkBack is a client-only PWA with no backend, no /api/health endpoint."
    issue: https://github.com/saggarsonny-boop/hivebaby/issues/86
    reviewer: Sonny
    date: 2026-05-06
```

## Launch checklist

See **[/docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md](../../docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md)**.
HiveOps audit (`tsx tools/hive-ops/cli.ts parkback`) is the programmatic
gate; current run is the source of truth for `launch_checklist_state` above.

## Waivers

The structured override entries above (`## Hive-Ops Overrides`) are the
canonical waivers consumed by the HiveOps CI workflow. This section is
preserved for human-readable summaries that don't fit the structured
schema; today there are none beyond what's listed in the YAML block.
