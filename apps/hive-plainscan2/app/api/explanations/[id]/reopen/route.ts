import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { findExplanationForOrg } from "@/lib/server/tenant";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("approve_explanations");
    const explanation = await findExplanationForOrg(params.id, context.organizationId);
    await prisma.generatedExplanation.update({ where: { id: explanation.id }, data: { status: "ready_for_review", isLocked: false, approvedAt: null } });
    await prisma.imagingReport.update({ where: { id: explanation.imagingReportId }, data: { status: "ready_for_review" } });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "explanation_reopened",
      resourceType: "generated_explanation",
      resourceId: explanation.id,
      patientId: explanation.imagingReport.patientId,
      imagingReportId: explanation.imagingReportId
    });
    return { status: "ready_for_review" };
  });
}
