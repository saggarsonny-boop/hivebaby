import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { rejectionSchema } from "@/lib/server/schemas";
import { findExplanationForOrg } from "@/lib/server/tenant";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("reject_explanations");
    const input = rejectionSchema.parse(await request.json());
    const explanation = await findExplanationForOrg(params.id, context.organizationId);
    const rejectedAt = new Date();
    await prisma.physicianApproval.upsert({
      where: { generatedExplanationId: explanation.id },
      update: { approvalStatus: "rejected", rejectedAt, rejectionReason: input.rejectionReason },
      create: {
        organizationId: context.organizationId,
        generatedExplanationId: explanation.id,
        imagingReportId: explanation.imagingReportId,
        approvedByUserId: context.user.id,
        approvalStatus: "rejected",
        approvalAttestation: "Rejected by clinician reviewer.",
        rejectedAt,
        rejectionReason: input.rejectionReason
      }
    });
    await prisma.generatedExplanation.update({ where: { id: explanation.id }, data: { status: "needs_revision", isLocked: false } });
    await prisma.imagingReport.update({ where: { id: explanation.imagingReportId }, data: { status: "needs_revision" } });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "physician_rejected",
      resourceType: "generated_explanation",
      resourceId: explanation.id,
      patientId: explanation.imagingReport.patientId,
      imagingReportId: explanation.imagingReportId
    });
    return { status: "needs_revision" };
  });
}
