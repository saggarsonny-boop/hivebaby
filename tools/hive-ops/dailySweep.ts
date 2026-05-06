#!/usr/bin/env tsx
// HiveOps daily sweep — auto-flip expired warn-mode overrides to enforce.
//
// Scans every apps/<engine>/ENGINE_GRAMMAR.md, finds override entries
// where mode=warn AND warn_until is in the past, and strips them from
// the file. Stripping is the canonical "flip to enforce" action: the
// next HiveOps audit reports the rule as fail again, exactly as if the
// warn had never been granted (matching the runner's existing
// applyOverride() behavior in runner.ts).
//
// Also surfaces (without modifying) entries expiring within 24 hours
// so engineers get early warning to either fix the underlying issue,
// extend the warn (within the 30-day ceiling), or convert to a waive.
//
// Side effects:
//   - Mutates apps/*/ENGINE_GRAMMAR.md when expired entries exist
//   - INSERTs into hive_alerts (one row per flip + one per imminent
//     expiry + one summary row)
//
// Usage:
//   tsx tools/hive-ops/dailySweep.ts [--repo PATH] [--dry-run] [--now ISO]
//
// Exit codes:
//   0 — sweep ran (with or without changes)
//   2 — tooling error (could not read manifests, etc.)
//
// Note on data model: the original spec described an engine-level
// `hiveops_warn_mode_expires` field with a `mode: warn → enforce` flip.
// HiveOps actually models warn-mode per-rule via the override schema's
// `warn_until` field on each `mode: warn` entry. This sweep operates
// on the actual schema; the "flip to enforce" semantics are preserved
// (rules revert to default fail) by removing the expired override
// entry. See tools/hive-ops/overrides.ts for the schema reference.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";
import YAML from "yaml";
import type { OverrideEntry } from "./types.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SOON_HOURS = 24;
const AGENT = "hive-ops-daily-sweep";

interface SweepArgs {
  repo: string;
  dryRun: boolean;
  now: Date;
}

interface ExpiredEntry {
  engineSlug: string;
  manifestPath: string;
  rule: string;
  warnUntil: string;
  reason: string;
  issue: string;
  reviewer: string;
  date: string;
}

interface ImminentEntry {
  engineSlug: string;
  manifestPath: string;
  rule: string;
  warnUntil: string;
  hoursLeft: number;
  reason: string;
  issue: string;
}

interface SweepReport {
  scanned: number;
  flipped: ExpiredEntry[];
  expiringSoon: ImminentEntry[];
  errors: string[];
  /** Engines whose ENGINE_GRAMMAR.md was rewritten this run. */
  mutated: string[];
}

function parseArgs(argv: string[]): SweepArgs | null {
  let repo = process.cwd();
  let dryRun = false;
  let now = new Date();
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--repo") { repo = resolve(argv[++i] ?? ""); continue; }
    if (a === "--dry-run") { dryRun = true; continue; }
    if (a === "--now") {
      const v = argv[++i];
      const parsed = v ? new Date(v) : new Date(NaN);
      if (Number.isNaN(parsed.getTime())) return null;
      now = parsed;
      continue;
    }
    if (a === "-h" || a === "--help") return null;
    return null;
  }
  return { repo, dryRun, now };
}

function usage(): string {
  return [
    "Usage: tsx tools/hive-ops/dailySweep.ts [flags]",
    "",
    "Scans every apps/<engine>/ENGINE_GRAMMAR.md, removes expired warn-mode",
    "override entries (so the rule reverts to default enforce), and writes",
    "alerts to the hive_alerts table.",
    "",
    "Flags:",
    "  --repo <path>     repo root (default: cwd)",
    "  --dry-run         report what would change without writing files or alerts",
    "  --now <iso>       override 'now' for deterministic testing (e.g. 2026-05-13T12:00:00Z)",
  ].join("\n");
}

