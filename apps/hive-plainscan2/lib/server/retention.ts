import { prisma } from "./prisma";
import { createAuditLog } from "./audit";
import { deleteSecureObject } from "./storage";

export async function runRetentionPolicy(organizationId: string, actorUserId?: string) {
  const policy = await prisma.retentionPolicy.findUnique({ where: { organizationId } });
  const retainReportsDays = policy?.retainReportsDays ?? 90;
  const retainUploadedFilesDays = policy?.retainUploadedFilesDays ?? 90;
  const archiveBefore = new Date(Date.now() - retainReportsDays * 24 * 60 * 60 * 1000);
  const fileDeleteBefore = new Date(Date.now() - retainUploadedFilesDays * 24 * 60 * 60 * 1000);

  const archived = await prisma.imagingReport.updateMany({
    where: { organizationId, deletedAt: null, createdAt: { lt: archiveBefore }, status: { notIn: ["deleted", "archived"] } },
    data: { status: "archived" }
  });

  const files = await prisma.uploadedFile.findMany({
    where: { organizationId, deletedAt: null, createdAt: { lt: fileDeleteBefore } }
  });
  for (const file of files) await deleteSecureObject(file.storageKey);
  await prisma.uploadedFile.updateMany({
    where: { organizationId, deletedAt: null, createdAt: { lt: fileDeleteBefore } },
    data: { status: "deleted", deletedAt: new Date() }
  });

  await createAuditLog({
    organizationId,
    actorUserId,
    eventType: "retention_policy_executed",
    resourceType: "organization",
    resourceId: organizationId,
    metadata: { archivedReports: archived.count, deletedFiles: files.length }
  });

  return { archivedReports: archived.count, deletedFiles: files.length };
}
