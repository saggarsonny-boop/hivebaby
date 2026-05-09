// Vendored from saggarsonny-boop/queen-bee@main:packages/queen-bee-client/src/types.ts
// Snapshot 2026-05-09. See ./README.md for sync pattern.

export const SCHEMA_TYPES = [
  "time-response",
  "clarity-response",
  "scenario-response",
  "coaching-response",
  "health-log-response",
  "governance-response",
  "moon-response",
  "lookup-response",
  "builder-response",
  "conversion-response",
  "reader-response",
  "creator-response",
  "validator-response",
  "secret-response",
  "radiology-report-explanation",
  "vitality-session-log",
  "generic",
] as const;

export type SchemaType = (typeof SCHEMA_TYPES)[number];

export type Tier = "free" | "plus" | "pro" | "operator";

export interface GovernRequestContext {
  tier?: Tier;
  locale?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface GovernRequest {
  engineId: string;
  input: string;
  content: Record<string, unknown>;
  context?: GovernRequestContext;
}

export interface GovernanceStamp {
  engine: string;
  schema: SchemaType | string;
  version: string;
  timestamp: string;
  language: string;
  safe: boolean;
  governed: boolean;
  flags: string[];
}

export interface GovernResponse {
  approved: boolean;
  stampedContent?: Record<string, unknown>;
  governanceStamp?: GovernanceStamp;
  failureReason?: string;
  failureCode?: string;
  schemaErrors?: string[];
}

export interface GovernOptions {
  baseUrl?: string;
  engineToken?: string;
  timeoutMs?: number;
  noRetry?: boolean;
  fetchImpl?: typeof fetch;
  onTransportFailure?: (err: Error, context: { engineId: string; attempt: number }) => void;
}
