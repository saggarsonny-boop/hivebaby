// G03 — engine is registered in queen-bee/lib/registry.ts.
//
// QB only governs engines it knows about. The canonical query is
// `GET https://queenbee.hive.baby/api/registry` which returns the array
// of EngineConfig entries. We hit that endpoint with a short timeout
// and look for the engine's slug.
//
// Network-dependent: this is an exception to the H-rule "no network"
// principle. On transport failure (timeout, DNS, 5xx) we skip with an
// explanatory message rather than fail — a transient QB outage shouldn't
// block engine PRs.
//
// Skipping rationale:
//   - PASS: slug found in /api/registry response.
//   - FAIL: HTTP 200 but slug NOT in the registered set → engine is genuinely missing.
//   - SKIP: network failure / timeout / 5xx → can't determine, defer to next run.
//
// Override: the QB_REGISTRY_URL env var lets tests + the queen-bee
// repo's own self-audit point at a local instance without DNS.

import type { RuleDefinition, RuleContext } from "../../types.js";

const DEFAULT_REGISTRY_URL = "https://queenbee.hive.baby/api/registry";
const REQUEST_TIMEOUT_MS = 8_000;

interface RegistryEntry {
  id: string;
  name?: string;
  domain?: string | null;
  status?: string;
}

interface RegistryResponse {
  engines?: RegistryEntry[];
}

async function fetchRegistry(url: string, timeoutMs: number): Promise<RegistryResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json", "user-agent": "hive-ops/G03" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as RegistryResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const G03_registryEntry: RuleDefinition = {
  id: "G03",
  title: "engine slug present in queen-bee/lib/registry.ts (via /api/registry)",
  category: "GOVERNANCE",
  severity: "MANDATORY",
  async check(ctx: RuleContext) {
    const url = process.env.QB_REGISTRY_URL ?? DEFAULT_REGISTRY_URL;
    const registry = await fetchRegistry(url, REQUEST_TIMEOUT_MS);

    if (registry === null) {
      return {
        status: "skip",
        message: `could not reach Queen Bee registry at ${url} (network failure, timeout, or 5xx). Re-run when QB is reachable; engine PRs do NOT block on this.`,
      };
    }

    const engines = Array.isArray(registry.engines) ? registry.engines : [];
    const found = engines.find((e) => e?.id === ctx.engineSlug);

    if (!found) {
      return {
        status: "fail",
        message: `engine slug "${ctx.engineSlug}" not found in ${url} (registry has ${engines.length} entries). Add an entry to queen-bee/lib/registry.ts. See packages/queen-bee-client/WIRING.md §1.`,
      };
    }

    const status = typeof found.status === "string" ? found.status : "?";
    return {
      status: "pass",
      message: `engine "${ctx.engineSlug}" registered with status="${status}", schema="${(found as { schema?: string }).schema ?? "?"}".`,
    };
  },
};