/** Find every engine root under apps/ with an ENGINE_GRAMMAR.md. */
export function findEngineManifests(repoRoot: string): Array<{ slug: string; manifestPath: string }> {
  const appsDir = join(repoRoot, "apps");
  if (!existsSync(appsDir)) return [];
  const out: Array<{ slug: string; manifestPath: string }> = [];
  for (const entry of readdirSync(appsDir)) {
    const full = join(appsDir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (!st.isDirectory()) continue;
    const manifestPath = join(full, "ENGINE_GRAMMAR.md");
    if (existsSync(manifestPath)) out.push({ slug: entry, manifestPath });
  }
  return out;
}

/** Pull the YAML inside the ## Hive-Ops Overrides fenced block. */
function extractOverridesYaml(body: string): { yaml: string; matchStart: number; matchEnd: number } | null {
  const re = /^##\s+Hive-Ops Overrides\s*\n+\s*```ya?ml\s*\n([\s\S]*?)\n```/im;
  const m = body.match(re);
  if (!m || m.index === undefined) return null;
  return { yaml: m[1], matchStart: m.index, matchEnd: m.index + m[0].length };
}

/** Categorise overrides in a single manifest. */
export function categoriseOverrides(
  raw: string,
  now: Date,
): { expired: OverrideEntry[]; imminent: Array<OverrideEntry & { hoursLeft: number }> } {
  const parsed = matter(raw);
  const block = extractOverridesYaml(parsed.content);
  if (!block) return { expired: [], imminent: [] };

  let yaml: unknown;
  try { yaml = YAML.parse(block.yaml); } catch { return { expired: [], imminent: [] }; }
  if (!yaml || typeof yaml !== "object") return { expired: [], imminent: [] };
  const root = yaml as { overrides?: unknown };
  if (!Array.isArray(root.overrides)) return { expired: [], imminent: [] };

  const expired: OverrideEntry[] = [];
  const imminent: Array<OverrideEntry & { hoursLeft: number }> = [];
  const nowMs = now.getTime();

  for (const item of root.overrides) {
    if (!item || typeof item !== "object") continue;
    const e = item as Partial<OverrideEntry>;
    if (e.mode !== "warn") continue;
    if (typeof e.warn_until !== "string" || !ISO_DATE.test(e.warn_until)) continue;
    // Treat warn_until as end-of-day UTC: an entry with warn_until=2026-05-13
    // remains valid through 2026-05-13T23:59:59Z. Past that → expired.
    const warnEndMs = Date.parse(e.warn_until + "T23:59:59Z");
    if (Number.isNaN(warnEndMs)) continue;
    const fullEntry = e as OverrideEntry;
    if (warnEndMs < nowMs) {
      expired.push(fullEntry);
    } else {
      const hoursLeft = (warnEndMs - nowMs) / (1000 * 60 * 60);
      if (hoursLeft <= SOON_HOURS) {
        imminent.push({ ...fullEntry, hoursLeft });
      }
    }
  }

  return { expired, imminent };
}

/** Remove the listed rule entries from the ## Hive-Ops Overrides YAML
 *  block. If the block becomes empty, the entire section is removed.
 *  Pure: takes raw markdown in, returns rewritten markdown. */
export function stripExpiredOverrides(raw: string, expiredRuleIds: ReadonlySet<string>): string {
  if (expiredRuleIds.size === 0) return raw;
  const parsed = matter(raw);
  const body = parsed.content;
  const block = extractOverridesYaml(body);
  if (!block) return raw;

  let yaml: unknown;
  try { yaml = YAML.parse(block.yaml); } catch { return raw; }
  if (!yaml || typeof yaml !== "object") return raw;
  const root = yaml as { overrides?: unknown };
  if (!Array.isArray(root.overrides)) return raw;

  const remaining = root.overrides.filter((item) => {
    if (!item || typeof item !== "object") return true;
    const e = item as Partial<OverrideEntry>;
    return !(typeof e.rule === "string" && expiredRuleIds.has(e.rule));
  });

  let replacement: string;
  if (remaining.length === 0) {
    // Remove the whole section, including its heading + fenced block +
    // any trailing whitespace newlines, but keep the surrounding prose.
    const sectionRe = /\n*##\s+Hive-Ops Overrides\s*\n+\s*```ya?ml\s*\n[\s\S]*?\n```\s*\n*/i;
    const newBody = body.replace(sectionRe, "\n\n");
    return rebuildWithBody(parsed, newBody);
  }

  // Re-serialize the remaining overrides. yaml package preserves order
  // for arrays; the field order inside each entry is reset to insertion
  // order which is fine for an audit-tracked file.
  const rewrittenYaml = YAML.stringify({ overrides: remaining }, { lineWidth: 0 }).trimEnd();
  replacement = `## Hive-Ops Overrides\n\n\`\`\`yaml\n${rewrittenYaml}\n\`\`\``;
  const newBody =
    body.slice(0, block.matchStart) + replacement + body.slice(block.matchEnd);
  return rebuildWithBody(parsed, newBody);
}

function rebuildWithBody(parsed: matter.GrayMatterFile<string>, newBody: string): string {
  // gray-matter's stringify re-emits the frontmatter; we want to keep
  // it byte-identical when frontmatter is unchanged, so we splice
  // manually.
  if (!parsed.matter) return newBody.trimStart();
  const fm = parsed.matter; // raw frontmatter without --- fences
  return `---\n${fm}\n---\n${newBody}`.replace(/\n{3,}$/, "\n\n");
}

/** Insert a single hive_alerts row via psql. Best-effort: if DATABASE_URL
 *  is unset (local dry-run), prints the row instead of inserting. */
function insertAlert(
  tier: 1 | 2 | 3,
  subject: string,
  body: string,
  actionRequired: boolean,
  actionUrl?: string,
): void {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log(`[sweep] (no DATABASE_URL — would insert) tier=${tier} subject=${subject}`);
    return;
  }
  const sql =
    `INSERT INTO hive_alerts (tier, agent, subject, body, action_required, action_url) ` +
    `VALUES (${tier}, ${dollarQuote(AGENT)}, ${dollarQuote(subject)}, ${dollarQuote(body)}, ${actionRequired}, ${actionUrl ? dollarQuote(actionUrl) : "NULL"});`;
  execFileSync("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "-c", sql], { stdio: "inherit" });
}

/** PostgreSQL dollar-quoted string literal, immune to embedded quotes. */
function dollarQuote(s: string): string {
  let tag = "tag";
  while (s.includes(`$${tag}$`)) tag = "t" + Math.random().toString(36).slice(2, 8);
  return `$${tag}$${s}$${tag}$`;
}

export async function runSweep(args: SweepArgs): Promise<SweepReport> {
  const manifests = findEngineManifests(args.repo);
  const report: SweepReport = {
    scanned: manifests.length,
    flipped: [],
    expiringSoon: [],
    errors: [],
    mutated: [],
  };

  for (const { slug, manifestPath } of manifests) {
    let raw: string;
    try { raw = readFileSync(manifestPath, "utf8"); } catch (err) {
      report.errors.push(`${slug}: read failed — ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    const { expired, imminent } = categoriseOverrides(raw, args.now);

    for (const e of expired) {
      report.flipped.push({
        engineSlug: slug,
        manifestPath,
        rule: e.rule,
        warnUntil: e.warn_until ?? "",
        reason: e.reason,
        issue: e.issue,
        reviewer: e.reviewer,
        date: e.date,
      });
    }
    for (const e of imminent) {
      report.expiringSoon.push({
        engineSlug: slug,
        manifestPath,
        rule: e.rule,
        warnUntil: e.warn_until ?? "",
        hoursLeft: e.hoursLeft,
        reason: e.reason,
        issue: e.issue,
      });
    }

    if (expired.length > 0 && !args.dryRun) {
      const rewrites = stripExpiredOverrides(raw, new Set(expired.map((e) => e.rule)));
      writeFileSync(manifestPath, rewrites);
      report.mutated.push(slug);
    }
  }

  if (!args.dryRun) {
    for (const f of report.flipped) {
      insertAlert(
        2,
        `HiveOps: ${f.engineSlug} warn-mode expired and flipped to enforce`,
        [
          `Engine:     ${f.engineSlug}`,
          `Rule:       ${f.rule}`,
          `warn_until: ${f.warnUntil} (now past)`,
          `Original reason: ${f.reason}`,
          `Tracking issue:  ${f.issue}`,
          `Originally added: ${f.date} by ${f.reviewer}`,
          ``,
          `The override entry has been removed from ${f.manifestPath}.`,
          `The next HiveOps PR audit will report ${f.rule} as fail and block merges`,
          `until the underlying issue is fixed or a new override is added.`,
        ].join("\n"),
        true,
        f.issue,
      );
    }
    for (const i of report.expiringSoon) {
      insertAlert(
        3,
        `HiveOps: ${i.engineSlug} warn-mode expires in ${Math.max(0, Math.floor(i.hoursLeft))} hours`,
        [
          `Engine:     ${i.engineSlug}`,
          `Rule:       ${i.rule}`,
          `warn_until: ${i.warnUntil}`,
          `Hours left: ${i.hoursLeft.toFixed(1)}`,
          `Reason:     ${i.reason}`,
          `Tracking issue: ${i.issue}`,
          ``,
          `Either fix the underlying issue, extend the warn (within the 30-day`,
          `ceiling), or convert to waive before expiry — otherwise tomorrow's`,
          `sweep will flip ${i.rule} to enforce.`,
        ].join("\n"),
        false,
        i.issue,
      );
    }
    insertAlert(
      3,
      `HiveOps daily sweep ${args.now.toISOString().slice(0, 10)}: ${report.flipped.length} flipped, ${report.expiringSoon.length} expiring soon`,
      [
        `Manifests scanned: ${report.scanned}`,
        `Flipped to enforce: ${report.flipped.length}`,
        `Expiring within ${SOON_HOURS}h: ${report.expiringSoon.length}`,
        `Engines mutated: ${report.mutated.join(", ") || "none"}`,
        `Errors: ${report.errors.length}`,
      ].join("\n"),
      false,
    );
  }

  return report;
}

