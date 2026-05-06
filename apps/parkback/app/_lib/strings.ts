// Externalized UI strings for ParkBack.
//
// The English catalog is the canonical source of truth — every string the user
// can read in the engine must live in `apps/parkback/locales/en.json` (or a
// sibling per-locale file with the same shape). Component code reads strings
// either via the synchronous `strings` export (English-only, SSR-safe) or via
// the `useStrings()` hook which picks the locale matching `navigator.language`
// after hydration, falling back to English when the user's language isn't
// shipped.
//
// Canonical Hive free-tier locale set: en, es, fr, ar, hi, zh, pt. See
// docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md for why these seven.

import { useEffect, useState } from "react";
import en from "../../locales/en.json";
import es from "../../locales/es.json";
import fr from "../../locales/fr.json";
import ar from "../../locales/ar.json";
import hi from "../../locales/hi.json";
import zh from "../../locales/zh.json";
import pt from "../../locales/pt.json";

export type Strings = typeof en;

const CATALOGS: Record<string, Strings> = { en, es, fr, ar, hi, zh, pt };

// English-only synchronous export. Use for SSR paths and any non-React code
// (e.g. share text built before render). Components that want the user's
// locale should call `useStrings()`.
export const strings: Strings = en;

function pickLocale(navigatorLanguage: string | undefined): keyof typeof CATALOGS {
  if (!navigatorLanguage) return "en";
  // navigator.language is BCP-47 (e.g. "en-GB", "zh-Hant"). Match on primary
  // subtag. "zh-*" all map to the simplified-Chinese catalog we ship; if we
  // need a Traditional split later, add a "zh-Hant" catalog.
  const primary = navigatorLanguage.toLowerCase().split("-")[0];
  if (primary in CATALOGS) return primary as keyof typeof CATALOGS;
  return "en";
}

// Hook returns the localized catalog. SSR returns English; on first client
// render after hydration, a useEffect swaps to the user's locale. The brief
// flash is the cost of supporting locales without server-side language
// negotiation.
export function useStrings(): Strings {
  const [s, setS] = useState<Strings>(en);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const code = pickLocale(navigator.language);
    setS(CATALOGS[code]);
  }, []);
  return s;
}
