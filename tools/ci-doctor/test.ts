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
