import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("audit_export");
    const logs = await prisma.auditLog.findMany({ where: { organizationId: context.organizationId }, orderBy: { createdAt: "desc" }, take: 1000 });
    const csv = ["createdAt,eventType,resourceType,resourceId,actorUserId"]
      .concat(logs.map((log) => [log.createdAt.toISOString(), log.eventType, log.resourceType, log.resourceId || "", log.actorUserId || ""].join(",")))
      .join("\n");
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "audit_logs_exported",
      resourceType: "audit_log"
    });
    return new NextResponse(csv, { headers: { "content-type": "text/csv", "content-disposition": "attachment; filename=audit-logs.csv" } });
  });
}
