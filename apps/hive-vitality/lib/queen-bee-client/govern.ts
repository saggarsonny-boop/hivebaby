// Vendored from saggarsonny-boop/queen-bee@main:packages/queen-bee-client/src/govern.ts
// Snapshot 2026-05-09. See ./README.md for sync pattern.

import { QueenBeeUnavailableError } from "./errors.js";
import type {
  GovernanceStamp,
  GovernOptions,
  GovernRequest,
  GovernResponse,
} from "./types.js";

const DEFAULT_BASE_URL = "https://queenbee.hive.baby";
const DEFAULT_TIMEOUT_MS = 30_000;
const PATH = "/api/govern";

interface QBEnvelope {
  engine: string;
  schema: string;
  version: string;
  timestamp: string;
  language: string;
  safe: boolean;
  governed: boolean;
  content: Record<string, unknown>;
  flags: string[];
}

interface QBResult {
  passed: boolean;
  envelope: QBEnvelope | null;
  errors: string[];
}

interface QBErrorBody {
  error?: string;
}

function resolveBaseUrl(opts: GovernOptions): string {
  if (opts.baseUrl) return opts.baseUrl;
  if (typeof process !== "undefined" && process.env?.QUEEN_BEE_URL) {
    return process.env.QUEEN_BEE_URL;
  }
  return DEFAULT_BASE_URL;
}

function resolveToken(opts: GovernOptions): string | undefined {
  if (opts.engineToken !== undefined) return opts.engineToken;
  if (typeof process !== "undefined" && process.env?.QB_ENGINE_TOKEN) {
    return process.env.QB_ENGINE_TOKEN;
  }
  return undefined;
}

function envelopeToStamp(env: QBEnvelope): GovernanceStamp {
  return {
    engine: env.engine,
    schema: env.schema,
    version: env.version,
    timestamp: env.timestamp,
    language: env.language,
    safe: env.safe,
    governed: env.governed,
    flags: env.flags,
  };
}

function classifyFailure(errors: string[]): {
  failureCode: string;
  failureReason: string;
  schemaErrors: string[];
} {
  const safetyError = errors.find((e) => e.startsWith("BLOCKED:"));
  const disclaimerError = errors.find((e) => e.startsWith("missing_disclaimer:"));
  const schemaErrors = errors.filter((e) => e.startsWith("missing_field:"));
  const primary = safetyError ?? disclaimerError ?? schemaErrors[0] ?? errors[0] ?? "unknown";
  let failureReason: string;
  if (safetyError) {
    failureReason = `Queen Bee blocked the response on a safety rule (${safetyError}).`;
  } else if (disclaimerError) {
    failureReason = `Queen Bee requires a safety disclaimer for this engine's tier (${disclaimerError}).`;
  } else if (schemaErrors.length > 0) {
    const fields = schemaErrors.map((e) => e.split(":")[1]).join(", ");
    failureReason = `Queen Bee rejected the response: missing required schema field(s): ${fields}.`;
  } else {
    failureReason = `Queen Bee rejected the response: ${primary}.`;
  }
  return { failureCode: primary, failureReason, schemaErrors };
}

async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function attempt(
  fetchImpl: typeof fetch,
  url: string,
  body: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<Response> {
  return fetchWithTimeout(fetchImpl, url, { method: "POST", headers, body }, timeoutMs);
}

export async function govern(
  req: GovernRequest,
  opts: GovernOptions = {},
): Promise<GovernResponse> {
  const baseUrl = resolveBaseUrl(opts).replace(/\/+$/, "");
  const url = `${baseUrl}${PATH}`;
  const token = resolveToken(opts);
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;

  if (typeof fetchImpl !== "function") {
    throw new QueenBeeUnavailableError(
      "No fetch implementation available. Pass `fetchImpl` in opts on Node < 18.",
      0,
    );
  }

  const body = JSON.stringify({
    engineId: req.engineId,
    input: req.input,
    content: req.content,
    context: req.context,
  });

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "accept": "application/json",
    "user-agent": "@queen-bee/client/0.1.0",
  };
  if (token) headers["authorization"] = `Bearer ${token}`;

  const maxAttempts = opts.noRetry ? 1 : 2;
  let lastErr: unknown;

  for (let i = 1; i <= maxAttempts; i++) {
    let res: Response;
    try {
      res = await attempt(fetchImpl, url, body, headers, timeoutMs);
    } catch (err) {
      lastErr = err;
      opts.onTransportFailure?.(err as Error, { engineId: req.engineId, attempt: i });
      if (i === maxAttempts) {
        throw new QueenBeeUnavailableError(
          `Queen Bee transport error after ${i} attempt(s): ${(err as Error).message}`,
          i,
          err,
        );
      }
      continue;
    }

    if (res.status >= 500) {
      lastErr = new Error(`HTTP ${res.status}`);
      opts.onTransportFailure?.(lastErr as Error, { engineId: req.engineId, attempt: i });
      if (i === maxAttempts) {
        throw new QueenBeeUnavailableError(
          `Queen Bee returned ${res.status} after ${i} attempt(s).`,
          i,
          lastErr,
        );
      }
      continue;
    }

    if (res.status === 200 || res.status === 422) {
      const result = (await res.json()) as QBResult;
      if (result.passed && result.envelope) {
        return {
          approved: true,
          stampedContent: result.envelope.content,
          governanceStamp: envelopeToStamp(result.envelope),
        };
      }
      const { failureCode, failureReason, schemaErrors } = classifyFailure(result.errors ?? []);
      return {
        approved: false,
        failureCode,
        failureReason,
        schemaErrors: schemaErrors.length > 0 ? schemaErrors : undefined,
        governanceStamp: result.envelope ? envelopeToStamp(result.envelope) : undefined,
      };
    }

    let errBody: QBErrorBody = {};
    try {
      errBody = (await res.json()) as QBErrorBody;
    } catch {
      // ignore
    }
    return {
      approved: false,
      failureCode: errBody.error ?? `http_${res.status}`,
      failureReason: `Queen Bee rejected the request: ${errBody.error ?? `HTTP ${res.status}`}.`,
    };
  }

  throw new QueenBeeUnavailableError(
    `Queen Bee call exhausted ${maxAttempts} attempts without a verdict.`,
    maxAttempts,
    lastErr,
  );
}
