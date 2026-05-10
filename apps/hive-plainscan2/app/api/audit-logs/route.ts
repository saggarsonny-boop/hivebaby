import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("view_audit_logs");
    const url = new URL(request.url);
    const logs = await prisma.auditLog.findMany({
      where: {
        organizationId: context.organizationId,
        eventType: url.searchParams.get("eventType") || undefined,
        patientId: url.searchParams.get("patientId") || undefined,
        imagingReportId: url.searchParams.get("reportId") || undefined
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(Number(url.searchParams.get("take") || 100), 500)
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "audit_logs_viewed",
      resourceType: "audit_log"
    });
    return { logs };
  });
}
