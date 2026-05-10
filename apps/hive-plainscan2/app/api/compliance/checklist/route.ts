import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { compliancePatchSchema } from "@/lib/server/schemas";

export async function GET() {
  return handleRoute(async () => {
    const context = await requirePermission("manage_org_settings");
    const checklist = await prisma.complianceChecklist.upsert({
      where: { organizationId: context.organizationId },
      update: {},
      create: { organizationId: context.organizationId }
    });
    return { label: "Compliance readiness", certification: false, checklist };
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("manage_org_settings");
    const input = compliancePatchSchema.parse(await request.json());
    const checklist = await prisma.complianceChecklist.upsert({
      where: { organizationId: context.organizationId },
      update: { ...input, lastReviewedByUserId: context.user.id, lastReviewedAt: new Date() },
      create: { organizationId: context.organizationId, ...input, lastReviewedByUserId: context.user.id, lastReviewedAt: new Date() }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "compliance_checklist_updated",
      resourceType: "compliance_checklist",
      resourceId: checklist.id
    });
    return { label: "Compliance readiness", certification: false, checklist };
  });
}
