# hive-onboarding

Canonical brand and onboarding assets shared across every Hive engine. **Always pull from this package, never per-engine local copies.** When the source assets here update, every engine should re-sync.

## Assets

| File | Purpose |
|------|---------|
| `assets/hive-logo-full.png` | Full Hive logo — gold 3D hexagon with `HIVE` centred in dark text, surrounded by a honeycomb of darker hexagonal cells. 512×512 PNG. Use in engine page headers (32–48 px tall), OG images, splash screens. |
| `assets/hive-logo-full.webp` | Same image, WebP for performance. Prefer where the consumer supports it. |
| `assets/hive-mark.svg` | Simplified single-hex SVG. Just the central gold cell with the canonical 3D rim treatment, no text, no surrounding cells. Use inline in footer signatures, install CTAs, anywhere a small Hive cue is needed. |

## Required engine usage

Per `docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md` HIVE INTEGRATION category, every engine must:

1. **Header logo** — display `hive-logo-full.png` at the top of `app/layout.tsx`, clickable, links to `https://hive.baby`. Size 32–40 px on mobile, 40–48 px on desktop. Alt text "Hive ecosystem".
2. **Footer signature** — end the footer with the simplified mark + `Made with ♥ in the Hive`, with the heart in `#D4AF37` and the word `Hive` linking to `https://hive.baby`.
3. **Brand consistency** — pull these assets from this package, never duplicate per-engine.

HiveOps enforces (3) by grepping for the import path `packages/hive-onboarding/assets/hive-logo-full` and the simplified mark inline-SVG signature, and by grepping for the literal signature string in source.

## Sync into an engine's `/public`

Until this package is built into a real npm package consumed via import, engines hold a synced copy under `apps/<engine>/public/hive/`. To re-sync:

```bash
# from repo root
cp packages/hive-onboarding/assets/hive-logo-full.png  apps/<engine>/public/hive/
cp packages/hive-onboarding/assets/hive-logo-full.webp apps/<engine>/public/hive/
cp packages/hive-onboarding/assets/hive-mark.svg      apps/<engine>/public/hive/
```

In code:

```tsx
// Engine layout.tsx — full logo header
<a href="https://hive.baby" target="_blank" rel="noopener noreferrer" aria-label="Hive ecosystem">
  <img src="/hive/hive-logo-full.png" alt="Hive ecosystem" width={36} height={36} />
</a>

// Engine footer — simplified mark + signature
import { HiveFooter } from "./_lib/HiveFooter";
// HiveFooter inlines the simplified mark SVG directly so the rim catchlight
// renders with the canonical theme without an extra HTTP request.
```

## Canonical art

The current art under `assets/` was generated from the brief description ("gold 3D hexagon with HIVE centred in dark text, surrounded by a honeycomb of darker hexagonal cells"). When Sonny supplies the canonical art, replace the files in this directory and re-sync into every engine's `/public/hive/`.

## Translation

The footer signature is the only string in this package's UI surface that needs translation. The two translatable fragments are `Made with` and `in the`. The brand word `Hive` and the `♥` glyph are universal — do **not** translate.

## i18n source strings (for the next translation run)

```json
{
  "hive_footer_signature_prefix": "Made with",
  "hive_footer_signature_infix": "in the"
}
```
