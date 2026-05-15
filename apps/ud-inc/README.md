# UniversalDocumentInc (ud-inc)

The hub of the Universal Document™ ecosystem. Front door at
`universaldocument.hive.baby` (declared — DNS not yet registered as of
2026-05-15; see `registry/dns-inventory.md`).

- Engine: `UniversalDocumentInc`
- Domain (declared): https://universaldocument.hive.baby
- Stack: Next.js 14 + Anthropic SDK + Stripe + Clerk
- Status: SCAFFOLDED. The landing page is real; the API routes and clinic /
  practice / dashboard sub-pages are inherited from the HivePlainScan template
  and not on-scope for this hub.

## What this hub does

Explains what Universal Document™ (UD) is, names UDR (revisable) and UDS
(sealed), and links out to the canonical sub-tools (UDConverter, UDReader,
UDValidator, UDSigner, UDCreator, UDUtilities, UDMedical, UDBulk).

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## What's left

This hub was scaffolded as a clone of the HivePlainScan template. The
landing page (`app/page.tsx`), layout (`app/layout.tsx`), styles
(`app/globals.css`), and manifest (`app/manifest.ts` + `public/manifest.json`)
were rewritten on 2026-05-15 to be a real UD hub with §G design system
compliance (Playfair Display + DM Sans + DM Mono, UD palette `#c8960a`
gold + `#1e2d3d` ink + `#fafaf8` paper) and §H trademark hygiene
(`Universal Document™` first-mention).

The orphan PlainScan sub-pages and API routes (`app/clinic`, `app/practice`,
`app/dashboard`, `app/enterprise`, `app/api/*`) are still present but unused
by the new landing. They will be removed in a follow-up cleanup once the
hub's actual feature set is decided. The `components/` and `lib/` directories
are similarly inherited from the clone and unused by the new landing.

The favicon set referenced in `app/manifest.ts` (`favicon.ico`,
`icon-192.png`, `icon-512.png`, `maskable-icon.png`) is **not yet generated**
and needs to be added to `public/` before the hub ships.

See `docs/UD_ECOSYSTEM_AUDIT_2026-05-15.md` for the full ecosystem audit.

## Notes

- No ads. No investors. No agenda.
- Universal Document™ is a pending trademark of Universal Document
  Incorporated (Serial 99774346, filed 2026-04-20).
