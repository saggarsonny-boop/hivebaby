import { requirePermission } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";

export async function GET() {
  return handleRoute(async () => {
    const context = await requirePermission("manage_org_settings");
    const usage = await prisma.aIUsageLog.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { createdAt: "desc" },
      take: 100
    });
    return { usage };
  });
}
