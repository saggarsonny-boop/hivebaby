# HiveIMR — test station slot

Engine: **HiveIMR**
Domain: `hiveimr.hive.baby`
Canonical migration: 2026-05-08 (PR #122)
Owner: saggarsonny-boop
Status: live · listed · public

## Smoke checklist

Run from a real iOS Safari and a real Android Chrome session before any
visible-surface PR ships:

- [ ] Page loads on hiveimr.hive.baby (no auth gate, no 404)
- [ ] Role selector renders all 8 roles
- [ ] Demo loop loads Marcus Chen / Dorothy Okafor / Raymond Alcazar
- [ ] AI panel generates a handoff for at least one demo patient + role
- [ ] AI generations carry signed / signed_by / signed_at / audit_logged
- [ ] First-visit explainer renders once per fresh session
- [ ] Install hint banner renders on Android Chrome (programmatic
      `beforeinstallprompt`) and on iOS Safari (guided overlay)
- [ ] Hive header logo links to https://hive.baby
- [ ] Hive footer signature ("Made with ♥ in the Hive") visible
- [ ] Health disclaimer ("This is not medical advice…") renders in footer
- [ ] /api/health returns 200
- [ ] manifest.json reachable; favicon set complete

## Notes

- Patient data never leaves the server unencrypted.
- ANTHROPIC_API_KEY is server-only — never shipped to the browser.
- AI generations are auditable and tied to a role identity; the app
  refuses to render an unsigned generation.
- No PII storage beyond demo patient seeds. localStorage keys prefixed
  `hive_*_hiveimr` (install hint dismissal, first-visit welcome).
