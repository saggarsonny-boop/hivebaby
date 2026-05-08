# HiveAestheticBestie — test station slot

Engine: **HiveAestheticBestie**
Domain: `hiveaestheticbestie.hive.baby`
Launch: 2026-05-08 (canonical schema migration PR #119)
Owner: saggarsonny-boop
Status: live · listed · public

## Smoke checklist

Run from a real iOS Safari and a real Android Chrome session before any
visible-surface PR ships:

- [ ] Page loads on hiveaestheticbestie.hive.baby (no auth gate, no 404)
- [ ] Selfie upload → palette generation succeeds with the fallback
      template even if the AI route is rate-limited
- [ ] Vibe-text → AI analysis succeeds for at least one short prompt
- [ ] First-visit explainer renders once per fresh session
- [ ] Install hint banner renders on Android Chrome (programmatic
      `beforeinstallprompt`) and on iOS Safari (guided overlay)
- [ ] Hive header logo links to https://hive.baby
- [ ] Hive footer signature ("Made with ♥ in the Hive") visible
- [ ] /api/health returns 200 with `status: "ok"`
- [ ] manifest.json reachable; favicon set complete

## Notes

- Aesthetic analysis privacy: selfie bytes are sent to Anthropic only
  when the user explicitly invokes AI analysis. The local template
  fallback is the default first response — no network round-trip.
- No PII storage. No accounts. localStorage keys prefixed
  `hive_*_hiveaestheticbestie`.
