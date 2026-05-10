import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { createSignedDownloadUrl } from "@/lib/server/storage";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("download_pdfs");
    const file = await prisma.uploadedFile.findFirstOrThrow({ where: { id: params.id, organizationId: context.organizationId, deletedAt: null } });
    const signed = await createSignedDownloadUrl(file.storageKey);
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "file_downloaded",
      resourceType: "uploaded_file",
      resourceId: file.id,
      patientId: file.patientId || undefined,
      imagingReportId: file.imagingReportId || undefined
    });
    return signed;
  });
}
