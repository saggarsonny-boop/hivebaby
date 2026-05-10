import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { patientInputSchema } from "@/lib/server/schemas";
import { findPatientForOrg } from "@/lib/server/tenant";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("view_reports");
    const patient = await findPatientForOrg(params.id, context.organizationId);
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "patient_viewed",
      resourceType: "patient",
      resourceId: patient.id,
      patientId: patient.id
    });
    return { patient };
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("edit_reports");
    await findPatientForOrg(params.id, context.organizationId);
    const input = patientInputSchema.partial().parse(await request.json());
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        mrn: input.mrn
      }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "patient_updated",
      resourceType: "patient",
      resourceId: patient.id,
      patientId: patient.id
    });
    return { id: patient.id };
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("delete_reports");
    await findPatientForOrg(params.id, context.organizationId);
    const patient = await prisma.patient.update({ where: { id: params.id }, data: { deletedAt: new Date() } });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "patient_deleted",
      resourceType: "patient",
      resourceId: patient.id,
      patientId: patient.id
    });
    return { id: patient.id, deleted: true };
  });
}
