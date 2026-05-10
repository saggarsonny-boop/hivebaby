import { z } from "zod";

export const explainSchema = z.object({
  summary: z.string().describe("Clinical administrative summary of the patient encounter."),
  findings: z.array(z.object({
    title: z.string().describe("Clinical Finding or ICD-10 Code"),
    description: z.string().describe("Detailed medical context"),
    severity: z.enum(["low", "medium", "high"]).describe("Clinical Acuity")
  })).describe("Extracted structured data points."),
  questionsForDoctor: z.array(z.string()).describe("Follow-up recommendations for the care team or specialist referrals."),
  redFlags: z.array(z.string()).describe("Critical patient alerts requiring immediate intervention."),
  disclaimer: z.string().describe("Disclaimer stating this is an AI administrative assist tool, not final diagnostic authority.")
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