import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { putSecureObject, validatePdfUpload } from "@/lib/server/storage";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("upload_files");
    const form = await request.formData();
    const file = form.get("file");
    const patientId = form.get("patientId");
    const imagingReportId = form.get("imagingReportId");
    if (!(file instanceof File) || !validatePdfUpload(file)) {
      throw new ApiError(400, "Only PDF uploads under 10 MB are supported.", "invalid_upload");
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const object = await putSecureObject({ organizationId: context.organizationId, bytes, fileName: file.name });
    const uploaded = await prisma.uploadedFile.create({
      data: {
        organizationId: context.organizationId,
        patientId: typeof patientId === "string" ? patientId : undefined,
        imagingReportId: typeof imagingReportId === "string" ? imagingReportId : undefined,
        uploadedByUserId: context.user.id,
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileSize: file.size,
        storageKey: object.storageKey,
        sha256Hash: object.sha256Hash,
        status: "pending_scan"
      }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "file_uploaded",
      resourceType: "uploaded_file",
      resourceId: uploaded.id,
      patientId: uploaded.patientId || undefined,
      imagingReportId: uploaded.imagingReportId || undefined,
      metadata: { fileType: uploaded.fileType, fileSize: uploaded.fileSize }
    });
    return { id: uploaded.id, status: uploaded.status };
  });
}
