"use client";

// Universal Document — Sealed (UDS) builder for HivePlainScan reports.
//
// Per the paywall Phase 1 spec the UDS export is now the canonical
// download (PDF is secondary). This file produces a sealed UDS payload
// with the report content, AI explanation, illustration reference,
// generation timestamp, engine identity, content hash, and a placeholder
// governance stamp slot for the future Queen Bee `/api/govern`
// integration.
//
// Format compatibility: matches the UD Converter UDS shape used by the
// `universal-document` repo's reader (`apps/reader/`). Block types are
// the canonical set; we extend with an `image` block for the medical
// illustration when the explanation pipeline produces one.
//
// Content hash is a SHA-256 of the canonical block payload (id + type +
// text per block, JSON-stringified with stable key order). The hash is
// included in `seal` so a downstream UD verifier can detect tampering.

import type { ExplainResult } from "@/types/plainscan";

type UDSBlockType = "heading" | "paragraph" | "table" | "list" | "image";

interface UDSBlock {
  id: string;
  type: UDSBlockType;
  base_content:
    | { text: string }
    | { url: string; alt: string; source?: "openai" | "replicate" | "svg" | "ai" };
}

interface GovernanceStampPlaceholder {
  /** Marker indicating this engine has not yet wired Queen Bee.
   *  Replaced with the real GovernanceStamp object when /api/explain
   *  starts importing @queen-bee/client and calling govern(). */
  status: "pending";
  /** Engine slug used in queen-bee/lib/registry.ts (when registered). */
  engine_id: string;
  /** Schema name the engine WOULD pass to QB. Documented here so the
   *  reader can show "would be governed by …" copy. */
  intended_schema: "lookup-response";
  /** ISO-8601 timestamp recording when this UDS was minted. */
  generated_at: string;
}

export interface UDSDocument {
  ud_version: "1.0.0";
  state: "sealed";
  metadata: {
    title: string;
    created: string;
    engine: string;
    engine_id: string;
    engine_version: string;
  };
  manifest: {
    block_count: number;
    types_used: UDSBlockType[];
  };
  blocks: UDSBlock[];
  governance: GovernanceStampPlaceholder;
  seal: {
    sealed_at: string;
    sealed_by: string;
    content_hash: string;
    hash_algorithm: "sha-256";
  };
}

const ENGINE_VERSION = "0.3.0";

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function canonicalBlockPayload(blocks: UDSBlock[]): string {
  // Stable serialization: sort each block's keys alphabetically and
  // serialize the array in document order. Keeps the hash stable
  // across JSON.stringify property-order quirks.
  const stable = blocks.map((b) => ({
    base_content: b.base_content,
    id: b.id,
    type: b.type,
  }));
  return JSON.stringify(stable);
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Browser without SubtleCrypto (extremely rare; old WebView). The
  // export still works — we just emit a sentinel so a verifier can see
  // the gap and the user gets a download.
  return "unavailable";
}

export async function buildUDS(result: ExplainResult): Promise<UDSDocument> {
  const blocks: UDSBlock[] = [];
  let counter = 1;
  const next = () => `block-${pad(counter++)}`;
  const now = new Date().toISOString();

  blocks.push({
    id: next(),
    type: "heading",
    base_content: { text: "HivePlainScan Report Explanation" },
  });

  blocks.push({
    id: next(),
    type: "paragraph",
    base_content: { text: result.summary },
  });

  blocks.push({
    id: next(),
    type: "heading",
    base_content: { text: "Findings" },
  });

  result.findings.forEach((f) => {
    blocks.push({
      id: next(),
      type: "paragraph",
      base_content: {
        text: `${f.finding} — ${f.plainLanguage}${f.severity && f.severity !== "not specified" ? ` (severity: ${f.severity})` : ""}`,
      },
    });
  });

  // Medical illustration — included as an image block when the
  // /api/explain pipeline produced one. Carries the source so the UD
  // reader can show "OpenAI gpt-image-1" provenance.
  if (result.illustrationUrl) {
    blocks.push({
      id: next(),
      type: "heading",
      base_content: { text: "Illustration" },
    });
    blocks.push({
      id: next(),
      type: "image",
      base_content: {
        url: result.illustrationUrl,
        alt: "Medical illustration generated to accompany the report explanation.",
        source: result.illustrationSource ?? "svg",
      },
    });
  }

  blocks.push({
    id: next(),
    type: "heading",
    base_content: { text: "Questions for Your Doctor" },
  });

  blocks.push({
    id: next(),
    type: "list",
    base_content: { text: result.questionsForDoctor.join("\n") },
  });

  if (result.redFlags.length > 0) {
    blocks.push({
      id: next(),
      type: "heading",
      base_content: { text: "Findings That May Need Prompt Attention" },
    });
    blocks.push({
      id: next(),
      type: "list",
      base_content: { text: result.redFlags.join("\n") },
    });
  }

  blocks.push({
    id: next(),
    type: "paragraph",
    base_content: { text: result.disclaimer },
  });

  const typesSet = new Set<UDSBlockType>();
  blocks.forEach((b) => typesSet.add(b.type));

  const hash = await sha256Hex(canonicalBlockPayload(blocks));

  return {
    ud_version: "1.0.0",
    state: "sealed",
    metadata: {
      title: "HivePlainScan Report Explanation",
      created: now,
      engine: "HivePlainScan",
      engine_id: "hive-clock",
      engine_version: ENGINE_VERSION,
    },
    manifest: {
      block_count: blocks.length,
      types_used: Array.from(typesSet),
    },
    blocks,
    governance: {
      status: "pending",
      engine_id: "hive-clock",
      intended_schema: "lookup-response",
      generated_at: now,
    },
    seal: {
      sealed_at: now,
      sealed_by: "HivePlainScan",
      content_hash: hash,
      hash_algorithm: "sha-256",
    },
  };
}

export async function downloadUDS(result: ExplainResult): Promise<void> {
  const doc = await buildUDS(result);
  const json = JSON.stringify(doc, null, 2);
  const blob = new Blob([json], { type: "application/uds+json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plainscan-report.uds";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