/** Render a human-readable summary for stdout / GitHub step summary. */
export function formatReport(report: SweepReport, args: SweepArgs): string {
  const lines: string[] = [];
  lines.push(`HiveOps daily sweep — ${args.now.toISOString()}`);
  lines.push(`  repo:    ${args.repo}`);
  lines.push(`  dry-run: ${args.dryRun}`);
  lines.push(`  scanned: ${report.scanned} manifests`);
  lines.push("");
  if (report.flipped.length === 0) {
    lines.push("FLIPPED → ENFORCE: none");
  } else {
    lines.push(`FLIPPED → ENFORCE: ${report.flipped.length}`);
    for (const f of report.flipped) {
      lines.push(`  ✗ ${f.engineSlug} :: ${f.rule} (warn_until ${f.warnUntil}) — ${f.issue}`);
    }
  }
  lines.push("");
  if (report.expiringSoon.length === 0) {
    lines.push(`EXPIRING WITHIN ${SOON_HOURS}h: none`);
  } else {
    lines.push(`EXPIRING WITHIN ${SOON_HOURS}h: ${report.expiringSoon.length}`);
    for (const i of report.expiringSoon) {
      lines.push(`  ! ${i.engineSlug} :: ${i.rule} (${i.hoursLeft.toFixed(1)}h left) — ${i.issue}`);
    }
  }
  lines.push("");
  if (report.mutated.length > 0) {
    lines.push(`Mutated manifests: ${report.mutated.join(", ")}`);
  }
  if (report.errors.length > 0) {
    lines.push("");
    lines.push("ERRORS:");
    for (const e of report.errors) lines.push(`  ${e}`);
  }
  return lines.join("\n");
}

