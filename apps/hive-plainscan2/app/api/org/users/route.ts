import { z } from "zod";
import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { roleSchema } from "@/lib/server/schemas";

const inviteSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: roleSchema
});

export async function GET() {
  return handleRoute(async () => {
    const context = await requirePermission("manage_users");
    const users = await prisma.userProfile.findMany({
      where: { organizationId: context.organizationId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, lastLoginAt: true }
    });
    return { users };
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("manage_users");
    const input = inviteSchema.parse(await request.json());
    const user = await prisma.userProfile.create({
      data: {
        organizationId: context.organizationId,
        clerkUserId: `pending:${input.email}`,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role
      }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "user_invited",
      resourceType: "user",
      resourceId: user.id
    });
    return { id: user.id, status: "invited" };
  });
}
