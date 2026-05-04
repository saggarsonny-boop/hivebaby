# hive-onboarding

Shared brand assets for every Hive engine. Single source of truth for the Hive
logo and the simplified Hive mark — engines import from here so the brand stays
consistent as the ecosystem grows.

## Assets

| File | Use |
|---|---|
| `assets/hive-logo-full.png` (512×512, transparent) | Header logo on every Hive engine. Bitmap form. |
| `assets/hive-logo-full.webp` (512×512, transparent) | Same as above, smaller payload. Prefer for production references with PNG fallback. |
| `assets/hive-mark.svg` | Bare hex glyph, no text. Inlinable at any size from 16px to 200px. Used in footer signatures, inline brand references. |

## Regenerating the bitmap logo

```sh
python3 packages/hive-onboarding/scripts/gen_hive_logo.py
```

Requires Pillow (`pip install Pillow`). Output goes to `packages/hive-onboarding/assets/`.

The simplified `hive-mark.svg` is hand-written and does not need regeneration.

## How engines consume these assets

Engines under `apps/` are shipped as standalone Vercel projects and cannot
directly serve files outside their own `public/` directory. To use these assets,
copy them into the engine's `public/` at build time, or vendor them in
explicitly. The brand-integration PR for ParkBack establishes the canonical
pattern: `cp packages/hive-onboarding/assets/hive-logo-full.* apps/parkback/public/`.

When the workspace adopts a turborepo / pnpm-workspace setup that can resolve
`@hive/onboarding` imports, the engines can reference the package directly.
Until then, the copy-into-public pattern is the contract.

## Why these assets must not be diverged

Per `docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md` `HIVE INTEGRATION`:

> An engine that uses a different gold, a different hex shape, a different
> wordmark, or a different mark glyph reads as a stranger to the rest of the
> Hive. Brand recognition fragments and engines stop reinforcing each other.

If a future engine has a real reason to deviate (e.g. a co-branded engine), file
a waiver in the engine's `ENGINE_GRAMMAR.md` per the checklist's waiver clause.
