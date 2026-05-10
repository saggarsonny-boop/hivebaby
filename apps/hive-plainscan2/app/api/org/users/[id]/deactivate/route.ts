import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("manage_users");
    const user = await prisma.userProfile.update({
      where: { id: params.id, organizationId: context.organizationId },
      data: { isActive: false }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "user_deactivated",
      resourceType: "user",
      resourceId: user.id
    });
    return { id: user.id, isActive: false };
  });
}
