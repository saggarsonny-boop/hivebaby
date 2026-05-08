// HiveOps — 28 programmatically-enforceable rules drawn from the canonical
// docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md.
//
// Each rule:
//   - is identified by a stable H-id (H01..H28). Never renumber; new rules
//     get the next free ID, retired rules are tombstoned.
//   - operates on the engine root (apps/<engine>/) — pure filesystem +
//     parse, no network. Network checks (Vercel deploy URL 200, Cloudflare
//     CNAME, Stripe products) live in HiveFinalize, not here.
//
// Pure: same engine root + same date = same result. The runner applies
// override-file semantics on top of these results.

import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { RuleDefinition, RuleContext } from "./types.js";

const CANONICAL_LOCALES = ["en", "es", "fr", "ar", "hi", "zh", "pt"] as const;
const HIVE_GOLD = "#D4AF37";

// ---------------------------------------------------------------------------
// Tiny helpers — no external deps so the package stays light.
// ---------------------------------------------------------------------------

function fileExists(path: string): boolean {
  try { return statSync(path).isFile(); } catch { return false; }
}

function dirExists(path: string): boolean {
  try { return statSync(path).isDirectory(); } catch { return false; }
}

function readIfExists(path: string): string | null {
  try { return readFileSync(path, "utf8"); } catch { return null; }
}

function findRoot(ctx: RuleContext, relative: string): string {
  return join(ctx.engineRoot, relative);
}

function searchAppFiles(ctx: RuleContext, paths: string[]): string | null {
  for (const p of paths) {
    const text = readIfExists(findRoot(ctx, p));
    if (text !== null) return text;
  }
  return null;
}

// ---------------------------------------------------------------------------
// CORE BUILD (3)
// ---------------------------------------------------------------------------

const H01_packageJson: RuleDefinition = {
  id: "H01",
  title: "package.json present at engine root",
  category: "CORE_BUILD",
  severity: "MANDATORY",
  unwaivable: true,
  async check(ctx) {
    const path = findRoot(ctx, "package.json");
    return fileExists(path)
      ? { status: "pass", message: `${path} exists` }
      : { status: "fail", message: `missing ${path}` };
  },
};

const H02_appRouter: RuleDefinition = {
  id: "H02",
  title: "Next.js app router root layout present",
  category: "CORE_BUILD",
  severity: "MANDATORY",
  async check(ctx) {
    const candidates = ["app/layout.tsx", "app/layout.ts", "src/app/layout.tsx"];
    for (const c of candidates) {
      if (fileExists(findRoot(ctx, c))) {
        return { status: "pass", message: `${c} exists` };
      }
    }
    return { status: "fail", message: `none of ${candidates.join(", ")} exists` };
  },
};

const H03_publicDir: RuleDefinition = {
  id: "H03",
  title: "public/ directory present",
  category: "CORE_BUILD",
  severity: "MANDATORY",
  async check(ctx) {
    return dirExists(findRoot(ctx, "public"))
      ? { status: "pass", message: "public/ exists" }
      : { status: "fail", message: "public/ directory missing" };
  },
};

// ---------------------------------------------------------------------------
// INTERNATIONALIZATION (3)
// ---------------------------------------------------------------------------

const H04_localesDir: RuleDefinition = {
  id: "H04",
  title: "locales/ directory present",
  category: "INTERNATIONALIZATION",
  severity: "MANDATORY",
  async check(ctx) {
    return dirExists(findRoot(ctx, "locales"))
      ? { status: "pass", message: "locales/ exists" }
      : { status: "fail", message: "locales/ directory missing — strings must be externalized" };
  },
};

const H05_canonicalLocaleSet: RuleDefinition = {
  id: "H05",
  title: "all 7 canonical free-tier locales present (en, es, fr, ar, hi, zh, pt)",
  category: "INTERNATIONALIZATION",
  severity: "MANDATORY",
  async check(ctx) {
    const missing = CANONICAL_LOCALES.filter(
      (loc) => !fileExists(findRoot(ctx, `locales/${loc}.json`)),
    );
    return missing.length === 0
      ? { status: "pass", message: `all ${CANONICAL_LOCALES.length} locales present` }
      : { status: "fail", message: `missing locales/${missing.join(".json, locales/")}.json` };
  },
};

