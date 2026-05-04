# Hive Engine Finalization Checklist

**Canonical, single source of truth for shipping an engine on the Hive.** Every engine reads this. Every contributor follows it. Every chat asked to "build" or "finalize" an engine starts here.

## How to use this checklist

- **MANDATORY** items must be checked before an engine ships. No exceptions without an explicit, documented waiver appended to the engine's `ENGINE_GRAMMAR.md`.
- **RECOMMENDED** items can be deferred with a stated reason. Deferral is acceptable — silence is not.
- Each item lists the **failure mode if skipped**: what breaks, who suffers. Read these, decide deliberately.
- When asked to build or finalize an engine, **search for each item before declaring it deferred** — much of the Hive infrastructure already exists; assume it does until you've looked.
- The structured registry of who has shipped what lives in `engines.json` and `registry/*.md`. Update those at the same time you check items here.

---

## CORE BUILD

| Item | Status | Failure mode if skipped |
|---|---|---|
| Repo location: a subdirectory of `apps/` inside `hivebaby` **or** a standalone repo with the standalone reason recorded in `ENGINE_GRAMMAR.md`. | MANDATORY | Engine fragments across the wrong place; deploy and registry drift; future contributors can't find the source. |
| Vercel project created with the correct `rootDirectory`. | MANDATORY | Vercel deploys the wrong subtree (or the whole monorepo) and the engine never serves. |
| DNS subdomain on `hive.baby` with a Cloudflare CNAME → `cname.vercel-dns.com`. | MANDATORY | The vanity URL never resolves; share links and OG previews are broken. |
| Domain attached to the Vercel project, SSL provisioned. | MANDATORY | Browser shows TLS errors / cert warnings; PWA installs fail. |
| Production URL returns HTTP 200 to anonymous visitors (Vercel Deployment Protection **off**). | MANDATORY | Every visitor sees a Vercel SSO gate, not the engine. Defeats the entire ship. |

## INTERNATIONALIZATION

| Item | Status | Failure mode if skipped |
|---|---|---|
| All UI strings externalized to per-locale JSON files under `apps/<engine>/locales/`. | MANDATORY | English-only ship — alienates >70% of the world. Any future translation requires touching every component. |
| Languages match UD Converter's free-tier default set. | MANDATORY | Engine uses a different language list than the rest of the Hive — translation gaps users notice. |
| `navigator.language` detection at page load with English fallback. | MANDATORY | Engine ignores the browser locale even when a translation exists; the user never sees their language. |

## SEO

| Item | Status | Failure mode if skipped |
|---|---|---|
| `<title>`, description, OpenGraph (`og:title`, `og:description`, `og:url`, `og:site_name`, `og:type`, `og:image`), Twitter Card, `theme-color` in the root `layout.tsx` metadata. | MANDATORY | The engine looks like a placeholder when shared into iMessage / WhatsApp / Twitter; Google indexes generic text. |
| Canonical URL via `metadata.alternates.canonical`. | MANDATORY | Search engines deduplicate the wrong way; preview URLs may rank above production. |
| Static OG image at `/og.png`, exactly 1200×630. | MANDATORY | iMessage / WhatsApp / X all show a blank or fallback Vercel image when the homepage URL is shared. |
| Dynamic OG image for shareable routes via Next.js `ImageResponse` (e.g. `app/<route>/opengraph-image.tsx`). | RECOMMENDED | Loses the second-order virality where the share preview *itself* is the marketing — an absent image is recoverable. |
| `robots.txt` and `sitemap.xml` in `public/`. | MANDATORY | Crawlers either ignore the engine entirely or index dev/preview surfaces. |
| JSON-LD `SoftwareApplication` schema in the root layout. | MANDATORY | Google's rich-result blocks won't fire; the engine doesn't show up in the right SERP cards. |

## VIRAL LOOP

| Item | Status | Failure mode if skipped |
|---|---|---|
| Share-link feature where applicable. | RECOMMENDED | Loses an organic growth channel; users telling friends has higher conversion than any ad. |
| UTM parameters on shared URLs (`utm_source=share`, `utm_medium=link`). | MANDATORY *if share feature exists* | We can't measure which engines spread; future product decisions are blind. |
| Recipient view of shared content includes a "Get \[Engine\] for yourself" CTA pointing back to the engine homepage with `utm_source=shared_recipient`. | MANDATORY *if share feature exists* | Recipients consume the share but never become users. |

## ANALYTICS

| Item | Status | Failure mode if skipped |
|---|---|---|
| Privacy-respecting analytics (Plausible cloud, Umami self-hosted, or a homemade Neon counter). | MANDATORY | We have no idea how the engine is performing; can't tell when an outage hits real users. |
| At minimum: page views, primary action events, and share events tracked. | MANDATORY | Funnel is invisible — feature priorities become guesses. |
| **No** cookies, **no** IP storage, **no** PII. | MANDATORY | Breaks the Hive privacy promise; legally exposed under GDPR / UK DPA. |

## HIVE INTEGRATION