/** GitHub-issue-formatted Markdown summary. */
export function formatIssueBody(report: SweepReport, args: SweepArgs): string {
  const lines: string[] = [];
  lines.push(`# HiveOps Daily Sweep — ${args.now.toISOString().slice(0, 10)}`);
  lines.push("");
  lines.push(`Run timestamp: \`${args.now.toISOString()}\``);
  lines.push(`Manifests scanned: **${report.scanned}**`);
  lines.push("");
  lines.push(`## Flipped to enforce (${report.flipped.length})`);
  if (report.flipped.length === 0) {
    lines.push("_None this run._");
  } else {
    lines.push("| Engine | Rule | warn_until (expired) | Tracking issue |");
    lines.push("|---|---|---|---|");
    for (const f of report.flipped) {
      lines.push(`| \`${f.engineSlug}\` | \`${f.rule}\` | ${f.warnUntil} | ${f.issue} |`);
    }
    lines.push("");
    lines.push(
      "These rules have reverted to default enforce. The next HiveOps PR audit will report them as fail.",
    );
  }
  lines.push("");
  lines.push(`## Expiring within ${SOON_HOURS}h (${report.expiringSoon.length})`);
  if (report.expiringSoon.length === 0) {
    lines.push("_None._");
  } else {
    lines.push("| Engine | Rule | Hours left | Tracking issue |");
    lines.push("|---|---|---|---|");
    for (const i of report.expiringSoon) {
      lines.push(`| \`${i.engineSlug}\` | \`${i.rule}\` | ${i.hoursLeft.toFixed(1)} | ${i.issue} |`);
    }
  }
  lines.push("");
  if (report.errors.length > 0) {
    lines.push("## Errors");
    for (const e of report.errors) lines.push(`- ${e}`);
    lines.push("");
  }
  lines.push("---");
  lines.push("_Generated by `.github/workflows/hive-ops-daily-sweep.yml`._");
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    console.error(usage());
    process.exit(2);
  }
  const report = await runSweep(args);
  console.log(formatReport(report, args));

  // Emit the issue body to a known file when running under GitHub
  // Actions, so the workflow can pick it up without re-running anything.
  if (process.env.GITHUB_OUTPUT && !args.dryRun) {
    try {
      writeFileSync("/tmp/hive-ops-sweep-issue.md", formatIssueBody(report, args));
    } catch {
      // Non-fatal — workflow will see the stdout summary either way.
    }
  }

  process.exit(0);
}

// Only run when invoked directly. Importing this file from tests must
// not trigger main().
const isCli =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  /dailySweep\.(ts|js|mjs)$/.test(process.argv[1]);
if (isCli) {
  main().catch((err) => {
    console.error("hive-ops daily-sweep crashed:", err);
    process.exit(2);
  });
}
