import { NextResponse } from "next/server";
import { checkStripeAccess } from "@/lib/stripe-access";
import { buildDiagramSvg } from "@/lib/diagram";
import { fallbackExplanation } from "@/lib/fallback";
import { removePhi } from "@/lib/privacy";
import type { DiagramSource, ExplainRequest, Explanation } from "@/lib/types";
import { generateIllustration } from "@/lib/illustration";

export const runtime = "nodejs";

type UsageBucket = { date: string; total: number };

const anthropicModel = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";
const dailyUsage = new Map<string, UsageBucket>();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function estimateCost(reportText: string) {
  const inputTokens = Math.ceil(reportText.length / 4);
  const outputTokens = 2200;
  return inputTokens * 0.0000008 + outputTokens * 0.000004;
}

function checkCostCap(organizationId: string, estimatedCost: number) {
  const cap = Number(process.env.DAILY_AI_COST_CAP || "5");
  const date = todayKey();
  const current = dailyUsage.get(organizationId);
  const bucket = current?.date === date ? current : { date, total: 0 };
  if (bucket.total + estimatedCost > cap) {
    return { allowed: false, cap, projected: bucket.total + estimatedCost };
  }
  dailyUsage.set(organizationId, { date, total: bucket.total + estimatedCost });
  return { allowed: true, cap, projected: bucket.total + estimatedCost };
}

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return "{}";
  return text.slice(start, end + 1);
}

function repairExplanation(value: Partial<Explanation>, request: ExplainRequest): Explanation {
  const fallback = fallbackExplanation(request.reportText, request.examType, request.bodyRegion);
  const keyFindings = Array.isArray(value.key_findings) && value.key_findings.length > 0 ? value.key_findings : fallback.key_findings;
  const redFlagObjects = Array.isArray(value.red_flag_terms_detected) ? value.red_flag_terms_detected : [];
  return {
    exam_type: value.exam_type || fallback.exam_type,
    body_region: value.body_region || fallback.body_region,
    patient_friendly_title: value.patient_friendly_title || `${value.exam_type || fallback.exam_type} ${value.body_region || fallback.body_region} summary`,
    plain_english_summary: value.plain_english_summary || fallback.plain_english_summary,
    key_findings: keyFindings.map((finding) => ({
      ...finding,
      body_location: finding.body_location || finding.anatomic_location || "Not specified",
      possible_symptoms: finding.possible_symptoms || finding.patient_relevance || "Discuss how this relates to symptoms with the clinician.",
      doctor_followup: finding.doctor_followup || finding.clinician_review_note || "Ask your clinician how this finding fits with your exam."
    })),
    red_flags: Array.isArray(value.red_flags)
      ? value.red_flags
      : redFlagObjects.map((flag) => flag.clinician_attention_message || flag.term),
    red_flag_terms_detected: redFlagObjects,
    questions_for_doctor:
      Array.isArray(value.questions_for_doctor) && value.questions_for_doctor.length > 0
        ? value.questions_for_doctor
        : Array.isArray(value.patient_questions) && value.patient_questions.length > 0
          ? value.patient_questions
          : fallback.questions_for_doctor,
    patient_questions: value.patient_questions,
    image_prompt: value.image_prompt || value.diagram_prompt || fallback.image_prompt,
    diagram_prompt: value.diagram_prompt || value.image_prompt || fallback.image_prompt,
    disclaimer:
      value.disclaimer ||
      value.patient_disclaimer ||
      "This summary is designed to help you understand the wording of a finalized imaging report. It is not a diagnosis or treatment plan. Please review your results with your clinician.",
    patient_disclaimer:
      value.patient_disclaimer ||
      "This summary is designed to help you understand the wording of your imaging report. It is not a diagnosis or treatment plan. Please review your results with your clinician.",
    requires_physician_approval: true
  };
}

