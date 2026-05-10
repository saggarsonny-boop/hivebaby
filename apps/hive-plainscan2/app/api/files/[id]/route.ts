import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { deleteSecureObject } from "@/lib/server/storage";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("delete_reports");
    const file = await prisma.uploadedFile.findFirstOrThrow({ where: { id: params.id, organizationId: context.organizationId, deletedAt: null } });
    await deleteSecureObject(file.storageKey);
    await prisma.uploadedFile.update({ where: { id: file.id }, data: { status: "deleted", deletedAt: new Date() } });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "file_deleted",
      resourceType: "uploaded_file",
      resourceId: file.id,
      patientId: file.patientId || undefined,
      imagingReportId: file.imagingReportId || undefined
    });
    return { id: file.id, deleted: true };
  });
}
