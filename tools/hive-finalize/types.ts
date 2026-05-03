// Shared types for HiveFinalize. The shapes mirror the canonical
// manifest schema in docs/specs/manifest-schema-final.md. Every
// field is optional at the type level — the validator is what
// decides whether a missing field is a hard fail.

export type EngineStatus = 'live' | 'building' | 'planned' | 'deprecated';
export type Tier = 1 | 2 | 3;
export type Safety = 'enabled' | 'standard' | 'disabled';
export type Multilingual = 'pending' | 'enabled' | 'n/a';
export type OnboardingStepState = 'implemented' | 'pending' | 'n/a';
export type Visibility = 'public' | 'internal' | 'private';
export type CommercialSurface =
  | 'none'
  | 'donations'
  | 'freemium'
  | 'paid'
  | 'founding';
export type ViralLoopTarget =
  | 'referral'
  | 'share_card'
  | 'embed'
  | 'pr_pickup'
  | 'community_post';
export type ProductionState =
  | 'not_listed'
  | 'listed'
  | 'featured'
  | 'archived';
export type DeploymentProtection = 'on' | 'off';

export interface OnboardingStack {
  auto_demo?: OnboardingStepState;
  first_visit_card?: OnboardingStepState;
  tooltip_tour?: OnboardingStepState;
  rotating_placeholders?: OnboardingStepState;
}

export interface LaunchChecklistState {
  test_slot?: boolean;
  seo_layout?: boolean;
  tooltip_tour?: boolean;
  planet_or_udnav?: boolean;
  env_vars_confirmed?: boolean;
  health_check?: boolean;
  health_workflow_listed?: boolean;
  engine_count_updated?: boolean;
}

export interface ApiModel {
  role?: string;
  model_id?: string;
}

export interface Manifest {
  // Identity
  engine?: string;
  id?: string;
  name_display?: string;
  domain?: string;
  domain_aliases?: string[];
  repo?: string;
  owner?: string;

  // Classification
  version?: string;
  status?: EngineStatus;
  tier?: Tier;
  schema?: string;
  stack?: string[];
  premium?: boolean;

  // Governance
  governance?: string;
  safety?: Safety;
  safety_level?: string;
  tone?: string;
  multilingual?: Multilingual;

  // Operational
  api_models?: ApiModel[];
  env_vars_required?: string[];
  health_check?: string;
  onboarding_stack?: OnboardingStack;

  // Build provenance
  vercel_project?: string;
  vercel_team?: string;
  vercel_root_directory?: string;
  deployment_protection?: DeploymentProtection;
  auto_deploy_branch?: string;

  // HiveFinalize / HiveProductionList
  visibility?: Visibility;
  commercial_surface?: CommercialSurface;
  viral_loop_targets?: ViralLoopTarget[];
  launch_checklist_state?: LaunchChecklistState;
  production_state?: ProductionState;
  last_audit_at?: string;
}

export type RuleStatus = 'pass' | 'fail' | 'skip';

export interface RuleResult {
  rule: string;            // e.g. "V1"
  title: string;           // short description
  status: RuleStatus;
  message: string;
}

export interface StepResult {
  step: string;            // e.g. "dns"
  title: string;
  status: 'pass' | 'fail' | 'skip' | 'not_implemented';
  message: string;
}

export interface FinalizeReport {
  engine: string | null;
  manifestPath: string;
  hasFrontmatter: boolean;
  rules: RuleResult[];
  steps: StepResult[];
  verdict: 'pass' | 'fail' | 'skipped';
}
