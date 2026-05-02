/**
 * ci-doctor — auto-diagnose failed GitHub Actions workflows for hivebaby.
 *
 * Reads a failing run, classifies the failure against a fixed ruleset,
 * writes a tier-1 row into hive_alerts, and (when safe) opens a draft PR
 * with a workflow-file-only patch. Never auto-merges. Never edits app code.
 */

import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const WORKFLOW_WHITELIST = /^\.github\/workflows\/[A-Za-z0-9._-]+\.ya?ml$/;

export interface Diagnosis {
  rule:
    | 'missing_dep'
    | 'missing_secret'
    | 'missing_file'
    | 'deprecated_action'
    | 'script_exit'
    | 'timeout'
    | 'missing_env_var'
    | 'unknown';
  cause: string;
  evidence: string;
  suggestedFix: string;
  autoFixable: boolean;
}

export interface FailureContext {
  runId: number;
  runUrl: string;
  workflowName: string;
  workflowPath: string;
  jobName: string;
  stepName: string;
  log: string;
  headBranch: string;
  defaultBranch: string;
}

export interface CiDoctorConfig {
  monitored_workflows: string;
  auto_fix_enabled: boolean;
  auto_fix_whitelist: string[];
  alert_on_unknown: boolean;
  max_auto_prs_per_day: number;
}

// ---------- GitHub API helpers ----------

function ghHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is required');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ci-doctor/0.1',
  };
}

async function ghJson(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { ...ghHeaders(), 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`GitHub API ${res.status} on ${path}: ${t.slice(0, 300)}`);
  }
  return res.json();
}

