"use client";

import { useEffect, useMemo, useState } from "react";
import en from "../../locales/en.json";
import es from "../../locales/es.json";
import fr from "../../locales/fr.json";
import de from "../../locales/de.json";
import pt from "../../locales/pt.json";
import it from "../../locales/it.json";
import ja from "../../locales/ja.json";
import zhCN from "../../locales/zh-CN.json";
import ko from "../../locales/ko.json";
import ar from "../../locales/ar.json";
import hi from "../../locales/hi.json";
import ru from "../../locales/ru.json";
import manifest from "../../locales/manifest.json";

// Static catalog map. Adding a locale: drop a sibling `<code>.json` matching
// the shape of `en.json`, add an import here, and add the entry to
// `locales/manifest.json`. Keep the imports static so Next bundles every
// catalog at build time — no async catalog fetching, no flash of missing
// translations.
const catalogs: Record<string, typeof en> = {
  en, es, fr, de, pt, it, ja, ko, ar, hi, ru,
  "zh-CN": zhCN,
  // Common short aliases — degrade gracefully when the browser reports
  // just the language code without the region.
  zh: zhCN,
};

type LocaleInfo = { code: string; direction: "ltr" | "rtl" };

function pickLocale(navLang: string | undefined): LocaleInfo {
  // Best-match algorithm:
  //   1. exact match against catalogs
  //   2. language-prefix match (e.g. "es-MX" → "es")
  //   3. fall back to manifest.default ("en")
  if (typeof navLang === "string" && navLang.length > 0) {
    if (catalogs[navLang]) return resolveDirection(navLang);
    const prefix = navLang.split("-")[0];
    if (catalogs[prefix]) return resolveDirection(prefix);
  }
  return resolveDirection(manifest.default);
}

function resolveDirection(code: string): LocaleInfo {
  const entry = manifest.locales.find((l) => l.code === code);
  const direction = (entry?.direction === "rtl" ? "rtl" : "ltr") as "ltr" | "rtl";
  return { code, direction };
}

/**
 * SSR-safe locale detection. Returns the `en` catalog on the server and on
 * first paint, then re-renders with the user's preferred catalog once
 * navigator.language is available. The flicker is one frame on first hydration
 * and only when the user's locale isn't English.
 *
 * Side effect: updates `<html lang>` and `<html dir>` on every locale
 * resolution so screen readers / browser features get the right hints. This
 * is the HTML_LANG_DIR_REACTIVE rule from HIVE_ENGINE_FINALIZATION_CHECKLIST.
 */
export function useStrings(): typeof en {
  const [locale, setLocale] = useState<LocaleInfo>(() => ({
    code: manifest.default,
    direction: "ltr",
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      const nextLocale = pickLocale(navigator.language);
      setLocale(nextLocale);
      try {
        const html = document.documentElement;
        if (html.getAttribute("lang") !== nextLocale.code) {
          html.setAttribute("lang", nextLocale.code);
        }
        if (html.getAttribute("dir") !== nextLocale.direction) {
          html.setAttribute("dir", nextLocale.direction);
        }
      } catch {
        // Defensive — never let an unexpected DOM-attribute error blow up
        // the engine's primary action.
      }
    };
    apply();
    // Some browsers fire `languagechange` when the user changes their
    // preferred language list mid-session.
    window.addEventListener("languagechange", apply);
    return () => {
      cancelled = true;
      window.removeEventListener("languagechange", apply);
    };
  }, []);

  return useMemo(() => catalogs[locale.code] ?? catalogs[manifest.default], [locale.code]);
}

export type Strings = typeof en;
