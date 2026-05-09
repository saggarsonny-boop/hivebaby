// Engine-class applicability matrix.
//
// Some rules don't apply to every engine class. A static-html engine
// shouldn't be required to have a Next.js app router root layout; an
// api-only backend has no UI and shouldn't be required to ship a favicon.
// This file is the single source of truth for which rules each class
// must satisfy.
//
// Convention: rules NOT listed in NON_UNIVERSAL_RULES default to "applies
// to every class". Rules with class restrictions are enumerated explicitly
// so the file stays grep-able and reviewable.
//
// V-rules (manifest schema, V01..V29) apply to every engine class. The
// schema is engine-class-agnostic — every engine needs canonical
// frontmatter regardless of how it serves traffic.

import type { EngineClass } from "./types.js";

/** Rules that don't apply to every engine class, mapped to the set of
 *  classes they DO apply to. */
const NON_UNIVERSAL_RULES: Record<string, ReadonlyArray<EngineClass>> = {
  // ─── CORE_BUILD ────────────────────────────────────────────────────
  // H02 — Next.js app router root layout. Static-HTML and api-only have
  // no app router; hybrid is included because the convention for a
  // hybrid engine is "Next.js + something extra", not "static + Next.js".
  H02: ["nextjs", "hybrid"],

  // ─── SEO ───────────────────────────────────────────────────────────
  // H07 — root layout exports metadata.title / .description. Specific to
  // Next.js's metadata API; static-html sets these via <head> tags.
  H07: ["nextjs", "hybrid"],
  // H08 (og.png), H09 (robots), H10 (sitemap) — universal: any engine
  // class with a public-facing surface should ship these. api-only
  // engines genuinely don't have a homepage, so og.png is non-applicable
  // there; robots/sitemap stay universal because even an API surface can
  // declare its crawl policy.
  H08: ["nextjs", "static-html", "hybrid"],

  // ─── FIRST_USE_ONBOARDING ─────────────────────────────────────────
  // H11 install hint and H12 first-visit explainer require a UI shell.
  // No api-only engine has either.
  H11: ["nextjs", "static-html", "hybrid"],
  H12: ["nextjs", "static-html", "hybrid"],

  // ─── HIVE_INTEGRATION ──────────────────────────────────────────────
  // H13 (logo), H14 (footer signature), H15 (favicon set) all imply UI.
  H13: ["nextjs", "static-html", "hybrid"],
  H14: ["nextjs", "static-html", "hybrid"],
  H15: ["nextjs", "static-html", "hybrid"],
  // H16 themeColor in metadata + manifest is Next.js's metadata API form.
  // Static-html declares it via <meta name="theme-color"> — same goal,
  // different mechanism. The current rule check looks for the Next.js
  // form specifically, so we exempt static-html until the rule learns
  // both forms (deferred to v0.3).
  H16: ["nextjs", "hybrid"],
  // H17 metadata.appleWebApp is Next.js metadata API form.
  H17: ["nextjs", "hybrid"],
  // H18 manifest.json — universal for any engine with a UI.
  H18: ["nextjs", "static-html", "hybrid"],
  // H20 service worker — universal for any engine with a UI (offline shell).
  H20: ["nextjs", "static-html", "hybrid"],

  // ─── DESIGN_CONSISTENCY ────────────────────────────────────────────
  // H22 Hive gold + H23 ink reference apply to any engine with visual
  // surfaces.
  H22: ["nextjs", "static-html", "hybrid"],
  H23: ["nextjs", "static-html", "hybrid"],

  // ─── ADOPTION_AMPLIFIERS ───────────────────────────────────────────
  // H24 manifest registered in layout — Next.js form.
  H24: ["nextjs", "hybrid"],
  // H25 viewport meta — Next.js viewport export. Static-html declares it
  // via <meta>; we exempt static-html for the same reason as H16/H17.
  H25: ["nextjs", "hybrid"],

  // ─── GOVERNANCE (Queen Bee consumption) ────────────────────────────
  // G01 (package.json dep) and G03 (registry entry via /api/registry)
  // apply universally — every engine class can declare a dependency
  // and every engine should be registered with QB whether or not it
  // serves UI traffic.
  // G04 (queen_bee_schemas in ENGINE_GRAMMAR.md) is also universal.
  // G02 (govern() call in route handlers) — static-html engines have
  // no Next.js route handlers, so the rule cannot apply meaningfully.
  // api-only engines DO have route handlers and should call govern();
  // hybrid engines are subject to all rules.
  G02: ["nextjs", "api-only", "hybrid"],
  // G05 (governance_stamp persistence in DB schema) — engines without
  // a database (static-html PWAs like ParkBack, HiveMoon) genuinely
  // have nowhere to persist a stamp. api-only engines often DO have a
  // DB and are kept in-scope; hybrid is in-scope for safety.
  G05: ["nextjs", "api-only", "hybrid"],
};

/** Returns true iff `ruleId` applies to engines of class `cls`. Rules not
 *  listed in NON_UNIVERSAL_RULES apply to every class. */
export function ruleApplies(ruleId: string, cls: EngineClass): boolean {
  const restriction = NON_UNIVERSAL_RULES[ruleId];
  if (!restriction) return true;
  return restriction.includes(cls);
}

/** For diagnostic / reporter use: the human-readable reason a rule was
 *  skipped because it doesn't apply to the engine class. */
export function inapplicableReason(ruleId: string, cls: EngineClass): string {
  const allowed = NON_UNIVERSAL_RULES[ruleId];
  if (!allowed) return ""; // rule applies — no reason
  return `not applicable to engine_class=${cls} (rule applies to: ${allowed.join(", ")})`;
}
