import { z } from "zod";

export const explainSchema = z.object({
  summary: z.string().describe("A high-level compliance summary and gap analysis overview."),
  findings: z.array(z.object({
    title: z.string().describe("Control Name or Gap"),
    description: z.string().describe("Description of the missing or satisfied control"),
    severity: z.enum(["low", "medium", "high"]).describe("Severity of the gap")
  })).describe("Breakdown of compliance controls."),
  questionsForDoctor: z.array(z.string()).describe("Required Remediation Steps for the engineering team."),
  redFlags: z.array(z.string()).describe("Critical security vulnerabilities or instant audit-failure risks."),
  disclaimer: z.string().describe("A disclaimer stating this does not replace a formal external audit.")
});
export type ExplainResult = z.infer<typeof explainSchema>;
export type ExplainPayload = ExplainResult | { error: string };
export type ExplainRequestBody = { reportText?: string; images?: string[]; sessionId?: string };

export function parseModelResponse(text: string): ExplainResult {
  const jsonMatch = text.match(/\{.*\}/s);
  if (!jsonMatch) throw new Error("No JSON found in response");
  return explainSchema.parse(JSON.parse(jsonMatch[0]));
}
export class ParseError extends Error {
  constructor(message: string) { super(message); this.name = "ParseError"; }
}