async function callClaude(safeRequest: ExplainRequest) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": process.env.ANTHROPIC_API_KEY || ""
    },
    body: JSON.stringify({
      model: anthropicModel,
      max_tokens: 2600,
      temperature: 0.1,
      system:
        "You create clinician-reviewed patient education summaries from finalized imaging report text. Do not interpret images. Do not add diagnoses, treatment recommendations, or certainty not present in the report. Use calm 6th-8th grade language. Prefer 'the report describes' over 'you have'. Return only valid JSON.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate a patient education draft that requires physician approval before release.",
            selected_exam_type: safeRequest.examType,
            selected_body_region: safeRequest.bodyRegion,
            safety_rules: [
              "Explain only what the finalized report states.",
              "Preserve uncertainty such as may represent, cannot exclude, or indeterminate.",
              "Flag urgent or sensitive findings for clinician attention.",
              "Do not produce patient-facing alarm language unless it is phrased as clinician-reviewed education."
            ],
            schema: {
              exam_type: "",
              body_region: "",
              patient_friendly_title: "",
              plain_english_summary: "",
              key_findings: [
                {
                  original_report_phrase: "",
                  medical_term: "",
                  plain_language_explanation: "",
                  anatomic_location: "",
                  severity_if_stated: "",
                  laterality_if_stated: "",
                  patient_relevance: "",
                  clinician_review_note: ""
                }
              ],
              red_flag_terms_detected: [
                {
                  term: "",
                  why_flagged: "",
                  clinician_attention_message: ""
                }
              ],
              questions_for_doctor: [],
              diagram_prompt: "",
              patient_disclaimer: "",
              requires_physician_approval: true
            },
            report: safeRequest.reportText
          })
        }
      ]
    })
  });

  if (!response.ok) throw new Error("AI generation failed.");
  const payload = await response.json();
  const content = payload.content?.find((item: { type: string; text?: string }) => item.type === "text")?.text || "{}";
  return JSON.parse(extractJson(content)) as Partial<Explanation>;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ExplainRequest & { organizationId?: string; fidelity?: "fast" | "high" };
  const cleanedReport = removePhi(body.reportText || "").slice(0, 15000);
  const normalizedBody = {
    ...body,
    examType: body.examType === "Auto-detect" ? "" : body.examType,
    bodyRegion: body.bodyRegion === "Auto-detect" ? "" : body.bodyRegion
  };
  const safeRequest = { ...normalizedBody, reportText: cleanedReport };

  if (!cleanedReport.trim()) {
    return NextResponse.json({ error: "Report text is required." }, { status: 400 });
  }

  // â”€â”€â”€ Stripe Paywall Check â”€â”€â”€
  const mockUserId = "user_" + (body.organizationId || "demo-clinic");
  const access = await checkStripeAccess(mockUserId, "hive-plainscan2");
  if (!access.hasAccess) {
    return NextResponse.json(
      { 
        error: "Free credits exhausted.", 
        code: "CREDITS_EXHAUSTED",
        checkoutUrl: "https://buy.stripe.com/test_upgrade" // Mock checkout URL
      }, 
      { status: 402 }
    );
  }

  const organizationId = body.organizationId || "demo-organization";
  const estimatedCost = estimateCost(cleanedReport);
  const costCheck = checkCostCap(organizationId, estimatedCost);
  if (!costCheck.allowed) {
    return NextResponse.json(
      { error: "AI generation limit reached for today. Please contact admin." },
      { status: 429 }
    );
  }

  let explanation: Explanation;
  let source: "ai" | "local-fallback" = "local-fallback";

  if (!process.env.ANTHROPIC_API_KEY) {
    explanation = fallbackExplanation(cleanedReport, normalizedBody.examType, normalizedBody.bodyRegion);
  } else {
    try {
      const draft = await callClaude(safeRequest);
      explanation = repairExplanation(draft, safeRequest);
      source = "ai";
    } catch {
      explanation = fallbackExplanation(cleanedReport, normalizedBody.examType, normalizedBody.bodyRegion);
    }
  }

  const fidelity = body.fidelity || "high";
  const illustration = await generateIllustration(explanation, fidelity);
  
  const diagramImage = illustration ? illustration.url : buildDiagramSvg(explanation);
  const diagramSource: DiagramSource = illustration ? "ai-image" : "svg-fallback";

  // â”€â”€â”€ Queen Bee Governance Integration â”€â”€â”€
  fetch('https://queenbee.hive.baby/api/govern', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      engineId: 'hive-plainscan2',
      input: 'text-report',
      content: {
        plainEnglishSummary: explanation.plain_english_summary,
        keyFindings: explanation.key_findings,
        redFlags: explanation.red_flags,
        suggestedDoctorQuestions: explanation.questions_for_doctor,
        illustrationSource: diagramSource,
        disclaimer: true,
        reportType: explanation.exam_type,
        bodyRegion: explanation.body_region,
      }
    })
  }).catch(err => console.warn('Queen Bee log failed:', err))

  return NextResponse.json({
    explanation,
    diagramSvg: diagramImage,
    diagramSource,
    source,
    aiUsage: {
      organizationId,
      estimatedCost,
      dailyCap: costCheck.cap,
      projectedDailySpend: costCheck.projected
    }
  });
}
