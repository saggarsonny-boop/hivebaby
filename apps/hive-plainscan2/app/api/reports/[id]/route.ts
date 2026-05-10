import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { decryptPHI } from "@/lib/server/crypto";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { reportPatchSchema } from "@/lib/server/schemas";
import { findReportForOrg } from "@/lib/server/tenant";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("view_reports");
    const report = await findReportForOrg(params.id, context.organizationId);
    const canViewRaw = ["admin", "physician", "clinician_reviewer"].includes(context.user.role);
    if (context.user.role === "viewer" && report.status !== "approved" && report.status !== "sent_to_patient") {
      throw new ApiError(403, "Approved summaries only.", "approved_only");
    }
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "report_viewed",
      resourceType: "imaging_report",
      resourceId: report.id,
      patientId: report.patientId,
      imagingReportId: report.id
    });
    return {
      report: {
        id: report.id,
        patientId: report.patientId,
        examType: report.examType,
        bodyRegion: report.bodyRegion,
        modality: report.modality,
        examDate: report.examDate,
        status: report.status,
        safetyFlagLevel: report.safetyFlagLevel,
        reportText: canViewRaw ? decryptPHI(report.reportTextEncrypted) : undefined,
        latestExplanation: report.explanations[0]
      }
    };
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("edit_reports");
    const input = reportPatchSchema.parse(await request.json());
    await findReportForOrg(params.id, context.organizationId);
    const report = await prisma.imagingReport.update({
      where: { id: params.id },
      data: {
        examType: input.examType,
        bodyRegion: input.bodyRegion,
        modality: input.modality,
        examDate: input.examDate ? new Date(input.examDate) : undefined,
        orderingClinician: input.orderingClinician,
        status: input.status
      }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "report_updated",
      resourceType: "imaging_report",
      resourceId: report.id,
      patientId: report.patientId,
      imagingReportId: report.id
    });
    return { id: report.id, status: report.status };
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("delete_reports");
    const existing = await findReportForOrg(params.id, context.organizationId);
    const report = await prisma.imagingReport.update({
      where: { id: existing.id },
      data: { status: "deleted", deletedAt: new Date() }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "report_deleted",
      resourceType: "imaging_report",
      resourceId: report.id,
      patientId: report.patientId,
      imagingReportId: report.id
    });
    return { id: report.id, status: report.status };
  });
}
