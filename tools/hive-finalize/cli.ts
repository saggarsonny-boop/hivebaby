// HiveFinalize — CLI entry point.
// Usage:
//   npx tsx tools/hive-finalize/cli.ts <engine-slug>
//   npx tsx tools/hive-finalize/cli.ts /abs/path/to/ENGINE_GRAMMAR.md
//
// Resolves the slug to an ENGINE_GRAMMAR.md path inside the hivebaby
// monorepo, runs the validator, and prints a report. The operational
// checklist runner exists as a stub in checklist.ts but is intentionally
// not invoked here yet — wire in once at least one engine is migrated.

import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseManifestFile, validateManifest } from './validate.js';
import type { FinalizeReport, RuleResult } from './types.js';

// Find the hivebaby repo root by walking up from this file.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..');

const SLUG_CANDIDATE_DIRS = ['', 'apps'];

function resolveManifestPath(arg: string): string | null {
  // Absolute or relative path to a file?
  if (arg.includes('/') || arg.includes('\\')) {
    const abs = path.resolve(arg);
    if (existsSync(abs) && statSync(abs).isFile()) return abs;
    if (existsSync(abs) && statSync(abs).isDirectory()) {
      const f = path.join(abs, 'ENGINE_GRAMMAR.md');
      if (existsSync(f)) return f;
    }
    return null;
  }
  // Slug — try each candidate location.
  for (const sub of SLUG_CANDIDATE_DIRS) {
    const f = path.join(REPO_ROOT, sub, arg, 'ENGINE_GRAMMAR.md');
    if (existsSync(f)) return f;
  }
  return null;
}

function summariseRules(rules: RuleResult[]): string {
  const counts = { pass: 0, fail: 0, skip: 0 };
  for (const r of rules) counts[r.status]++;
  return `pass=${counts.pass}  fail=${counts.fail}  skip=${counts.skip}`;
}

function decideVerdict(
  hasFrontmatter: boolean,
  rules: RuleResult[],
): FinalizeReport['verdict'] {
  if (!hasFrontmatter) return 'skipped';
  return rules.some(r => r.status === 'fail') ? 'fail' : 'pass';
}

function statusGlyph(status: string): string {
  switch (status) {
    case 'pass': return '[ok]';
    case 'fail': return '[FAIL]';
    case 'skip': return '[skip]';
    case 'not_implemented': return '[stub]';
    default: return `[${status}]`;
  }
}

function printReport(report: FinalizeReport): void {
  const out: string[] = [];
  out.push('');
  out.push(`HiveFinalize — ${report.engine ?? '(no engine field)'}`);
  out.push(`  manifest: ${path.relative(process.cwd(), report.manifestPath)}`);
  out.push('');

  if (!report.hasFrontmatter) {
    out.push('engine has no canonical frontmatter, skipping validation.');
    out.push('(Migrate this engine to the schema in docs/specs/manifest-schema-final.md to validate.)');
    out.push('');
    out.push(`Verdict: ${report.verdict}`);
    process.stdout.write(out.join('\n') + '\n');
    return;
  }

  out.push('Schema rules:');
  for (const r of report.rules) {
    out.push(`  ${statusGlyph(r.status).padEnd(8)} ${r.rule.padEnd(4)} ${r.title}`);
    if (r.status !== 'pass') out.push(`           ${r.message}`);
  }
  out.push(`  ${summariseRules(report.rules)}`);
  out.push('');
  out.push('Operational checklist: not yet invoked from CLI (see checklist.ts stubs).');
  out.push('');
  out.push(`Verdict: ${report.verdict}`);
  process.stdout.write(out.join('\n') + '\n');
}

async function main(): Promise<number> {
  const arg = process.argv[2];
  if (!arg) {
    process.stderr.write(
      'Usage: tsx cli.ts <engine-slug | path-to-ENGINE_GRAMMAR.md>\n',
    );
    return 2;
  }

  const manifestPath = resolveManifestPath(arg);
  if (!manifestPath) {
    process.stderr.write(`Could not resolve "${arg}" to an ENGINE_GRAMMAR.md.\n`);
    process.stderr.write(`Searched: ${SLUG_CANDIDATE_DIRS.map(s => path.join(REPO_ROOT, s, arg, 'ENGINE_GRAMMAR.md')).join(', ')}\n`);
    return 2;
  }

  const parsed = parseManifestFile(manifestPath);
  const rules = parsed.hasFrontmatter
    ? validateManifest(parsed.manifest, parsed.body)
    : [];

  const report: FinalizeReport = {
    engine: parsed.manifest.engine ?? null,
    manifestPath,
    hasFrontmatter: parsed.hasFrontmatter,
    rules,
    steps: [],
    verdict: decideVerdict(parsed.hasFrontmatter, rules),
  };

  printReport(report);
  return report.verdict === 'fail' ? 1 : 0;
}

void main().then(
  code => process.exit(code),
  (err: unknown) => {
    const msg = err instanceof Error ? (err.stack ?? err.message) : String(err);
    process.stderr.write(`HiveFinalize crashed: ${msg}\n`);
    process.exit(2);
  },
);
