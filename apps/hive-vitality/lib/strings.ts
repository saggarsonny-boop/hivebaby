// Locale loader. English is the floor; the other six canonical Hive
// locales (es, fr, ar, hi, zh, pt) ship in v0.2 per ENGINE_GRAMMAR. The
// loader resolves to en regardless of navigator.language until the rest
// of the catalog lands.

import en from "@/locales/en.json";

export type Strings = typeof en;
export type Locale = "en" | "es" | "fr" | "ar" | "hi" | "zh" | "pt";

const CATALOGS: Partial<Record<Locale, Strings>> = { en };

export function pickLocale(navigatorLanguage: string | undefined): Locale {
  if (!navigatorLanguage) return "en";
  const primary = navigatorLanguage.toLowerCase().split("-")[0] as Locale;
  if (primary in CATALOGS) return primary;
  return "en";
}

export function getStrings(locale?: Locale): Strings {
  if (locale && CATALOGS[locale]) return CATALOGS[locale] as Strings;
  return en;
}

export const strings: Strings = en;

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return pickLocale(navigator.language);
}
