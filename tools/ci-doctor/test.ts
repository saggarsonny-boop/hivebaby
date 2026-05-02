import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diagnose } from './index.ts';

test('missing-secret failure → alert only, exact var name', () => {
  const log = [
    '##[group]Run actions/foo@v1',
    'env:',
    '  token: ',
    '##[endgroup]',
    'Error: Input required and not supplied: ANTHROPIC_API_KEY',
    'Error: Process completed with exit code 1.',
  ].join('\n');

  const d = diagnose(log);
  assert.equal(d.rule, 'missing_secret');
  assert.equal(d.autoFixable, false);
  assert.match(d.cause, /missing secret: ANTHROPIC_API_KEY/);
  assert.match(d.suggestedFix, /Settings.+Secrets/);
});

test('missing-dependency failure → autoFixable, mentions package.json', () => {
  const log = [
    '> hive-baby@0.1.0 build',
    '> next build',
    '',
    "Error: Cannot find module 'left-pad'",
    'Require stack:',
    '- /workspaces/hive-baby/scripts/build.js',
    'npm ERR! code MODULE_NOT_FOUND',
    "npm ERR! 404 'left-pad@*' is not in the npm registry.",
  ].join('\n');

  const d = diagnose(log);
  assert.equal(d.rule, 'missing_dep');
  assert.equal(d.autoFixable, true);
  assert.match(d.cause, /missing dependency.*left-pad/);
  assert.match(d.suggestedFix, /package\.json|npm ci/);
});

test('missing_secret extracts non-conventional names verbatim (CF_TOKEN, CLERK_SK, ANTHROPIC_KEY)', () => {
  const cases: Array<[string, string]> = [
    ['Error: Input required and not supplied: CF_TOKEN', 'CF_TOKEN'],
    ['Error: Input required and not supplied: CLERK_SK', 'CLERK_SK'],
    ['Error: Input required and not supplied: ANTHROPIC_KEY', 'ANTHROPIC_KEY'],
    ['Error: secret RESEND_API_KEY not found', 'RESEND_API_KEY'],
    ['Error: secret GH_PAT not found', 'GH_PAT'],
  ];
  for (const [log, name] of cases) {
    const d = diagnose(log);
    assert.equal(d.rule, 'missing_secret', `expected missing_secret for ${name}`);
    assert.match(d.cause, new RegExp(`missing secret: ${name}`), `cause must include ${name}`);
    assert.match(d.suggestedFix, new RegExp(`\`${name}\``), `fix must reference ${name}`);
  }
});

test('missing_env_var detects every secret prefix actually used in the repo', () => {
  const realNames = [
    'ANTHROPIC_KEY',
    'ANTHROPIC_API_KEY',
    'CF_TOKEN',
    'CF_API_TOKEN',
    'CF_ACCOUNT',
    'CF_ZONE',
    'CLERK_PK',
    'CLERK_SK',
    'CLOUDFLARE_API_TOKEN',
    'CLOUDFLARE_ZONE_ID',
    'STRIPE_KEY',
    'STRIPE_PK',
    'STRIPE_SECRET_KEY',
    'VERCEL_TOKEN',
    'VERCEL_TOKEN_MAIN',
    'RESEND_API_KEY',
    'DATABASE_URL',
    'CRON_SECRET',
    'GH_PAT',
    'GITHUB_TOKEN',
  ];
  for (const name of realNames) {
    const log = `Error: ${name} is not set`;
    const d = diagnose(log);
    assert.equal(d.rule, 'missing_env_var', `expected missing_env_var for ${name} (got ${d.rule})`);
    assert.match(d.cause, new RegExp(`missing env var: ${name}`));
  }
});

test('unknown failure → alert only, evidence contains log', () => {
  const log = [
    'Step 1: do a thing',
    'Step 2: do another thing',
    'Mystery error: 0xDEADBEEF',
    'Build halted.',
  ].join('\n');

  const d = diagnose(log);
  assert.equal(d.rule, 'unknown');
  assert.equal(d.autoFixable, false);
  assert.match(d.evidence, /Mystery error/);
  assert.match(d.suggestedFix, /No rule matched|Manual review|diagnose/i);
});