const H06_navigatorLanguageDetection: RuleDefinition = {
  id: "H06",
  title: "navigator.language detection wired in strings loader",
  category: "INTERNATIONALIZATION",
  severity: "MANDATORY",
  async check(ctx) {
    const candidates = ["app/_lib/strings.ts", "src/lib/strings.ts", "lib/strings.ts", "app/strings.ts"];
    for (const c of candidates) {
      const text = readIfExists(findRoot(ctx, c));
      if (text && /navigator\.language/.test(text)) {
        return { status: "pass", message: `navigator.language reference found in ${c}` };
      }
    }
    return { status: "fail", message: "no navigator.language reference in strings loader candidates" };
  },
};

// ---------------------------------------------------------------------------
// SEO (4)
// ---------------------------------------------------------------------------

const H07_metadataExports: RuleDefinition = {
  id: "H07",
  title: "root layout exports metadata.title and metadata.description",
  category: "SEO",
  severity: "MANDATORY",
  async check(ctx) {
    const text = searchAppFiles(ctx, ["app/layout.tsx", "src/app/layout.tsx"]);
    if (!text) return { status: "skip", message: "no layout.tsx to check" };
    const hasMetadata = /export\s+const\s+metadata/.test(text) || /export\s+function\s+generateMetadata/.test(text);
    if (!hasMetadata) return { status: "fail", message: "neither `export const metadata` nor `generateMetadata` in layout" };
    const hasTitle = /title\s*:/.test(text);
    const hasDescription = /description\s*:/.test(text);
    if (!hasTitle || !hasDescription) {
      const missing = [!hasTitle && "title", !hasDescription && "description"].filter(Boolean).join(", ");
      return { status: "fail", message: `metadata missing fields: ${missing}` };
    }
    return { status: "pass", message: "metadata.title + metadata.description present" };
  },
};

const H08_ogImage: RuleDefinition = {
  id: "H08",
  title: "public/og.png present",
  category: "SEO",
  severity: "MANDATORY",
  async check(ctx) {
    const path = findRoot(ctx, "public/og.png");
    return fileExists(path)
      ? { status: "pass", message: "public/og.png exists" }
      : { status: "fail", message: "public/og.png missing — share previews fall back to Vercel default" };
  },
};

const H09_robotsTxt: RuleDefinition = {
  id: "H09",
  title: "robots.txt present (public/ or app/robots.ts)",
  category: "SEO",
  severity: "MANDATORY",
  async check(ctx) {
    const candidates = ["public/robots.txt", "app/robots.ts", "src/app/robots.ts"];
    for (const c of candidates) {
      if (fileExists(findRoot(ctx, c))) return { status: "pass", message: `${c} exists` };
    }
    return { status: "fail", message: `none of ${candidates.join(", ")} exists` };
  },
};

const H10_sitemap: RuleDefinition = {
  id: "H10",
  title: "sitemap present (public/sitemap.xml or app/sitemap.ts)",
  category: "SEO",
  severity: "MANDATORY",
  async check(ctx) {
    const candidates = ["public/sitemap.xml", "app/sitemap.ts", "src/app/sitemap.ts"];
    for (const c of candidates) {
      if (fileExists(findRoot(ctx, c))) return { status: "pass", message: `${c} exists` };
    }
    return { status: "fail", message: `none of ${candidates.join(", ")} exists` };
  },
};

// ---------------------------------------------------------------------------
// FIRST-USE ONBOARDING (2)
// ---------------------------------------------------------------------------

const H11_installHint: RuleDefinition = {
  id: "H11",
  title: "PWA install hint banner present (HiveInstallHint or local equivalent)",
  category: "FIRST_USE_ONBOARDING",
  severity: "MANDATORY",
  async check(ctx) {
    // Either the engine imports @hive/onboarding's HiveInstallHint, or it
    // ships a local equivalent named *InstallHint*.tsx under app/_lib or
    // similar. Both are acceptable until Phase 3 lands.
    const candidates = [
      "app/page.tsx", "src/app/page.tsx",
      "app/_lib/InstallHintBanner.tsx", "app/_lib/HiveInstallHint.tsx",
    ];
    for (const c of candidates) {
      const text = readIfExists(findRoot(ctx, c));
      if (text && /(InstallHint|@hive\/onboarding)/.test(text)) {
        return { status: "pass", message: `install-hint reference found in ${c}` };
      }
    }
    return { status: "fail", message: "no install-hint reference in primary surface files" };
  },
};

