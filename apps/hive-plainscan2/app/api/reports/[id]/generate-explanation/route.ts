import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { anthropicModel, assertAiCostCap, estimateClaudeCostCents, estimateTokens, generateExplanationWithClaude } from "@/lib/server/ai";
import { decryptPHI } from "@/lib/server/crypto";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { detectSafetyFlags } from "@/lib/server/safety";
import { findReportForOrg } from "@/lib/server/tenant";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("generate_explanations");
    const report = await findReportForOrg(params.id, context.organizationId);
    const reportText = decryptPHI(report.reportTextEncrypted);
    const inputTokens = estimateTokens(reportText);
    const outputTokens = 2600;
    const estimatedCostCents = estimateClaudeCostCents(inputTokens, outputTokens);
    await assertAiCostCap(context.organizationId, estimatedCostCents);

    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "ai_generation_requested",
      resourceType: "imaging_report",
      resourceId: report.id,
      patientId: report.patientId,
      imagingReportId: report.id
    });

    const safety = detectSafetyFlags(reportText);
    try {
      const generated = await generateExplanationWithClaude(reportText, {
        examType: report.examType,
        bodyRegion: report.bodyRegion,
        modality: report.modality
      });
      const version = (await prisma.generatedExplanation.count({ where: { imagingReportId: report.id, organizationId: context.organizationId } })) + 1;
      const explanation = await prisma.generatedExplanation.create({
        data: {
          organizationId: context.organizationId,
          imagingReportId: report.id,
          generatedByUserId: context.user.id,
          version,
          patientFriendlyTitle: generated.patientFriendlyTitle,
          plainEnglishSummary: generated.plainEnglishSummary,
          questionsForDoctorJson: generated.questionsForDoctor,
          redFlagsJson: { safety, modelFlags: generated.redFlags },
          diagramPrompt: generated.diagramPrompt,
          patientDisclaimer: generated.patientDisclaimer,
          status: "ready_for_review",
          keyFindings: {
            create: generated.keyFindings.map((finding) => ({
              organizationId: context.organizationId,
              ...finding
            }))
          },
          diagram: {
            create: {
              organizationId: context.organizationId,
              diagramType: report.bodyRegion.toLowerCase().includes("spine") ? "spine" : "general",
              diagramPromptDeidentified: generated.diagramPrompt,
              altText: "Educational illustration based on finalized report text. Not the actual imaging study."
            }
          }
        },
        include: { keyFindings: true, diagram: true }
      });
      await prisma.imagingReport.update({
        where: { id: report.id },
        data: { status: "ready_for_review", safetyFlagLevel: safety.flagLevel }
      });
      await prisma.aIUsageLog.create({
        data: {
          organizationId: context.organizationId,
          userId: context.user.id,
          imagingReportId: report.id,
          generatedExplanationId: explanation.id,
          provider: "anthropic",
          model: anthropicModel,
          requestType: "generate_explanation",
          inputTokenEstimate: inputTokens,
          outputTokenEstimate: outputTokens,
          estimatedCostCents,
          status: "success"
        }
      });
      await createAuditLog({
        ...requestAuditMeta(request),
        organizationId: context.organizationId,
        actorUserId: context.user.id,
        actorRole: context.user.role,
        eventType: "ai_generation_completed",
        resourceType: "generated_explanation",
        resourceId: explanation.id,
        patientId: report.patientId,
        imagingReportId: report.id,
        metadata: { safetyFlagLevel: safety.flagLevel, estimatedCostCents }
      });
      return { explanationId: explanation.id, status: explanation.status, reportStatus: "ready_for_review" };
    } catch (error) {
      await prisma.aIUsageLog.create({
        data: {
          organizationId: context.organizationId,
          userId: context.user.id,
          imagingReportId: report.id,
          provider: "anthropic",
          model: anthropicModel,
          requestType: "generate_explanation",
          inputTokenEstimate: inputTokens,
          outputTokenEstimate: outputTokens,
          estimatedCostCents,
          status: "failed",
          errorCode: "ai_generation_failed"
        }
      });
      await createAuditLog({
        ...requestAuditMeta(request),
        organizationId: context.organizationId,
        actorUserId: context.user.id,
        actorRole: context.user.role,
        eventType: "ai_generation_failed",
        resourceType: "imaging_report",
        resourceId: report.id,
        patientId: report.patientId,
        imagingReportId: report.id
      });
      throw error;
    }
  });
}
