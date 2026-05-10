import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { ApiError } from "@/lib/server/errors";
import { renderApprovedSummaryPdf } from "@/lib/server/pdf";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { findExplanationForOrg } from "@/lib/server/tenant";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("download_pdfs");
    const explanation = await findExplanationForOrg(params.id, context.organizationId);
    if (explanation.status !== "approved" || !explanation.approvedAt) {
      throw new ApiError(409, "PDF generation requires physician approval.", "approval_required");
    }
    const object = await renderApprovedSummaryPdf({
      organizationId: context.organizationId,
      title: explanation.patientFriendlyTitle,
      summary: explanation.plainEnglishSummary,
      reviewerLine: `Reviewed and approved on ${explanation.approvedAt.toISOString()}.`
    });
    const file = await prisma.uploadedFile.create({
      data: {
        organizationId: context.organizationId,
        patientId: explanation.imagingReport.patientId,
        imagingReportId: explanation.imagingReportId,
        uploadedByUserId: context.user.id,
        fileName: "patient-education-summary.pdf",
        fileType: "application/pdf",
        fileSize: 0,
        storageKey: object.storageKey,
        sha256Hash: object.sha256Hash,
        status: "accepted"
      }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "pdf_generated",
      resourceType: "uploaded_file",
      resourceId: file.id,
      patientId: explanation.imagingReport.patientId,
      imagingReportId: explanation.imagingReportId
    });
    return { pdfId: file.id, storageKey: file.storageKey };
  });
}
