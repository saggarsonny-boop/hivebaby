import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { encryptPHI, hashPHIReference } from "@/lib/server/crypto";
import { prisma } from "@/lib/server/prisma";
import { reportCreateSchema } from "@/lib/server/schemas";
import { detectSafetyFlags } from "@/lib/server/safety";
import { classifyPhiPresence } from "@/lib/server/phi";
import { handleRoute } from "@/lib/server/route";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("create_reports");
    const input = reportCreateSchema.parse(await request.json());
    const patient =
      input.patientId
        ? await prisma.patient.findFirstOrThrow({ where: { id: input.patientId, organizationId: context.organizationId, deletedAt: null } })
        : await prisma.patient.create({
            data: {
              organizationId: context.organizationId,
              firstName: input.patient?.firstName,
              lastName: input.patient?.lastName,
              dateOfBirth: input.patient?.dateOfBirth ? new Date(input.patient.dateOfBirth) : undefined,
              mrn: input.patient?.mrn
            }
          });

    const safety = detectSafetyFlags(input.reportText);
    const report = await prisma.imagingReport.create({
      data: {
        organizationId: context.organizationId,
        patientId: patient.id,
        createdByUserId: context.user.id,
        examType: input.examType,
        bodyRegion: input.bodyRegion,
        modality: input.modality,
        examDate: input.examDate ? new Date(input.examDate) : undefined,
        orderingClinician: input.orderingClinician,
        reportTextEncrypted: encryptPHI(input.reportText),
        reportTextHash: hashPHIReference(input.reportText),
        sourceType: input.sourceType,
        status: "draft",
        safetyFlagLevel: safety.flagLevel
      }
    });

    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "report_created",
      resourceType: "imaging_report",
      resourceId: report.id,
      patientId: patient.id,
      imagingReportId: report.id,
      metadata: { sourceType: input.sourceType, safetyFlagLevel: safety.flagLevel, phiIndicators: classifyPhiPresence(input.reportText) }
    });

    return NextResponse.json({ id: report.id, status: report.status, safetyFlagLevel: report.safetyFlagLevel });
  });
}

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("view_reports");
    const reports = await prisma.imagingReport.findMany({
      where: { organizationId: context.organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        patientId: true,
        examType: true,
        bodyRegion: true,
        modality: true,
        examDate: true,
        status: true,
        safetyFlagLevel: true,
        createdAt: true
      }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "reports_list_viewed",
      resourceType: "imaging_report"
    });
    return { reports };
  });
}
