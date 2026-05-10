import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { patientInputSchema } from "@/lib/server/schemas";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("create_reports");
    const input = patientInputSchema.parse(await request.json());
    const patient = await prisma.patient.create({
      data: {
        organizationId: context.organizationId,
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
      eventType: "patient_created",
      resourceType: "patient",
      resourceId: patient.id,
      patientId: patient.id
    });
    return { id: patient.id };
  });
}

export async function GET() {
  return handleRoute(async () => {
    const context = await requirePermission("view_reports");
    const patients = await prisma.patient.findMany({
      where: { organizationId: context.organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, firstName: true, lastName: true, mrn: true, createdAt: true }
    });
    return { patients };
  });
}
