import { z } from "zod";
import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { roleSchema } from "@/lib/server/schemas";

const patchSchema = z.object({ role: roleSchema.optional(), isActive: z.boolean().optional() });

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return handleRoute(async () => {
    const context = await requirePermission("manage_users");
    const input = patchSchema.parse(await request.json());
    const user = await prisma.userProfile.update({
      where: { id: params.id, organizationId: context.organizationId },
      data: input
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "user_updated",
      resourceType: "user",
      resourceId: user.id
    });
    return { id: user.id, role: user.role, isActive: user.isActive };
  });
}
