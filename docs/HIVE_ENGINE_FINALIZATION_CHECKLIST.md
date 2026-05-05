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
| All UI strings externalized to per-locale JSON files under `apps/<engine>/locales/<code>.json`. | MANDATORY | English-only ship — alienates >70% of the world. Any future translation requires touching every component. |
| **LANGUAGES_MANIFEST_CANONICAL** — engine ships `apps/<engine>/locales/manifest.json` listing the supported locales, and that list matches the canonical Hive 12-locale set: `en, es, fr, de, pt, it, ja, zh-CN, ko, ar, hi, ru` (the set first established by ParkBack — see `apps/parkback/locales/manifest.json`). Each entry carries `code`, `english` name, `native` name, and `direction` (`ltr` or `rtl`). Adding a locale to one engine adds it to the canonical set; the engine that adds it owns updating the others. | MANDATORY | Engines drift to per-engine language lists; users get partial coverage that varies by engine; translation work fragments. |
| `navigator.language` detection at page load with English fallback (exact match → language-prefix match → `en`). | MANDATORY | Engine ignores the browser locale even when a translation exists; the user never sees their language. |
| **HTML_LANG_DIR_REACTIVE** — the `<html lang>` and `<html dir>` attributes update at runtime to match the resolved locale. RTL locales (e.g. Arabic) get `dir="rtl"`; LTR locales get `dir="ltr"`. The locale resolver also re-runs on the window `languagechange` event. | MANDATORY | Screen readers and browser features (date pickers, text wrap) get the wrong locale hint; RTL languages render with broken text flow. |
| All user-facing button labels and headings must use plain-language user-voice phrasing, not app-voice technical shorthand. Avoid metaphors that don't translate (e.g. "drop pin"). Reviewers ask: would a non-tech-fluent user in any language understand this label without explanation? | MANDATORY | Translation produces literal-but-meaningless strings; even native English speakers stumble on idiomatic UI verbs. |
| Brand names (engine name, "Hive", "Universal Document™", any trademarked terms) stay in English across every locale catalog. Only descriptive surrounding text translates. | MANDATORY | Brand recognition fragments across locales; trademark protection is undermined by inconsistent naming. |

## SEO

| Item | Status | Failure mode if skipped |
|---|---|---|
| `<title>`, description, OpenGraph (`og:title`, `og:description`, `og:url`, `og:site_name`, `og:type`, `og:image`), Twitter Card, `theme-color` in the root `layout.tsx` metadata. | MANDATORY | The engine looks like a placeholder when shared into iMessage / WhatsApp / Twitter; Google indexes generic text. |
| Canonical URL via `metadata.alternates.canonical`. | MANDATORY | Search engines deduplicate the wrong way; preview URLs may rank above production. |
| Static OG image at `/og.png`, exactly 1200×630. | MANDATORY | iMessage / WhatsApp / X all show a blank or fallback Vercel image when the homepage URL is shared. |
| Dynamic OG image for shareable routes via Next.js `ImageResponse` (e.g. `app/<route>/opengraph-image.tsx`). | RECOMMENDED | Loses the second-order virality where the share preview *itself* is the marketing — an absent image is recoverable. |
| `robots.txt` and `sitemap.xml` in `public/`. | MANDATORY | Crawlers either ignore the engine entirely or index dev/preview surfaces. |
| JSON-LD `SoftwareApplication` schema in the root layout. | MANDATORY | Google's rich-result blocks won't fire; the engine doesn't show up in the right SERP cards. |

## FIRST-USE ONBOARDING

| Item | Status | Failure mode if skipped |
|---|---|---|
| PWA install hint banner with platform-specific instructions on first visit. Detect iOS Safari, Android Chrome, desktop, unknown — and show the right install steps for each. Dismissable via × button, persisted in `localStorage`. | MANDATORY | Users never realise they can install the engine to their home screen — engagement and return-visit rate halve. |
| One-line explainer for the primary action on first visit, dismissed permanently after the first successful primary action. | MANDATORY | First-time users hit the screen, don't know what the giant button does, bounce. |
| Add-to-Home-Screen prompt after first successful primary action. | MANDATORY *for engines with a clear primary action* | The teachable moment for "install this" is right after the user has felt the value once — miss it and they may never return. |
| When an engine claims offline capability, the copy must specifically name "cell" and "wifi" rather than the ambiguous "signal" or "internet." Users misinterpret "no signal" as "still needs wifi"; spelling both out closes the gap. | MANDATORY *for engines that claim offline capability* | Users skip installing because they assume offline still requires wifi at home. The promise is undermined by its own ambiguity. |

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
| **HIVE_HEADER_LOGO** — engine displays the full Hive logo at the top of every screen, clickable, links to `https://hive.baby` in a new tab, alt text `Hive ecosystem`. Asset: `packages/hive-onboarding/assets/hive-logo-full.png` (and `.webp`), 32px tall on mobile, 40px tall on desktop, sits inside the iOS safe-area-top inset. | MANDATORY | Engine reads as a standalone site; visitors never discover the wider ecosystem from the engines they happen to land on first. |
| **HIVE_FOOTER_SIGNATURE** — engine footer ends with the simplified Hive mark (`packages/hive-onboarding/assets/hive-mark.svg`, 18–22px tall) and the text "Made with ♥ in the Hive". The ♥ glyph is rendered in canonical Hive gold (`#D4AF37`); the word "Hive" links to `https://hive.baby` in a new tab; the words "Made with" and "in the" come from per-locale string catalogs (the brand name "Hive" stays English). Vertical breathing room separates this row from the canonical link row above it. | MANDATORY | Engine doesn't reinforce the Hive identity at the bottom of every page — the brand never lands. |
| **FAVICON_COMPLETE** — engine ships the full favicon set in `public/`, following the canonical Hive pattern (gold flat-top hex with the engine's letter or symbol centred). Required: `favicon.ico` (16+32 multi-res), `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180×180), `maskable-icon.png` (512×512 with safe zone for Android adaptive icons). | MANDATORY | iOS home-screen install shows a cropped or default favicon; Android adaptive icons clip the engine glyph; browser tabs look unfinished. |
| **TAB_TITLE_DESCRIPTIVE** — `<title>` and `metadata.title` are exactly `"[Engine name] — [tagline]"`. No bare engine name, no marketing fluff. | MANDATORY | Tabs and search results read as ambiguous; users can't recognise the engine in a tab strip; SERP click-through suffers. |
| **THEME_COLOR_CANONICAL** — `metadata.themeColor` and `manifest.theme_color` are exactly `#D4AF37`. No engine-specific accent overrides this at the metadata layer. | MANDATORY | Android Chrome address-bar tint and iOS standalone status bar use the wrong colour; brand fragments at the OS chrome level. |
| **APPLE_WEB_APP_META** — `metadata.appleWebApp` is configured: `{ capable: true, title: "<EngineName>", statusBarStyle: "black-translucent" }`. | MANDATORY | iOS standalone-mode (home-screen PWA) shows the wrong status bar style and a defaulted app title — feels like a website launched into a webview, not an app. |
| **MANIFEST_COMPLETE** — `public/manifest.json` has all canonical PWA fields: `name`, `short_name`, `description`, `theme_color` (`#D4AF37`), `background_color` (`#000000`), `display: "standalone"`, `start_url: "/"`, `scope: "/"`, `id: "/"`, `icons` array referencing every generated size with proper `purpose` attributes (`any`, `maskable`). | MANDATORY | PWA install prompt may not fire; Android adaptive icons clip; iOS standalone start URL drifts. |
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
