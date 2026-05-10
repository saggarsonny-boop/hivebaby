import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { explanationPatchSchema } from "@/lib/server/schemas";
import { findExplanationForOrg } from "@/lib/server/tenant";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("view_reports");
    const explanation = await findExplanationForOrg(params.id, context.organizationId);
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "explanation_viewed",
      resourceType: "generated_explanation",
      resourceId: explanation.id,
      patientId: explanation.imagingReport.patientId,
      imagingReportId: explanation.imagingReportId
    });
    return { explanation };
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("edit_generated_explanations");
    const input = explanationPatchSchema.parse(await request.json());
    const existing = await findExplanationForOrg(params.id, context.organizationId);
    if (existing.isLocked && existing.status === "approved") {
      throw new ApiError(409, "Approved summaries are locked. Reopen before editing.", "approved_summary_locked");
    }
    const explanation = await prisma.generatedExplanation.update({
      where: { id: existing.id },
      data: {
        patientFriendlyTitle: input.patientFriendlyTitle,
        plainEnglishSummary: input.plainEnglishSummary,
        questionsForDoctorJson: input.questionsForDoctor,
        redFlagsJson: input.redFlags,
        diagramPrompt: input.diagramPrompt,
        patientDisclaimer: input.patientDisclaimer,
        status: existing.status === "approved" ? "ready_for_review" : existing.status,
        isLocked: false,
        approvedAt: existing.status === "approved" ? null : existing.approvedAt
      }
    });
    if (input.keyFindings) {
      await prisma.keyFinding.deleteMany({ where: { generatedExplanationId: existing.id, organizationId: context.organizationId } });
      await prisma.keyFinding.createMany({
        data: input.keyFindings.map((finding) => ({ organizationId: context.organizationId, generatedExplanationId: existing.id, ...finding }))
      });
    }
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "explanation_updated",
      resourceType: "generated_explanation",
      resourceId: existing.id,
      patientId: existing.imagingReport.patientId,
      imagingReportId: existing.imagingReportId
    });
    return { id: explanation.id, status: explanation.status, isLocked: explanation.isLocked };
  });
}
