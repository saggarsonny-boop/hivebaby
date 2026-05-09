// G04 — engine ENGINE_GRAMMAR.md declares which QB schemas it uses.
//
// The frontmatter field `queen_bee_schemas` is a YAML list of schema names
// the engine produces — must match the canonical 15 names in
// queen-bee/lib/schemas.ts. The field is what makes engine governance
// auditable from a single grep across all engine grammars without
// running QB itself.
//
// Pure filesystem check: parse the frontmatter, look for the field,
// validate the entries against the canonical schema-name set.
//
// Why this is a separate rule from G01/G02: an engine can have the
// package installed AND call govern() AND still drift on which schema
// it claims to validate against. G04 is the source-of-truth ratchet that
// makes the next run of G02 confirm "yes this engine still consumes
// schema-X" rather than "engine has any govern() call somewhere".

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RuleDefinition, RuleContext } from "../../types.js";

const CANONICAL_SCHEMAS = [
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
  "generic",
] as const;

const CANONICAL_SET = new Set<string>(CANONICAL_SCHEMAS);

function extractFrontmatterField(text: string, field: string): string | null {
  const fm = text.match(/^---\s*\n([\s\S]*?)\n---/m);
  if (!fm) return null;
  const lines = fm[1].split("\n");
  const fieldRe = new RegExp(`^\\s*${field}\\s*:\\s*(.*)$`);
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(fieldRe);
    if (!m) {
      i++;
      continue;
    }
    // Same-line value? Return it as-is — covers inline lists ([a, b])
    // and scalar values.
    if (m[1].trim().length > 0) return m[1].trim();
    // Otherwise consume indented continuation lines until a non-indented
    // line (next top-level field) or end-of-frontmatter.
    const continuation: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (/^[ \t]/.test(lines[j])) {
        continuation.push(lines[j]);
      } else if (lines[j].trim() === "") {
        // Blank line inside a block — keep accumulating.
        continuation.push(lines[j]);
      } else {
        break;
      }
    }
    return continuation.join("\n").trim();
  }
  return null;
}

function parseList(raw: string): string[] {
  // Inline form: [a, b, c] or "[a, b]"
  const inline = raw.match(/^\[([\s\S]*?)\]\s*$/);
  if (inline) {
    return inline[1]
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s.length > 0);
  }
  // Block form: lines starting with "- "
  return raw
    .split("\n")
    .map((line) => line.match(/^\s*-\s*(.*)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => m[1].trim().replace(/^["']|["']$/g, ""))
    .filter((s) => s.length > 0);
}

export const G04_grammarSchemas: RuleDefinition = {
  id: "G04",
  title: "ENGINE_GRAMMAR.md declares queen_bee_schemas with valid entries",
  category: "GOVERNANCE",
  severity: "MANDATORY",
  async check(ctx: RuleContext) {
    const path = join(ctx.engineRoot, "ENGINE_GRAMMAR.md");
    if (!existsSync(path)) {
      return {
        status: "fail",
        message: `ENGINE_GRAMMAR.md missing at ${path}. The frontmatter field queen_bee_schemas declares which QB schemas this engine produces.`,
      };
    }

    let text: string;
    try { text = readFileSync(path, "utf8"); } catch (err) {
      return {
        status: "fail",
        message: `cannot read ${path}: ${(err as Error).message}`,
      };
    }

    const raw = extractFrontmatterField(text, "queen_bee_schemas");
    if (raw === null) {
      return {
        status: "fail",
        message: `frontmatter is missing the queen_bee_schemas field. Add a YAML list of schema names the engine produces (e.g. queen_bee_schemas: [time-response]). Canonical names are in queen-bee/lib/schemas.ts.`,
      };
    }

    const schemas = parseList(raw);
    if (schemas.length === 0) {
      return {
        status: "fail",
        message: `queen_bee_schemas is declared but empty. Engines must declare at least one schema name; "generic" is acceptable for engines whose output has no required fields.`,
      };
    }

    const invalid = schemas.filter((s) => !CANONICAL_SET.has(s));
    if (invalid.length > 0) {
      return {
        status: "fail",
        message: `queen_bee_schemas contains unknown schema name(s): ${invalid.join(", ")}. Canonical set: ${CANONICAL_SCHEMAS.join(", ")}.`,
      };
    }

    return {
      status: "pass",
      message: `declares queen_bee_schemas: [${schemas.join(", ")}] (all canonical).`,
    };
  },
};
