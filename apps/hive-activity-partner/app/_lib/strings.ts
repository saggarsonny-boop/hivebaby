"use client";

// Localized strings catalog for HiveActivityPartner.
// English is the source of truth; all other locales must mirror its shape.
// Canonical Hive free-tier locale set: en, es, fr, ar, hi, zh, pt.

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

export const strings: Strings = en;

function pickLocale(navigatorLanguage: string | undefined): keyof typeof CATALOGS {
  if (!navigatorLanguage) return "en";
  const primary = navigatorLanguage.toLowerCase().split("-")[0];
  if (primary in CATALOGS) return primary as keyof typeof CATALOGS;
  return "en";
}

export function useStrings(): Strings {
  const [s, setS] = useState<Strings>(en);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const code = pickLocale(navigator.language);
    setS(CATALOGS[code]);
  }, []);
  return s;
}
