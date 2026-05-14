import { prisma } from "./prisma";
import { ApiError } from "./errors";
import { stripIdentifiersForAi } from "./phi";
import { generatedExplanationSchema } from "./schemas";

const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";

export function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function estimateClaudeCostCents(inputTokens: number, outputTokens: number) {
  return Math.ceil(inputTokens * 0.00008 + outputTokens * 0.0004);
}

export async function assertAiCostCap(organizationId: string, projectedCostCents: number) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) throw new ApiError(403, "Organization required.", "organization_required");

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const usage = await prisma.aIUsageLog.aggregate({
    where: { organizationId, createdAt: { gte: start } },
    _sum: { estimatedCostCents: true }
  });
  const current = usage._sum.estimatedCostCents || 0;
  if (current + projectedCostCents > org.dailyAiCostCapCents) {
    throw new ApiError(429, "Daily AI generation limit reached. Contact your administrator.", "daily_ai_cap_reached");
  }
}

function parseJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text);
}

export async function generateExplanationWithClaude(reportText: string, context: { examType: string; bodyRegion: string; modality: string }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new ApiError(503, "AI provider is not configured.", "ai_not_configured");
  const deidentifiedReport = stripIdentifiersForAi(reportText);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": process.env.ANTHROPIC_API_KEY
    },
    body: JSON.stringify({
      model,
      max_tokens: 2600,
      temperature: 0.1,
      system:
        "You create clinician-reviewed patient education summaries from finalized imaging report text. Explain only the finalized report. Do not create new diagnoses. Do not recommend treatment. Do not interpret raw imaging. Preserve uncertainty. Use 'the report describes'. Use calm 6th-8th grade language. Require physician approval. Return structured JSON only.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            schema: {
              patientFriendlyTitle: "",
              plainEnglishSummary: "",
              keyFindings: [
                {
                  originalReportPhrase: "",
                  medicalTerm: "",
                  plainLanguageExplanation: "",
                  anatomicLocation: "",
                  severityIfStated: "",
                  lateralityIfStated: "",
                  patientRelevance: "",
                  clinicianReviewNote: ""
                }
              ],
              redFlags: [{ term: "", whyFlagged: "", clinicianAttentionMessage: "" }],
              questionsForDoctor: [],
              diagramPrompt: "",
              patientDisclaimer: ""
            },
            context,
            report: deidentifiedReport
          })
        }
      ]
    })
  });

  if (!response.ok) throw new ApiError(502, "AI generation failed.", "ai_generation_failed");
  const payload = await response.json();
  const text = payload.content?.find((item: { type: string; text?: string }) => item.type === "text")?.text || "{}";
  return generatedExplanationSchema.parse(parseJson(text));
}

export { model as anthropicModel };
