# test.hive.baby slot — ParkBack

Paste-ready slot definition for the test.hive.baby engine_slots registry once that surface exists or via manual dashboard edit. Mirrors the 10-item launch checklist structure referenced in `CLAUDE.md` and stubbed in `tools/hive-finalize/checklist.ts:28`.

## Slot metadata

```yaml
id: parkback
name: ParkBack
url: https://parkback.hive.baby
repo: saggarsonny-boop/hivebaby
subdir: apps/parkback
version: v0.1
shipped: 2026-05-04
category: utility
```

## 10-item testing checklist

| # | Test | Pass criteria |
|---|------|----------------|
| 1 | Drop pin (no permission) | Tap Drop pin → browser permission prompt appears |
| 2 | Drop pin (granted) | Pin saved to `localStorage.parkback_pin_v1`; UI flips to find view within 2 s |
| 3 | Reverse-geocode landmark | Within 5 s of pin drop, "near {landmark}" appears (Nominatim) |
| 4 | Photo capture | Tap Take photo → rear camera opens (`capture="environment"`); after capture, thumbnail appears in find view; image is base64 in pin |
| 5 | Voice memo | Tap Record → 30 s cap; playback control appears after stop |
| 6 | Compass calibration (iOS) | First gesture triggers `DeviceOrientationEvent.requestPermission()`; figure-8 hint shows during calibration; arrow goes live within 5 s of waving |
| 7 | Compass north-up fallback | On a desktop browser without orientation events, arrow points to absolute bearing with hint text |
| 8 | Navigate deep-link | iOS opens Apple Maps; Android opens system map chooser via `geo:` |
| 9 | Share spot | Web Share API on mobile / clipboard fallback on desktop with toast "Link copied"; URL includes `utm_source=share&utm_medium=link` |
| 10 | Recipient view | `/find?lat=…&lng=…&t=…&landmark=…` renders distance, bearing, navigate button, and "Get ParkBack for your own car →" CTA pointing back with `utm_source=shared_recipient` |

## Known limitations to note

- Service worker assumes `parkback.hive.baby` root scope — local dev must be at port root, not behind a path prefix
- iOS Safari requires "Add to Home Screen" before `prompt()`-style install banner is offered
- Plausible script blocked by uBlock Origin / Brave shields → events silently dropped (acceptable, no-data fallback)
