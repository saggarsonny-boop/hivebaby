# ENGINE GRAMMAR — ParkBack

<GrapplerHook>
engine: ParkBack
id: parkback
version: 0.1.0
governance: QueenBee.MasterGrappler
safety: enabled
multilingual: pending
premium: false
status: building
tier: 1
schema: parking-spot-pin
stack: [nextjs, typescript]
</GrapplerHook>

## Engine Identity
- **Name:** ParkBack
- **Domain:** parkback.hive.baby
- **Repo:** saggarsonny-boop/hivebaby (subdir `apps/parkback/`)
- **Status:** Building (Tier 1)
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
- No other outbound calls. No analytics. No telemetry.

## Safety
- Permission denial messaging is direct, no corporate language
- Photo + voice memo never leave the source device
- Share link contains only lat/lng/timestamp/landmark
- Service worker caches the shell so the app loads in underground garages with no signal

## Onboarding
- Drop-pin button is the entire onboarding for the parking flow
- First-visit copy: "Find your car. No accounts. No cloud."
- Footer on every screen: "No ads. No investors. No agenda."

## Out of scope (v0.1.0)
- Multi-pin history
- Parking timer / meter alerts
- Routing inside the app (we deep-link to maps)
- Anything that requires a backend

## Launch checklist

See **[/docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md](../../docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md)** for the canonical Hive engine finalization checklist. ParkBack has been audited against it; current waivers are tracked below.

## Waivers

- *(None at v0.1 — audit on file in the canonical checklist PR.)*