const H12_firstVisitExplainer: RuleDefinition = {
  id: "H12",
  title: "first-visit explainer present (HiveFirstVisitExplainer or local equivalent)",
  category: "FIRST_USE_ONBOARDING",
  severity: "MANDATORY",
  async check(ctx) {
    const candidates = [
      "app/page.tsx", "src/app/page.tsx",
      "app/_lib/InstallHintBanner.tsx", "app/_lib/HiveFirstVisitExplainer.tsx",
    ];
    for (const c of candidates) {
      const text = readIfExists(findRoot(ctx, c));
      if (text && /(FirstVisitExplainer|firstVisitExplainer)/.test(text)) {
        return { status: "pass", message: `first-visit explainer reference found in ${c}` };
      }
    }
    return { status: "fail", message: "no FirstVisitExplainer reference in primary surface files" };
  },
};

// ---------------------------------------------------------------------------
// HIVE INTEGRATION (8)
// ---------------------------------------------------------------------------

const H13_hiveLogo: RuleDefinition = {
  id: "H13",
  title: "HIVE_HEADER_LOGO — public/hive-logo-full.png copied",
  category: "HIVE_INTEGRATION",
  severity: "MANDATORY",
  async check(ctx) {
    const png = findRoot(ctx, "public/hive-logo-full.png");
    const webp = findRoot(ctx, "public/hive-logo-full.webp");
    if (fileExists(png) || fileExists(webp)) {
      return { status: "pass", message: "hive-logo-full.{png|webp} present in public/" };
    }
    return { status: "fail", message: "public/hive-logo-full.png|webp missing" };
  },
};

const H14_footerSignature: RuleDefinition = {
  id: "H14",
  title: 'HIVE_FOOTER_SIGNATURE — "Made with ♥ in the Hive" rendered',
  category: "HIVE_INTEGRATION",
  severity: "MANDATORY",
  async check(ctx) {
    const candidates = [
      "app/_lib/HiveFooter.tsx", "src/app/_lib/HiveFooter.tsx",
      "app/page.tsx", "src/app/page.tsx",
      "app/layout.tsx", "src/app/layout.tsx",
    ];
    for (const c of candidates) {
      const text = readIfExists(findRoot(ctx, c));
      if (text && /(Made with|madeWith).*Hive/s.test(text)) {
        return { status: "pass", message: `footer signature reference found in ${c}` };
      }
    }
    return { status: "fail", message: 'no "Made with ♥ in the Hive" reference in footer/page/layout' };
  },
};

