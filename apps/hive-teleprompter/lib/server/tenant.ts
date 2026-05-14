import { prisma } from "./prisma";
import { assertFound } from "./errors";
import { createAuditLog, type AuditEventInput } from "./audit";

export async function findPatientForOrg(patientId: string, organizationId: string) {
  return assertFound(
    await prisma.patient.findFirst({ where: { id: patientId, organizationId, deletedAt: null } }),
    "Patient not found."
  );
}

export async function findReportForOrg(reportId: string, organizationId: string) {
  return assertFound(
    await prisma.imagingReport.findFirst({
      where: { id: reportId, organizationId, deletedAt: null },
      include: { patient: true, explanations: { orderBy: { version: "desc" }, take: 1, include: { keyFindings: true, diagram: true, approval: true } } }
    }),
    "Report not found."
  );
}

export async function findExplanationForOrg(explanationId: string, organizationId: string) {
  return assertFound(
    await prisma.generatedExplanation.findFirst({
      where: { id: explanationId, organizationId },
      include: { keyFindings: true, diagram: true, approval: true, imagingReport: { include: { patient: true } } }
    }),
    "Explanation not found."
  );
}

export function createAuditLogForOrg(eventData: AuditEventInput) {
  return createAuditLog(eventData);
}
