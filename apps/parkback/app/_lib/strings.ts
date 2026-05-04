// Externalized UI strings for ParkBack.
//
// This module is the canonical English source of truth — every string the user
// can read in the engine should live here (or in a sibling catalog) so the
// upcoming i18n catch-up step can extend per-locale without touching component
// code. Component code reads from `strings.<section>.<key>`; the i18n step
// will swap this for a locale-aware loader that picks from
// `apps/parkback/locales/<lang>.json` based on `navigator.language` with
// English fallback.
//
// Until that loader lands, the EN catalog is mirrored here so existing routes
// are SSR-safe (no client-side hydration of strings, no flash of untranslated
// content). The shape MUST match `apps/parkback/locales/en.json`.

import en from "../../locales/en.json";

export const strings = en;
export type Strings = typeof en;