| Item | Status | Failure mode if skipped |
|---|---|---|
| Hive footer with the canonical link set: `hive.baby · social experiment · contribute · patronage · privacy`. | MANDATORY | Engine looks like an isolated site, not part of the Hive; new visitors never discover the wider ecosystem. |
| Engine entry in `engines.json` (machine-readable canonical registry). | MANDATORY | Automation that lists or audits engines silently misses this one. |
| Engine entry in `registry/engines.md` (human-readable ledger). | MANDATORY | Operations contributors don't know it exists. |
| Engine entry in `registry/dns-inventory.md` with live status and registered date. | MANDATORY | DNS audits drift; future engineers can't reconstruct what's pointing where. |
| Engine entry in `registry/billing-reconciliation.md` with monthly COGS estimate. | MANDATORY | Financial reconciliation breaks; we lose track of which engines cost what. |
| Spec archived to `docs/engine-archives/<engine-slug>/` (`ENGINE_GRAMMAR.md`, `README.md`, `test-station-slot.md`). | MANDATORY | Future migrations and audits have no canonical artefact to compare against. |

## VISIBILITY SURFACES

| Item | Status | Failure mode if skipped |
|---|---|---|
| Planet UI satellite **or** hexagonal cell added to `public/index.html` in `hivebaby` (an entry in the `ENGINES` array gives a planet hex cell + LCARS row + mobile list row; an additional satellite is appropriate for engines wanting extra prominence). | MANDATORY | Engine is invisible at `hive.baby/` — the front door doesn't know it exists. |
| LCARS console entry (auto-populated by the `ENGINES` array). | MANDATORY | Power users browsing the LCARS sidebar can't find the engine. |
| Testing-station slot at `saggarsonny-boop/hive-testing-station/lib/engines.ts` with a 10-item checklist. | MANDATORY | Tester recruitment never opens; first-100-testers programme can't enrol. |

## DESIGN CONSISTENCY

| Item | Status | Failure mode if skipped |
|---|---|---|
| Hive gold `#D4AF37` for all primary CTAs. (Audited canonical value across the codebase — do **not** introduce a different gold.) | MANDATORY | Engine looks like a different brand; brand recognition fragments. |
| Hexagonal flat-top buttons for primary interactive elements (regular hex, drawn in SVG with `vector-effect="non-scaling-stroke"`). | MANDATORY | Engine reads as "rectangular SaaS" rather than "Hive cell". |
| 3D depth treatment matching the planet UI cell aesthetic (subtle gradient fills, soft drop-shadow glow on primary). | RECOMMENDED | Engine feels flat next to the rest of the ecosystem. |
| Dark background, gold accent palette consistent with the rest of the Hive (`#0a0a0a` ink, `#f5f1e6` paper, `#9a9588` muted, `#8a6f1f` gold-dim). | MANDATORY | Engine reads as a stranger to the rest of the Hive. |

## ADOPTION AMPLIFIERS

| Item | Status | Failure mode if skipped |
|---|---|---|
| PWA manifest with `name`, `icons`, `theme_color`, `display: standalone`. | MANDATORY | Cannot be added to home screen; no install prompts; loses ~30% of return visits. |
| Service worker for the offline shell. | MANDATORY *if the engine could plausibly be used offline* | Engine fails in dead-zones (subway, garage, airplane); user trust eroded once. |
| Add-to-Home-Screen prompt for iOS Safari after first successful primary action. | RECOMMENDED | iOS users never know they can install — significant conversion drop on iPhone. |
| Mobile-first responsive design. | MANDATORY | Half the visitors get a broken layout. |
| Works without login or signup. | MANDATORY *for free-tier engines* | The Hive promise is "free at the base tier, forever" — auth-walling that breaks the contract. |

## OPERATIONAL

| Item | Status | Failure mode if skipped |
|---|---|---|
| Git tag `<engine-slug>-v0.1` pushed to GitHub. | MANDATORY | No rollback target; release history fragments. |
| Backup mirror to Codeberg or GitLab. | RECOMMENDED | If GitHub goes down or terminates an account, the engine is gone. |
| Launch email to `hive@hive.baby` via Resend with subject `<engine-slug> shipped` summarising deploy URL, version, features, known limitations. | MANDATORY | Internal contributors don't learn an engine launched; the hive doesn't celebrate its own work. |
| All required secrets present in the Vercel project's env vars (Production scope at minimum, Preview where useful). | MANDATORY | Deploys silently fail or fall back to broken paths in production. |

## LAUNCH READINESS

| Item | Status | Failure mode if skipped |
|---|---|---|
| Tested on a real iPhone and a real Android device. | MANDATORY | Mobile bugs slip past — geolocation, camera, mic, deep-links all behave differently on real devices than emulators. |
| Tested in an incognito browser to verify the anonymous-visitor experience. | MANDATORY | Cookies / localStorage from logged-in dev sessions hide regressions. |
| Share-link tested across iMessage, WhatsApp, Twitter — preview shows the correct OG image and copy. | MANDATORY *if share feature exists* | Broken previews silently kill the viral loop. |
| Compass / orientation / permission flows verified on iOS specifically. | MANDATORY *where applicable* | iOS 13+ requires user-gesture permission requests; this is the single most common ship-blocker for sensor-using engines. |

---

## Waiver clause

If a MANDATORY item cannot be completed, append a `## Waivers` section to the engine's `ENGINE_GRAMMAR.md` with:

```markdown
## Waivers
- **<item description>** — waived because: <one-paragraph reason>. Reviewed by: <name>. Date: <YYYY-MM-DD>. Plan to revisit: <when / never>.
```

Silent skips are not waivers. A missing item without a waiver is a blocker.
