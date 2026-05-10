import { z } from "zod";

export const explainSchema = z.object({
  summary: z.string().describe("A high-level analytical summary of the input data."),
  findings: z.array(z.object({
    title: z.string().describe("Finding Title"),
    description: z.string().describe("Detailed description of the finding"),
    severity: z.enum(["low", "medium", "high"]).describe("Impact or intensity level")
  })).describe("Core extracted data points."),
  questionsForDoctor: z.array(z.string()).describe("Actionable steps, questions, or remediation tactics."),
  redFlags: z.array(z.string()).describe("Critical risks, warnings, or negative elements detected."),
  disclaimer: z.string().describe("Standard disclaimer that this is AI-generated and not professional advice.")
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