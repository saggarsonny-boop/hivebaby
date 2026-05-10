import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { approvalSchema } from "@/lib/server/schemas";
import { findExplanationForOrg } from "@/lib/server/tenant";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("approve_explanations");
    const input = approvalSchema.parse(await request.json());
    const explanation = await findExplanationForOrg(params.id, context.organizationId);
    const hasFlags = Boolean((explanation.redFlagsJson as { safety?: { flagLevel?: string } })?.safety?.flagLevel !== "none");
    if (hasFlags && !input.flaggedFindingsAttestation) {
      throw new ApiError(400, "Flagged findings attestation is required.", "flagged_attestation_required");
    }
    const approvedAt = new Date();
    const approval = await prisma.physicianApproval.upsert({
      where: { generatedExplanationId: explanation.id },
      update: {
        approvedByUserId: context.user.id,
        approvalStatus: "approved",
        approvalAttestation: input.approvalAttestation,
        approvedAt,
        rejectedAt: null,
        rejectionReason: null
      },
      create: {
        organizationId: context.organizationId,
        generatedExplanationId: explanation.id,
        imagingReportId: explanation.imagingReportId,
        approvedByUserId: context.user.id,
        approvalStatus: "approved",
        approvalAttestation: input.approvalAttestation,
        approvedAt
      }
    });
    await prisma.generatedExplanation.update({ where: { id: explanation.id }, data: { status: "approved", isLocked: true, approvedAt } });
    await prisma.imagingReport.update({ where: { id: explanation.imagingReportId }, data: { status: "approved" } });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "physician_approved",
      resourceType: "generated_explanation",
      resourceId: explanation.id,
      patientId: explanation.imagingReport.patientId,
      imagingReportId: explanation.imagingReportId
    });
    return { status: "approved", approvedAt, approvedBy: approval.approvedByUserId };
  });
}
