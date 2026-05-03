// HiveFinalize — operational launch checklist runner.
//
// Mirrors the eight-item ENGINE LAUNCH CHECKLIST in CLAUDE.md plus a few
// adjacent operational concerns (DNS, backup, planet placement). Every
// step is a stub today: the function shape is right, the body returns
// `not_implemented`. Fill these in once at least one engine has been
// migrated to the canonical schema and we have something to check.

import type { Manifest, StepResult } from './types.js';

export interface ChecklistContext {
  manifest: Manifest;
  manifestPath: string;
}

type StepFn = (ctx: ChecklistContext) => Promise<StepResult>;

function stub(step: string, title: string): StepResult {
  return {
    step,
    title,
    status: 'not_implemented',
    message: 'stub — fill in after first engine migration',
  };
}

// CLAUDE.md ENGINE LAUNCH CHECKLIST (1) — test.hive.baby slot with 10-item testing checklist.
const checkTestSlot: StepFn = async () => stub('test_slot', 'test.hive.baby engine_slots entry');

// CLAUDE.md (2) — SEO layout.tsx with correct title and description.
const checkSeoLayout: StepFn = async () => stub('seo_layout', 'SEO layout.tsx title + description');

// CLAUDE.md (3) — TooltipTour implemented.
const checkTooltipTour: StepFn = async () => stub('tooltip_tour', 'TooltipTour implemented');

// CLAUDE.md (4) — Added to UDNav or planet surface as appropriate.
const checkPlanetOrUdnav: StepFn = async () => stub('planet_or_udnav', 'planet hex-cell or UDNav entry present');

// CLAUDE.md (5) — ANTHROPIC_API_KEY and all required env vars confirmed in Vercel.
const checkEnvVarsInVercel: StepFn = async () => stub('env_vars_confirmed', 'required env vars present in Vercel project');

// CLAUDE.md (6) — Pass /api/health check.
const checkHealthEndpoint: StepFn = async () => stub('health_check', 'GET /api/health returns 200 from production');

// CLAUDE.md (7) — Added to health-check workflow URL list.
const checkHealthWorkflowListed: StepFn = async () => stub('health_workflow_listed', 'engine URL present in .github/workflows health-check list');

// CLAUDE.md (8) — Engine count updated everywhere it appears.
const checkEngineCountUpdated: StepFn = async () => stub('engine_count_updated', 'engine count updated in CLAUDE.md table, planet, README');

// Adjacent operational concerns (not part of CLAUDE.md's eight, but
// HiveFinalize is the right place to gate them).
const checkDns: StepFn = async () => stub('dns', 'Cloudflare CNAME → cname.vercel-dns.com resolves');
const checkSslCert: StepFn = async () => stub('ssl', 'Vercel SSL cert provisioned and valid');
const checkVercelDeploymentReady: StepFn = async () => stub('vercel_ready', 'latest production deployment status=Ready');
const checkBackupAndAudit: StepFn = async () => stub('audit_record', 'last_audit_at within window + audit log row');

const STEPS: ReadonlyArray<{ fn: StepFn }> = [
  { fn: checkTestSlot },
  { fn: checkSeoLayout },
  { fn: checkTooltipTour },
  { fn: checkPlanetOrUdnav },
  { fn: checkEnvVarsInVercel },
  { fn: checkHealthEndpoint },
  { fn: checkHealthWorkflowListed },
  { fn: checkEngineCountUpdated },
  { fn: checkDns },
  { fn: checkSslCert },
  { fn: checkVercelDeploymentReady },
  { fn: checkBackupAndAudit },
];

export async function runChecklist(ctx: ChecklistContext): Promise<StepResult[]> {
  const results: StepResult[] = [];
  for (const { fn } of STEPS) {
    results.push(await fn(ctx));
  }
  return results;
}
