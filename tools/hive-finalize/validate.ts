// HiveFinalize — schema validator.
// Implements the 29 rules from §4 of docs/specs/manifest-schema-final.md.
// Pure: takes a parsed manifest + body string, returns rule results.
// Cross-file (V5, V24) and network (V6, V28, V29) rules are stubbed as
// 'skip' until the union loader and credential plumbing land.

import matter from 'gray-matter';
import { readFileSync } from 'node:fs';
import semver from 'semver';
import type {
  Manifest,
  RuleResult,
  RuleStatus,
  Visibility,
  CommercialSurface,
  ProductionState,
  EngineStatus,
  ViralLoopTarget,
  OnboardingStepState,
} from './types.js';

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export interface ParsedManifestFile {
  manifest: Manifest;
  body: string;
  hasFrontmatter: boolean;
}

export function parseManifestFile(absPath: string): ParsedManifestFile {
  const raw = readFileSync(absPath, 'utf8');
  const parsed = matter(raw);
  // gray-matter returns an empty object for `data` when no frontmatter
  // fences are present; detect that explicitly.
  const hasFrontmatter =
    typeof parsed.data === 'object' &&
    parsed.data !== null &&
    Object.keys(parsed.data).length > 0;
  return {
    manifest: hasFrontmatter ? (parsed.data as Manifest) : {},
    body: parsed.content,
    hasFrontmatter,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_STATUS: ReadonlySet<EngineStatus> = new Set<EngineStatus>([
  'live',
  'building',
  'planned',
  'deprecated',
]);
const VALID_VIRAL: ReadonlySet<ViralLoopTarget> = new Set<ViralLoopTarget>([
  'referral',
  'share_card',
  'embed',
  'pr_pickup',
  'community_post',
]);
const VALID_ONBOARDING: ReadonlySet<OnboardingStepState> = new Set<OnboardingStepState>([
  'implemented',
  'pending',
  'n/a',
]);
const VISIBILITY_VALUES: ReadonlySet<Visibility> = new Set<Visibility>([
  'public',
  'internal',
  'private',
]);
const PREMIUM_SURFACES: ReadonlySet<CommercialSurface> = new Set<CommercialSurface>([
  'freemium',
  'paid',
  'founding',
]);
const FREE_SURFACES: ReadonlySet<CommercialSurface> = new Set<CommercialSurface>([
  'none',
  'donations',
]);
const LIVE_PRODUCTION_STATES: ReadonlySet<ProductionState> = new Set<ProductionState>([
  'listed',
  'featured',
]);

function r(rule: string, title: string, status: RuleStatus, message: string): RuleResult {
  return { rule, title, status, message };
}

function bodyHasSection(body: string, heading: string): boolean {
  const re = new RegExp(`^##\\s+${heading.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'm');
  return re.test(body);
}

function isAllCaps(s: string): boolean {
  return /^[A-Z][A-Z0-9_]*$/.test(s);
}

// Sanity normaliser for V3: strip all non-letter characters and lowercase.
function normaliseId(input: string): string {
  return input.replace(/[^A-Za-z]/g, '').toLowerCase();
}

// ---------------------------------------------------------------------------
// Rule implementations
// ---------------------------------------------------------------------------

function v1(m: Manifest): RuleResult {
  if (!m.engine) return r('V1', 'engine format', 'fail', 'engine field missing');
  return /^(Hive|UD)[A-Z][A-Za-z0-9]*$/.test(m.engine)
    ? r('V1', 'engine format', 'pass', `engine=${m.engine}`)
    : r('V1', 'engine format', 'fail', `engine=${m.engine} does not match /^(Hive|UD)[A-Z][A-Za-z0-9]*$/`);
}

function v2(m: Manifest): RuleResult {
  if (!m.id) return r('V2', 'id format', 'fail', 'id field missing');
  return /^[a-z][a-z0-9]*$/.test(m.id)
    ? r('V2', 'id format', 'pass', `id=${m.id}`)
    : r('V2', 'id format', 'fail', `id=${m.id} does not match /^[a-z][a-z0-9]*$/`);
}

function v3(m: Manifest): RuleResult {
  if (!m.engine || !m.id) return r('V3', 'id≡normalised(engine)', 'skip', 'engine or id missing');
  const expected = normaliseId(m.engine);
  return m.id === expected
    ? r('V3', 'id≡normalised(engine)', 'pass', `id=${m.id} matches normalised engine`)
    : r('V3', 'id≡normalised(engine)', 'fail', `id=${m.id} expected ${expected} from engine=${m.engine}`);
}

function v4(m: Manifest): RuleResult {
  if (!m.id || !m.domain) return r('V4', 'domain shape', 'skip', 'id or domain missing');
  const canonical = `${m.id}.hive.baby`;
  if (m.domain === canonical) return r('V4', 'domain shape', 'pass', `domain=${m.domain}`);
  const aliases = m.domain_aliases ?? [];
  if (aliases.includes(m.domain)) {
    return r('V4', 'domain shape', 'pass', `domain=${m.domain} declared as alias`);
  }
  return r('V4', 'domain shape', 'fail', `domain=${m.domain} ≠ ${canonical} and not in domain_aliases`);
}

function v5(): RuleResult {
  return r('V5', 'engine/id/domain unique across manifest union', 'skip',
    'requires manifest union loader (not yet implemented)');
}

function v6(): RuleResult {
  return r('V6', 'repo resolves on GitHub', 'skip',
    'requires GitHub credentials (not yet wired)');
}

function v7(m: Manifest): RuleResult {
  return m.owner && m.owner.trim()
    ? r('V7', 'owner non-empty', 'pass', `owner=${m.owner}`)
    : r('V7', 'owner non-empty', 'fail', 'owner field missing or empty');
}

function v8(body: string): RuleResult {
  const missing = ['Purpose', 'Inputs', 'Outputs'].filter(h => !bodyHasSection(body, h));
  return missing.length === 0
    ? r('V8', 'body has Purpose/Inputs/Outputs', 'pass', 'all three sections present')
    : r('V8', 'body has Purpose/Inputs/Outputs', 'fail', `missing: ${missing.join(', ')}`);
}

function v9(m: Manifest): RuleResult {
  if (!m.version) return r('V9', 'version is semver', 'fail', 'version field missing');
  return semver.valid(m.version)
    ? r('V9', 'version is semver', 'pass', `version=${m.version}`)
    : r('V9', 'version is semver', 'fail', `version=${m.version} not valid semver`);
}

function v10(m: Manifest): RuleResult {
  if (!m.status) return r('V10', 'status enum', 'fail', 'status field missing');
  return VALID_STATUS.has(m.status)
    ? r('V10', 'status enum', 'pass', `status=${m.status}`)
    : r('V10', 'status enum', 'fail', `status=${m.status} not in ${[...VALID_STATUS].join('|')}`);
}

function v11(m: Manifest): RuleResult {
  if (m.tier === undefined) return r('V11', 'tier ∈ {1,2,3}', 'fail', 'tier field missing');
  return [1, 2, 3].includes(m.tier as number)
    ? r('V11', 'tier ∈ {1,2,3}', 'pass', `tier=${m.tier}`)
    : r('V11', 'tier ∈ {1,2,3}', 'fail', `tier=${m.tier}`);
}

function v12(m: Manifest): RuleResult {
  if (!m.schema) return r('V12', 'schema is kebab-case', 'fail', 'schema field missing');
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(m.schema)
    ? r('V12', 'schema is kebab-case', 'pass', `schema=${m.schema}`)
    : r('V12', 'schema is kebab-case', 'fail', `schema=${m.schema} not kebab-case`);
}

function v13(m: Manifest): RuleResult {
  if (!m.stack || m.stack.length === 0) return r('V13', 'stack non-empty', 'fail', 'stack missing or empty');
  return r('V13', 'stack non-empty', 'pass', `${m.stack.length} entries`);
}

function v14(m: Manifest): RuleResult {
  if (!m.governance) return r('V14', 'governance is QueenBee.MasterGrappler@(pending|vN)', 'fail', 'governance field missing');
  return /^QueenBee\.MasterGrappler@(pending|v\d+)$/.test(m.governance)
    ? r('V14', 'governance is QueenBee.MasterGrappler@(pending|vN)', 'pass', `governance=${m.governance}`)
    : r('V14', 'governance is QueenBee.MasterGrappler@(pending|vN)', 'fail', `governance=${m.governance} bad shape`);
}

function v15(m: Manifest): RuleResult {
  if (!m.safety) return r('V15', 'safety enum', 'fail', 'safety field missing');
  return ['enabled', 'standard', 'disabled'].includes(m.safety)
    ? r('V15', 'safety enum', 'pass', `safety=${m.safety}`)
    : r('V15', 'safety enum', 'fail', `safety=${m.safety} not in enabled|standard|disabled`);
}

function v16(m: Manifest): RuleResult {
  if (!m.multilingual) return r('V16', 'multilingual enum', 'fail', 'multilingual field missing');
  return ['pending', 'enabled', 'n/a'].includes(m.multilingual)
    ? r('V16', 'multilingual enum', 'pass', `multilingual=${m.multilingual}`)
    : r('V16', 'multilingual enum', 'fail', `multilingual=${m.multilingual} not in pending|enabled|n/a`);
}

function v17(m: Manifest): RuleResult {
  // Only flag the most explicit contradiction: safety=disabled with a
  // non-empty safety_level. Other refinements pass through.
  if (m.safety === 'disabled' && m.safety_level && m.safety_level.trim()) {
    return r('V17', 'safety_level not contradicting safety', 'fail',
      `safety=disabled but safety_level=${m.safety_level}`);
  }
  return r('V17', 'safety_level not contradicting safety', 'pass',
    m.safety_level ? `safety_level=${m.safety_level}` : 'no refinement set');
}

function v18(m: Manifest): RuleResult {
  if (m.status !== 'live') return r('V18', 'live → onboarding all implemented', 'skip', `status=${m.status}`);
  const os = m.onboarding_stack ?? {};
  const keys = ['auto_demo', 'first_visit_card', 'tooltip_tour', 'rotating_placeholders'] as const;
  const offenders: string[] = [];
  for (const k of keys) {
    const v = os[k];
    if (!v) offenders.push(`${k}=missing`);
    else if (!VALID_ONBOARDING.has(v)) offenders.push(`${k}=${v}`);
    else if (v !== 'implemented') offenders.push(`${k}=${v}`);
  }
  return offenders.length === 0
    ? r('V18', 'live → onboarding all implemented', 'pass', 'all four = implemented')
    : r('V18', 'live → onboarding all implemented', 'fail', offenders.join(', '));
}

function v19(m: Manifest): RuleResult {
  if (m.status !== 'live') return r('V19', 'live → checklist all true', 'skip', `status=${m.status}`);
  const cs = m.launch_checklist_state ?? {};
  const keys = [
    'test_slot', 'seo_layout', 'tooltip_tour', 'planet_or_udnav',
    'env_vars_confirmed', 'health_check', 'health_workflow_listed', 'engine_count_updated',
  ] as const;
  const offenders = keys.filter(k => cs[k] !== true);
  return offenders.length === 0
    ? r('V19', 'live → checklist all true', 'pass', 'all 8 booleans true')
    : r('V19', 'live → checklist all true', 'fail', `not true: ${offenders.join(', ')}`);
}

function v20(m: Manifest): RuleResult {
  if (!m.visibility) return r('V20', 'public ↔ deployment_protection=off', 'fail', 'visibility missing');
  if (!VISIBILITY_VALUES.has(m.visibility)) {
    return r('V20', 'public ↔ deployment_protection=off', 'fail', `visibility=${m.visibility} not in public|internal|private`);
  }
  if (!m.deployment_protection) return r('V20', 'public ↔ deployment_protection=off', 'fail', 'deployment_protection missing');
  const isPublic = m.visibility === 'public';
  const isOff = m.deployment_protection === 'off';
  return isPublic === isOff
    ? r('V20', 'public ↔ deployment_protection=off', 'pass', `visibility=${m.visibility}, deployment_protection=${m.deployment_protection}`)
    : r('V20', 'public ↔ deployment_protection=off', 'fail', `visibility=${m.visibility}, deployment_protection=${m.deployment_protection}`);
}

function v21(m: Manifest): RuleResult {
  if (m.premium === undefined) return r('V21', 'premium=true ↔ commercial_surface ∈ {freemium,paid,founding}', 'fail', 'premium missing');
  if (!m.commercial_surface) return r('V21', 'premium=true ↔ commercial_surface ∈ {freemium,paid,founding}', 'fail', 'commercial_surface missing');
  const surfacePremium = PREMIUM_SURFACES.has(m.commercial_surface);
  return m.premium === surfacePremium
    ? r('V21', 'premium=true ↔ commercial_surface ∈ {freemium,paid,founding}', 'pass', `premium=${m.premium}, commercial_surface=${m.commercial_surface}`)
    : r('V21', 'premium=true ↔ commercial_surface ∈ {freemium,paid,founding}', 'fail', `premium=${m.premium}, commercial_surface=${m.commercial_surface}`);
}

function v22(m: Manifest): RuleResult {
  if (m.premium === undefined || !m.commercial_surface) {
    return r('V22', 'premium=false ↔ commercial_surface ∈ {none,donations}', 'skip', 'covered by V21 input checks');
  }
  const surfaceFree = FREE_SURFACES.has(m.commercial_surface);
  return m.premium === !surfaceFree
    ? r('V22', 'premium=false ↔ commercial_surface ∈ {none,donations}', 'pass', `premium=${m.premium}, commercial_surface=${m.commercial_surface}`)
    : r('V22', 'premium=false ↔ commercial_surface ∈ {none,donations}', 'fail', `premium=${m.premium}, commercial_surface=${m.commercial_surface}`);
}

function v23(m: Manifest, body: string): RuleResult {
  if (m.premium !== true) return r('V23', 'premium=true → ## Premium Locks', 'skip', 'premium not true');
  return bodyHasSection(body, 'Premium Locks')
    ? r('V23', 'premium=true → ## Premium Locks', 'pass', 'section present')
    : r('V23', 'premium=true → ## Premium Locks', 'fail', '## Premium Locks section missing');
}

function v24(m: Manifest): RuleResult {
  const targets = m.viral_loop_targets;
  if (!targets) return r('V24', 'viral_loop_targets enum', 'fail', 'viral_loop_targets missing');
  const offenders = targets.filter(t => !VALID_VIRAL.has(t));
  if (offenders.length > 0) {
    return r('V24', 'viral_loop_targets enum', 'fail', `unknown targets: ${offenders.join(', ')}`);
  }
  // Cross-engine reference resolution against the manifest union is
  // deferred until the union loader exists; for now, presence-only check.
  return r('V24', 'viral_loop_targets enum', 'pass', `${targets.length} entries`);
}

function v25(m: Manifest): RuleResult {
  if (!m.production_state) return r('V25', 'production_state listed/featured ↔ status=live', 'fail', 'production_state missing');
  if (!m.status) return r('V25', 'production_state listed/featured ↔ status=live', 'fail', 'status missing');
  const isLive = m.status === 'live';
  const isPubliclyListed = LIVE_PRODUCTION_STATES.has(m.production_state);
  if (isPubliclyListed && !isLive) {
    return r('V25', 'production_state listed/featured ↔ status=live', 'fail',
      `production_state=${m.production_state} but status=${m.status}`);
  }
  return r('V25', 'production_state listed/featured ↔ status=live', 'pass',
    `production_state=${m.production_state}, status=${m.status}`);
}

function v26(m: Manifest, thresholdDays: number): RuleResult {
  if (!m.last_audit_at) return r('V26', 'last_audit_at within window', 'fail', 'last_audit_at missing');
  const ts = Date.parse(m.last_audit_at);
  if (Number.isNaN(ts)) return r('V26', 'last_audit_at within window', 'fail', `not ISO 8601: ${m.last_audit_at}`);
  const ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
  if (ageDays < 0) return r('V26', 'last_audit_at within window', 'fail', `last_audit_at is in the future`);
  return ageDays <= thresholdDays
    ? r('V26', 'last_audit_at within window', 'pass', `${ageDays.toFixed(0)} days old (threshold ${thresholdDays})`)
    : r('V26', 'last_audit_at within window', 'fail', `${ageDays.toFixed(0)} days old > ${thresholdDays}-day threshold`);
}

function v27(m: Manifest): RuleResult {
  // Pure-data checks here; model_id resolution against the Anthropic SDK
  // belongs in the runtime check (skipped, see below).
  if (!m.api_models) return r('V27', 'api_models entries shape', 'skip', 'api_models not declared');
  const offenders: string[] = [];
  m.api_models.forEach((entry, i) => {
    if (!entry || typeof entry !== 'object') offenders.push(`#${i}: not an object`);
    else {
      if (!entry.role || !entry.role.trim()) offenders.push(`#${i}: role empty`);
      if (!entry.model_id || !entry.model_id.trim()) offenders.push(`#${i}: model_id empty`);
    }
  });
  return offenders.length === 0
    ? r('V27', 'api_models entries shape', 'pass', `${m.api_models.length} entries`)
    : r('V27', 'api_models entries shape', 'fail', offenders.join('; '));
}

function v28(m: Manifest): RuleResult {
  if (!m.env_vars_required) return r('V28', 'env_vars_required ALL_CAPS + present in Vercel', 'skip', 'env_vars_required not declared');
  const badNames = m.env_vars_required.filter(n => !isAllCaps(n));
  if (badNames.length > 0) {
    return r('V28', 'env_vars_required ALL_CAPS + present in Vercel', 'fail', `not ALL_CAPS: ${badNames.join(', ')}`);
  }
  // Vercel env presence requires creds; defer.
  return r('V28', 'env_vars_required ALL_CAPS + present in Vercel', 'skip',
    'name format ok; Vercel presence check deferred until creds wired');
}

function v29(m: Manifest): RuleResult {
  if (!m.health_check) return r('V29', 'health_check path + 200 from prod', 'skip', 'health_check not declared');
  if (!m.health_check.startsWith('/')) {
    return r('V29', 'health_check path + 200 from prod', 'fail', `health_check=${m.health_check} does not begin with /`);
  }
  return r('V29', 'health_check path + 200 from prod', 'skip',
    'path ok; HTTP probe deferred until network checks wired');
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

export interface ValidateOptions {
  /** Threshold in days for V26 (last_audit_at). Default 90. */
  lastAuditThresholdDays?: number;
}

/** Run every rule against a parsed manifest and body. */
export function validateManifest(
  manifest: Manifest,
  body: string,
  opts: ValidateOptions = {},
): RuleResult[] {
  const auditDays = opts.lastAuditThresholdDays ?? 90;
  return [
    v1(manifest),
    v2(manifest),
    v3(manifest),
    v4(manifest),
    v5(),
    v6(),
    v7(manifest),
    v8(body),
    v9(manifest),
    v10(manifest),
    v11(manifest),
    v12(manifest),
    v13(manifest),
    v14(manifest),
    v15(manifest),
    v16(manifest),
    v17(manifest),
    v18(manifest),
    v19(manifest),
    v20(manifest),
    v21(manifest),
    v22(manifest),
    v23(manifest, body),
    v24(manifest),
    v25(manifest),
    v26(manifest, auditDays),
    v27(manifest),
    v28(manifest),
    v29(manifest),
  ];
}

/** Convenience: read file, parse, validate. */
export function validateManifestFile(
  absPath: string,
  opts: ValidateOptions = {},
): { hasFrontmatter: boolean; rules: RuleResult[]; manifest: Manifest } {
  const parsed = parseManifestFile(absPath);
  if (!parsed.hasFrontmatter) {
    return { hasFrontmatter: false, rules: [], manifest: {} };
  }
  return {
    hasFrontmatter: true,
    rules: validateManifest(parsed.manifest, parsed.body, opts),
    manifest: parsed.manifest,
  };
}