const H15_faviconComplete: RuleDefinition = {
  id: "H15",
  title: "FAVICON_COMPLETE — full canonical favicon set in public/",
  category: "HIVE_INTEGRATION",
  severity: "MANDATORY",
  async check(ctx) {
    const required = ["favicon.ico", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
    const optional = ["maskable-icon.png"];
    const missing = required.filter((f) => !fileExists(findRoot(ctx, `public/${f}`)));
    if (missing.length === 0) {
      const optMissing = optional.filter((f) => !fileExists(findRoot(ctx, `public/${f}`)));
      const note = optMissing.length === 0 ? "all required + maskable present" : `(maskable-icon.png missing — recommended)`;
      return { status: "pass", message: `favicon set present ${note}` };
    }
    return { status: "fail", message: `missing public/${missing.join(", public/")}` };
  },
};

const H16_themeColor: RuleDefinition = {
  id: "H16",
  title: `THEME_COLOR_CANONICAL — ${HIVE_GOLD} in metadata + manifest`,
  category: "HIVE_INTEGRATION",
  severity: "MANDATORY",
  async check(ctx) {
    const layout = searchAppFiles(ctx, ["app/layout.tsx", "src/app/layout.tsx"]);
    const manifest = readIfExists(findRoot(ctx, "public/manifest.json"));
    const inLayout = layout ? new RegExp(`themeColor\\s*:\\s*['"\`]${HIVE_GOLD}['"\`]`, "i").test(layout) : false;
    const inManifest = manifest ? new RegExp(`"theme_color"\\s*:\\s*"${HIVE_GOLD}"`, "i").test(manifest) : false;
    if (inLayout && inManifest) return { status: "pass", message: `${HIVE_GOLD} present in layout themeColor and manifest theme_color` };
    if (!inLayout && !inManifest) return { status: "fail", message: `${HIVE_GOLD} missing from both layout themeColor and manifest theme_color` };
    return { status: "fail", message: `${HIVE_GOLD} only present in ${inLayout ? "layout" : "manifest"} — both required` };
  },
};

const H17_appleWebApp: RuleDefinition = {
  id: "H17",
  title: "APPLE_WEB_APP_META — metadata.appleWebApp configured",
  category: "HIVE_INTEGRATION",
  severity: "MANDATORY",
  async check(ctx) {
    const text = searchAppFiles(ctx, ["app/layout.tsx", "src/app/layout.tsx"]);
    if (!text) return { status: "skip", message: "no layout.tsx to check" };
    return /appleWebApp\s*:/.test(text)
      ? { status: "pass", message: "appleWebApp key present in metadata" }
      : { status: "fail", message: "metadata.appleWebApp missing — iOS standalone status bar will default" };
  },
};

const H18_manifestComplete: RuleDefinition = {
  id: "H18",
  title: "MANIFEST_COMPLETE — public/manifest.json has canonical fields",
  category: "HIVE_INTEGRATION",
  severity: "MANDATORY",
  async check(ctx) {
    const text = readIfExists(findRoot(ctx, "public/manifest.json"));
    if (!text) return { status: "fail", message: "public/manifest.json missing" };
    let m: Record<string, unknown>;
    try { m = JSON.parse(text); } catch (err) {
      return { status: "fail", message: `manifest.json invalid JSON: ${err instanceof Error ? err.message : String(err)}` };
    }
    const required = ["name", "short_name", "theme_color", "background_color", "display", "start_url", "icons"] as const;
    const missing = required.filter((k) => !(k in m));
    if (missing.length > 0) return { status: "fail", message: `manifest missing keys: ${missing.join(", ")}` };
    if (m.display !== "standalone") return { status: "fail", message: `manifest.display=${JSON.stringify(m.display)} should be "standalone"` };
    if (!Array.isArray(m.icons) || m.icons.length === 0) return { status: "fail", message: "manifest.icons must be a non-empty array" };
    return { status: "pass", message: `manifest has all canonical fields (${(m.icons as unknown[]).length} icons)` };
  },
};

const H19_engineGrammar: RuleDefinition = {
  id: "H19",
  title: "ENGINE_GRAMMAR.md present in repo root with frontmatter",
  category: "HIVE_INTEGRATION",
  severity: "MANDATORY",
  async check(ctx) {
    const path = findRoot(ctx, "ENGINE_GRAMMAR.md");
    if (!fileExists(path)) return { status: "fail", message: "ENGINE_GRAMMAR.md missing" };
    const text = readIfExists(path);
    if (!text) return { status: "fail", message: "ENGINE_GRAMMAR.md unreadable" };
    return /^---\s*\n[\s\S]*?\n---/.test(text)
      ? { status: "pass", message: "ENGINE_GRAMMAR.md present with YAML frontmatter" }
      : { status: "fail", message: "ENGINE_GRAMMAR.md present but no YAML frontmatter detected" };
  },
};

const H20_serviceWorker: RuleDefinition = {
  id: "H20",
  title: "service worker registrar present",
  category: "HIVE_INTEGRATION",
  severity: "MANDATORY",
  async check(ctx) {
    const candidates = [
      "public/sw.js", "public/service-worker.js",
      "app/_lib/ServiceWorkerRegistrar.tsx", "src/app/_lib/ServiceWorkerRegistrar.tsx",
    ];
    for (const c of candidates) {
      if (fileExists(findRoot(ctx, c))) return { status: "pass", message: `${c} present` };
    }
    return { status: "fail", message: `none of ${candidates.join(", ")} present` };
  },
};

// ---------------------------------------------------------------------------
// VISIBILITY SURFACES (1)
// ---------------------------------------------------------------------------

const H21_planetEntry: RuleDefinition = {
  id: "H21",
  title: "engine entry present in hivebaby planet ENGINES array",
  category: "VISIBILITY_SURFACES",
  severity: "MANDATORY",
  async check(ctx) {
    // The hivebaby front door's ENGINES array lives in public/index.html
    // (or public/lcars-data.js depending on layout). For engines under
    // apps/<slug>/ we look two levels up to repo root; for top-level
    // engines (repo/<slug>/, e.g. hive-aestheticbestie, hive-imr) we look
    // one level up. Both are valid layouts per CLAUDE.md §C10.
    const planetCandidates = [
      join(ctx.engineRoot, "..", "..", "public", "index.html"),
      join(ctx.engineRoot, "..", "..", "public", "engines.json"),
      join(ctx.engineRoot, "..", "..", "engines.json"),
      join(ctx.engineRoot, "..", "public", "index.html"),
      join(ctx.engineRoot, "..", "public", "engines.json"),
      join(ctx.engineRoot, "..", "engines.json"),
    ];
    for (const p of planetCandidates) {
      const text = readIfExists(p);
      if (text && new RegExp(ctx.engineSlug, "i").test(text)) {
        return { status: "pass", message: `${ctx.engineSlug} referenced in ${p}` };
      }
    }
    return { status: "fail", message: `no reference to ${ctx.engineSlug} in hivebaby planet/registry candidates` };
  },
};

// ---------------------------------------------------------------------------
// DESIGN CONSISTENCY (2)
// ---------------------------------------------------------------------------

const H22_hiveGold: RuleDefinition = {
  id: "H22",
  title: `Hive gold ${HIVE_GOLD} referenced in component / styles`,
  category: "DESIGN_CONSISTENCY",
  severity: "MANDATORY",
  async check(ctx) {
    const candidates = [
      "app/layout.tsx", "src/app/layout.tsx",
      "app/page.tsx", "src/app/page.tsx",
      "app/globals.css", "src/app/globals.css",
    ];
    for (const c of candidates) {
      const text = readIfExists(findRoot(ctx, c));
      if (text && text.includes(HIVE_GOLD)) {
        return { status: "pass", message: `${HIVE_GOLD} referenced in ${c}` };
      }
    }
    return { status: "fail", message: `${HIVE_GOLD} not referenced in layout/page/globals` };
  },
};

const H23_darkBackground: RuleDefinition = {
  id: "H23",
  title: "canonical dark ink #0a0a0a referenced",
  category: "DESIGN_CONSISTENCY",
  severity: "RECOMMENDED",
  async check(ctx) {
    const candidates = [
      "app/layout.tsx", "src/app/layout.tsx",
      "app/page.tsx", "src/app/page.tsx",
      "app/globals.css", "src/app/globals.css",
    ];
    for (const c of candidates) {
      const text = readIfExists(findRoot(ctx, c));
      if (text && /#0a0a0a/i.test(text)) {
        return { status: "pass", message: `#0a0a0a referenced in ${c}` };
      }
    }
    return { status: "fail", message: "canonical ink #0a0a0a not referenced — engine may read as a stranger" };
  },
};

// ---------------------------------------------------------------------------
// ADOPTION AMPLIFIERS (2)
// ---------------------------------------------------------------------------

const H24_pwaManifestRegistered: RuleDefinition = {
  id: "H24",
  title: 'manifest registered in layout (<link rel="manifest"...>)',
  category: "ADOPTION_AMPLIFIERS",
  severity: "MANDATORY",
  async check(ctx) {
    const text = searchAppFiles(ctx, ["app/layout.tsx", "src/app/layout.tsx"]);
    if (!text) return { status: "skip", message: "no layout.tsx to check" };
    return /manifest\s*[:=]/.test(text) || /rel=['"]manifest['"]/.test(text)
      ? { status: "pass", message: "manifest registered in layout (metadata.manifest or <link>)" }
      : { status: "fail", message: "manifest not registered in layout — install prompts may not fire" };
  },
};

const H25_mobileFirstViewport: RuleDefinition = {
  id: "H25",
  title: "viewport meta with width=device-width set in layout",
  category: "ADOPTION_AMPLIFIERS",
  severity: "MANDATORY",
  async check(ctx) {
    const text = searchAppFiles(ctx, ["app/layout.tsx", "src/app/layout.tsx"]);
    if (!text) return { status: "skip", message: "no layout.tsx to check" };
    if (/viewport\s*:/.test(text)) {
      // Next.js pulls viewport from `export const viewport`; just check the export exists.
      return { status: "pass", message: "viewport export / metadata.viewport present in layout" };
    }
    return /width\s*=\s*device-width/i.test(text)
      ? { status: "pass", message: "viewport meta found in layout" }
      : { status: "fail", message: "no viewport export / device-width meta in layout — mobile rendering breaks" };
  },
};

// ---------------------------------------------------------------------------
// OPERATIONAL (3)
// ---------------------------------------------------------------------------

const H26_envExample: RuleDefinition = {
  id: "H26",
  title: ".env.example or env_vars_required documented",
  category: "OPERATIONAL",
  severity: "RECOMMENDED",
  async check(ctx) {
    const envEx = findRoot(ctx, ".env.example");
    if (fileExists(envEx)) return { status: "pass", message: ".env.example present" };
    const grammar = readIfExists(findRoot(ctx, "ENGINE_GRAMMAR.md"));
    if (grammar && /env_vars_required/.test(grammar)) {
      return { status: "pass", message: "env_vars_required documented in ENGINE_GRAMMAR.md" };
    }
    return { status: "fail", message: "neither .env.example nor env_vars_required in grammar" };
  },
};

const H27_readme: RuleDefinition = {
  id: "H27",
  title: "README.md present in engine root",
  category: "OPERATIONAL",
  severity: "MANDATORY",
  async check(ctx) {
    const path = findRoot(ctx, "README.md");
    if (!fileExists(path)) return { status: "fail", message: "README.md missing" };
    const text = readIfExists(path);
    if (!text || text.trim().length < 100) {
      return { status: "fail", message: "README.md present but < 100 chars (placeholder?)" };
    }
    return { status: "pass", message: `README.md present (${text.length} chars)` };
  },
};

const H28_tsconfig: RuleDefinition = {
  id: "H28",
  title: "tsconfig.json with strict mode",
  category: "OPERATIONAL",
  severity: "MANDATORY",
  async check(ctx) {
    const text = readIfExists(findRoot(ctx, "tsconfig.json"));
    if (!text) return { status: "fail", message: "tsconfig.json missing" };
    let cfg: { compilerOptions?: { strict?: boolean } };
    try { cfg = JSON.parse(text) as typeof cfg; } catch (err) {
      return { status: "fail", message: `tsconfig.json invalid JSON: ${err instanceof Error ? err.message : String(err)}` };
    }
    return cfg?.compilerOptions?.strict === true
      ? { status: "pass", message: "tsconfig.json compilerOptions.strict=true" }
      : { status: "fail", message: "tsconfig.json compilerOptions.strict is not true" };
  },
};

// ---------------------------------------------------------------------------
// Export the canonical list. Order is the audit report order; never reshuffle
// because the v0.2 baselines pin to this sequence.
// ---------------------------------------------------------------------------

export const RULES: ReadonlyArray<RuleDefinition> = [
  H01_packageJson,
  H02_appRouter,
  H03_publicDir,
  H04_localesDir,
  H05_canonicalLocaleSet,
  H06_navigatorLanguageDetection,
  H07_metadataExports,
  H08_ogImage,
  H09_robotsTxt,
  H10_sitemap,
  H11_installHint,
  H12_firstVisitExplainer,
  H13_hiveLogo,
  H14_footerSignature,
  H15_faviconComplete,
  H16_themeColor,
  H17_appleWebApp,
  H18_manifestComplete,
  H19_engineGrammar,
  H20_serviceWorker,
  H21_planetEntry,
  H22_hiveGold,
  H23_darkBackground,
  H24_pwaManifestRegistered,
  H25_mobileFirstViewport,
  H26_envExample,
  H27_readme,
  H28_tsconfig,
];

export const RULE_IDS: ReadonlySet<string> = new Set(RULES.map((r) => r.id));

export const MANDATORY_COUNT = RULES.filter((r) => r.severity === "MANDATORY").length;
export const RECOMMENDED_COUNT = RULES.filter((r) => r.severity === "RECOMMENDED").length;