async function ghText(path: string): Promise<string> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: ghHeaders(),
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} on ${path}`);
  }
  return res.text();
}

// ---------- fetchFailure ----------

export async function fetchFailure(runId: number): Promise<FailureContext> {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo) throw new Error('GITHUB_REPOSITORY is required');

  const run = await ghJson(`/repos/${repo}/actions/runs/${runId}`);
  const jobsResp = await ghJson(`/repos/${repo}/actions/runs/${runId}/jobs?per_page=100`);
  const jobs: any[] = jobsResp.jobs || [];
  const failedJob = jobs.find((j) => j.conclusion === 'failure');
  if (!failedJob) {
    throw new Error(`No failed job found in run ${runId}`);
  }
  const failedStep = (failedJob.steps || []).find((s: any) => s.conclusion === 'failure');

  let logTail = '';
  try {
    const fullLog = await ghText(`/repos/${repo}/actions/jobs/${failedJob.id}/logs`);
    const lines = fullLog.split('\n');
    logTail = lines.slice(-100).join('\n');
  } catch (e) {
    logTail = `[ci-doctor] could not fetch job log: ${(e as Error).message}`;
  }

  return {
    runId,
    runUrl: run.html_url,
    workflowName: run.name || run.path || 'unknown',
    workflowPath: run.path || '',
    jobName: failedJob.name,
    stepName: failedStep?.name || '(unknown step)',
    log: logTail,
    headBranch: run.head_branch || 'main',
    defaultBranch: run.repository?.default_branch || 'main',
  };
}

// ---------- diagnose ----------

// Covers every secret prefix actually in use across the hivebaby repo.
// Audit source: `grep -rhoE 'secrets\.[A-Z_][A-Z0-9_]+' .github/workflows scripts`.
// If you add a new family of secrets, append its prefix here.
const ENV_VAR_RE =
  /\b(ANTHROPIC[A-Z0-9_]*|STRIPE[A-Z0-9_]*|CLERK[A-Z0-9_]*|CF_[A-Z0-9_]+|CLOUDFLARE[A-Z0-9_]*|VERCEL[A-Z0-9_]*|RESEND[A-Z0-9_]*|NEON[A-Z0-9_]*|DATABASE_URL|CRON_SECRET|GH_PAT|GITHUB_TOKEN)\b/;

export function diagnose(log: string): Diagnosis {
  const lines = log.split('\n');

  // Rule 2: missing secret
  const secretA = log.match(/Error:\s*Input required and not supplied(?::\s*([A-Za-z0-9_-]+))?/);
  const secretB = log.match(/Error:\s*secret\s+([A-Za-z0-9_-]+)\s+not found/i);
  if (secretA || secretB) {
    const name = (secretB && secretB[1]) || (secretA && secretA[1]) || 'unknown';
    const evidence =
      lines.filter((l) => /Input required and not supplied|secret .* not found/i.test(l)).join('\n') ||
      (secretA?.[0] || secretB?.[0] || '');
    return {
      rule: 'missing_secret',
      cause: `missing secret: ${name}`,
      evidence,
      suggestedFix:
        `Add secret \`${name}\` in repo Settings → Secrets and variables → Actions, ` +
        `then re-run the failed job.`,
      autoFixable: false,
    };
  }

  // Rule 7: env var missing — runs early because exit-1 from rule 5 might also
  // mention these vars; prefer the env-var diagnosis when present.
  const envHit = lines.find((l) => ENV_VAR_RE.test(l) && /missing|undefined|not\s+set|not\s+defined|not\s+configured|required/i.test(l));
  if (envHit) {
    const m = envHit.match(ENV_VAR_RE);
    const name = m ? m[1] : 'unknown';
    return {
      rule: 'missing_env_var',
      cause: `missing env var: ${name}`,
      evidence: envHit.trim(),
      suggestedFix:
        `Set \`${name}\` in this workflow's \`env:\` block or add it as a repo secret ` +
        `and reference it via \`${name}: \${{ secrets.${name} }}\`.`,
      autoFixable: false,
    };
  }

  // Rule 1: missing dependency
  const npm404 = log.match(/npm ERR! 404[^\n]*?(?:'?([@a-zA-Z0-9._/-]+)'?)?/);
  const cantFind = log.match(/Cannot find module ['"]([^'"]+)['"]/);
  if (npm404 || cantFind) {
    const mod = (cantFind && cantFind[1]) || (npm404 && npm404[1]) || 'unknown';
    const evidence = lines
      .filter((l) => /npm ERR!|Cannot find module/.test(l))
      .slice(0, 8)
      .join('\n');
    return {
      rule: 'missing_dep',
      cause: `missing dependency${mod !== 'unknown' ? `: ${mod}` : ''}`,
      evidence,
      suggestedFix:
        `If \`${mod}\` is a real package, add it to package.json (\`npm i ${mod}\`). ` +
        `If the workflow runs \`npm install\` against a missing lockfile, switch the install ` +
        `step to \`npm ci\` and ensure package-lock.json is committed.`,
      autoFixable: true,
    };
  }

  // Rule 4: deprecated action
  const deprec =
    log.match(/(actions\/[a-z0-9-]+)@v(\d+)[^\n]*?(?:is deprecated|deprecation warning)/i) ||
    log.match(/The `?(actions\/[a-z0-9-]+)@v(\d+)`?[^\n]*?(?:deprecated)/i);
  if (deprec) {
    const action = deprec[1];
    const oldV = parseInt(deprec[2], 10);
    return {
      rule: 'deprecated_action',
      cause: `deprecated action: ${action}@v${oldV}`,
      evidence: deprec[0],
      suggestedFix: `Bump ${action} from @v${oldV} to @v${oldV + 1} (current major).`,
      autoFixable: true,
    };
  }

  // Rule 3: missing file / wrong working-directory
  const noFile = log.match(/No such file or directory[^\n]*?([./][^\s'"`]+)/);
  if (noFile) {
    return {
      rule: 'missing_file',
      cause: `missing file or wrong working-directory: ${noFile[1]}`,
      evidence: noFile[0],
      suggestedFix:
        `Confirm the path \`${noFile[1]}\` exists in the repo. If the step uses ` +
        `\`working-directory:\`, verify it points at the correct subdirectory.`,
      autoFixable: true,
    };
  }

  // Rule 6: timeout / canceled
  if (/Timeout|The operation was canceled/i.test(log)) {
    const ev = lines.filter((l) => /timeout|canceled/i.test(l)).slice(0, 5).join('\n');
    return {
      rule: 'timeout',
      cause: 'timeout / job canceled',
      evidence: ev,
      suggestedFix:
        `Increase \`timeout-minutes\`, split the job into smaller steps, ` +
        `or check for runner capacity issues. Re-run when traffic settles.`,
      autoFixable: false,
    };
  }

  // Rule 5: bare exit 1..9
  const exitRe = /\bexit\s+code\s+([1-9])\b|\bexit\s+([1-9])\b/;
  const exitIdx = lines.findIndex((l) => exitRe.test(l));
  if (exitIdx >= 0) {
    const m = lines[exitIdx].match(exitRe);
    const code = (m && (m[1] || m[2])) || '?';
    const ctx = lines.slice(Math.max(0, exitIdx - 20), exitIdx + 1).join('\n');
    return {
      rule: 'script_exit',
      cause: `script-level guard tripped (exit ${code})`,
      evidence: ctx,
      suggestedFix:
        `A script-level check fired. Review the 20 lines preceding the exit ` +
        `(included in evidence) — that's where the assertion lives.`,
      autoFixable: false,
    };
  }

  // No match
  return {
    rule: 'unknown',
    cause: 'unknown failure',
    evidence: lines.slice(0, 80).join('\n'),
    suggestedFix:
      `No rule matched. Read the run log directly. ` +
      `If this is a recurring class of failure, add a rule to ci-doctor's diagnose().`,
    autoFixable: false,
  };
}

// ---------- writeAlert ----------

function dollarQuote(s: string): string {
  let tag = 'hd';
  while (s.includes(`$${tag}$`)) tag = 'hd' + Math.random().toString(36).slice(2, 8);
  return `$${tag}$${s}$${tag}$`;
}

export function writeAlert(diagnosis: Diagnosis, ctx: FailureContext, prUrl?: string): void {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('[ci-doctor] DATABASE_URL not set — skipping hive_alerts insert.');
    return;
  }

  const subject = `🔧 CI failed: ${ctx.workflowName} — ${diagnosis.cause}`;
  const bodyLines = [
    `Workflow:     ${ctx.workflowName}`,
    `Workflow file:${ctx.workflowPath}`,
    `Job:          ${ctx.jobName}`,
    `Step:         ${ctx.stepName}`,
    ``,
    `Cause:        ${diagnosis.cause}`,
    `Rule:         ${diagnosis.rule}`,
    `Auto-fixable: ${diagnosis.autoFixable}`,
    ``,
    `Evidence:`,
    diagnosis.evidence,
    ``,
    `Suggested fix:`,
    diagnosis.suggestedFix,
    ``,
    `Failing run: ${ctx.runUrl}`,
  ];
  if (prUrl) bodyLines.push(`Auto-fix PR: ${prUrl}`);
  const body = bodyLines.join('\n');
  const actionUrl = prUrl || ctx.runUrl;

  const sql =
    `INSERT INTO hive_alerts (tier, agent, subject, body, action_required, action_url) ` +
    `VALUES (1, 'ci-doctor', ${dollarQuote(subject)}, ${dollarQuote(body)}, true, ${dollarQuote(actionUrl)});`;

  execFileSync('psql', [dbUrl, '-v', 'ON_ERROR_STOP=1', '-c', sql], { stdio: 'inherit' });
  console.log('[ci-doctor] alert written to hive_alerts.');
}

// ---------- maybeOpenPR ----------

function assertWhitelisted(file: string): void {
  if (!WORKFLOW_WHITELIST.test(file)) {
    throw new Error(`ci-doctor: refusing to write outside whitelist: ${file}`);
  }
}

function computePatch(diagnosis: Diagnosis, wfPath: string): Record<string, string> | null {
  if (!wfPath || !existsSync(wfPath)) return null;
  assertWhitelisted(wfPath);

  if (diagnosis.rule === 'deprecated_action') {
    const m = diagnosis.cause.match(/deprecated action:\s+(actions\/[a-z0-9-]+)@v(\d+)/);
    if (!m) return null;
    const action = m[1];
    const oldV = parseInt(m[2], 10);
    const newV = oldV + 1;
    const original = readFileSync(wfPath, 'utf8');
    const re = new RegExp(`(${action.replace(/\//g, '\\/')})@v${oldV}\\b`, 'g');
    const updated = original.replace(re, `$1@v${newV}`);
    if (updated === original) return null;
    return { [wfPath]: updated };
  }

  // Other rules: alert-only for now (no safe patch we can generate from logs alone).
  return null;
}

async function countPRsToday(repo: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const q = encodeURIComponent(`repo:${repo} is:pr head:ci-doctor/ created:>=${today}T00:00:00Z`);
  const res = await ghJson(`/search/issues?q=${q}`);
  return res.total_count || 0;
}

export async function maybeOpenPR(
  diagnosis: Diagnosis,
  ctx: FailureContext,
  cfg: CiDoctorConfig,
): Promise<string | null> {
  if (!cfg.auto_fix_enabled) {
    console.log('[ci-doctor] auto_fix_enabled = false, skipping PR.');
    return null;
  }
  if (!diagnosis.autoFixable) return null;

  const repo = process.env.GITHUB_REPOSITORY!;
  const cap = cfg.max_auto_prs_per_day;
  const used = await countPRsToday(repo);
  if (used >= cap) {
    console.log(`[ci-doctor] daily PR cap reached (${used}/${cap}) — skipping PR.`);
    return null;
  }

  const patch = computePatch(diagnosis, ctx.workflowPath);
  if (!patch) {
    console.log('[ci-doctor] no clean patch available — alert only.');
    return null;
  }

  const branch = `ci-doctor/fix-${ctx.runId}`;
  const base = ctx.defaultBranch || 'main';

  for (const file of Object.keys(patch)) assertWhitelisted(file);

  execSync(`git config user.name "ci-doctor"`);
  execSync(`git config user.email "ci-doctor@hive.baby"`);
  execSync(`git fetch origin ${base}`);
  execSync(`git checkout -B ${branch} origin/${base}`);

  for (const [file, content] of Object.entries(patch)) {
    writeFileSync(file, content);
  }

  // Final guard: refuse if any non-whitelisted file is staged.
  const status = execSync('git status --porcelain').toString().trim();
  for (const line of status.split('\n').filter(Boolean)) {
    const file = line.slice(3);
    assertWhitelisted(file);
  }

  execSync(`git add ${Object.keys(patch).map((f) => `'${f}'`).join(' ')}`);
  execSync(`git commit -m ${JSON.stringify(`ci-doctor: ${diagnosis.cause}`)}`);
  execSync(`git push -u origin ${branch}`, { stdio: 'inherit' });

  const diff = execSync(`git diff origin/${base}..${branch}`).toString().slice(0, 4000);
  const prBody = [
    `## ci-doctor auto-fix`,
    ``,
    `**Failing run:** ${ctx.runUrl}`,
    `**Workflow:** \`${ctx.workflowPath}\``,
    `**Job → Step:** ${ctx.jobName} → ${ctx.stepName}`,
    `**Cause:** ${diagnosis.cause}`,
    `**Rule:** \`${diagnosis.rule}\``,
    ``,
    `### Evidence`,
    '```',
    diagnosis.evidence,
    '```',
    ``,
    `### Suggested fix`,
    diagnosis.suggestedFix,
    ``,
    `### Diff`,
    '```diff',
    diff,
    '```',
    ``,
    `### Rollback`,
    '```bash',
    `git revert -m 1 <merge-commit-sha>`,
    `# or simply close this PR — nothing is auto-merged.`,
    '```',
    ``,
    `_ci-doctor never auto-merges. Review and merge manually._`,
  ].join('\n');

  const pr = await ghJson(`/repos/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title: `🔧 ci-doctor: auto-fix for ${ctx.workflowName}`,
      head: branch,
      base,
      body: prBody,
      draft: true,
    }),
  });
  console.log(`[ci-doctor] PR opened: ${pr.html_url}`);
  return pr.html_url as string;
}

// ---------- config loader ----------

export function loadConfig(): CiDoctorConfig {
  const cfg: CiDoctorConfig = {
    monitored_workflows: 'all',
    auto_fix_enabled: true,
    auto_fix_whitelist: [],
    alert_on_unknown: true,
    max_auto_prs_per_day: 5,
  };
  const file = join(__dirname, 'config.yml');
  if (!existsSync(file)) return cfg;
  const raw = readFileSync(file, 'utf8');
  let lastListKey: keyof CiDoctorConfig | null = null;
  for (const rawLine of raw.split('\n')) {
    const line = rawLine.replace(/#.*$/, '');
    if (!line.trim()) continue;
    const listMatch = line.match(/^\s+-\s+(.+?)\s*$/);
    if (listMatch && lastListKey) {
      (cfg[lastListKey] as string[]).push(listMatch[1].replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) {
      const k = kv[1] as keyof CiDoctorConfig;
      const v = kv[2].trim();
      if (v === '') {
        (cfg as any)[k] = [];
        lastListKey = k;
      } else if (v === 'true') (cfg as any)[k] = true;
      else if (v === 'false') (cfg as any)[k] = false;
      else if (/^\d+$/.test(v)) (cfg as any)[k] = parseInt(v, 10);
      else {
        (cfg as any)[k] = v.replace(/^['"]|['"]$/g, '');
        lastListKey = null;
      }
    }
  }
  return cfg;
}

// ---------- entry point ----------

async function main(): Promise<void> {
  const runId = parseInt(process.env.RUN_ID || '0', 10);
  if (!runId) throw new Error('RUN_ID env var is required');

  const cfg = loadConfig();
  const ctx = await fetchFailure(runId);
  console.log(
    `[ci-doctor] inspecting run ${runId} — workflow="${ctx.workflowName}" job="${ctx.jobName}" step="${ctx.stepName}"`,
  );

  const diag = diagnose(ctx.log);
  console.log(`[ci-doctor] diagnosis: rule=${diag.rule} autoFixable=${diag.autoFixable}`);
  console.log(`[ci-doctor] cause: ${diag.cause}`);

  if (diag.rule === 'unknown' && !cfg.alert_on_unknown) {
    console.log('[ci-doctor] unknown failure and alert_on_unknown=false; skipping.');
    return;
  }

  let prUrl: string | null = null;
  try {
    prUrl = await maybeOpenPR(diag, ctx, cfg);
  } catch (e) {
    console.error('[ci-doctor] maybeOpenPR failed:', (e as Error).message);
  }

  writeAlert(diag, ctx, prUrl || undefined);
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((e) => {
    console.error('[ci-doctor] fatal:', e);
    process.exit(1);
  });
}
