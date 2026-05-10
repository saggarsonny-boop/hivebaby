import { requirePermission } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";

export async function GET() {
  return handleRoute(async () => {
    const context = await requirePermission("manage_org_settings");
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const daily = await prisma.aIUsageLog.aggregate({
      where: { organizationId: context.organizationId, createdAt: { gte: start } },
      _sum: { estimatedCostCents: true, inputTokenEstimate: true, outputTokenEstimate: true }
    });
    return { daily };
  });
}
