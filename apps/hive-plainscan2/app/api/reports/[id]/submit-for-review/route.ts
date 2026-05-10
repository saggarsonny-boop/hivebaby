import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { findReportForOrg } from "@/lib/server/tenant";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("submit_for_review");
    const existing = await findReportForOrg(params.id, context.organizationId);
    const report = await prisma.imagingReport.update({ where: { id: existing.id }, data: { status: "ready_for_review" } });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "report_submitted_for_review",
      resourceType: "imaging_report",
      resourceId: report.id,
      patientId: report.patientId,
      imagingReportId: report.id
    });
    return { id: report.id, status: report.status };
  });
}
