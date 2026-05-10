import { z } from "zod";
import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";

const brandingSchema = z.object({
  logoStorageKey: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  clinicDisplayName: z.string().min(1).max(200).optional(),
  address: z.string().max(300).optional(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional(),
  defaultPdfFooter: z.string().max(1000).optional()
});

export async function GET() {
  return handleRoute(async () => {
    const context = await requirePermission("manage_org_settings");
    const branding = await prisma.brandingSettings.findUnique({ where: { organizationId: context.organizationId } });
    return { branding };
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("manage_org_settings");
    const input = brandingSchema.parse(await request.json());
    const branding = await prisma.brandingSettings.upsert({
      where: { organizationId: context.organizationId },
      update: input,
      create: {
        organizationId: context.organizationId,
        clinicDisplayName: input.clinicDisplayName || "ReportBridge Clinical",
        primaryColor: input.primaryColor || "#2563eb",
        ...input
      }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "branding_settings_changed",
      resourceType: "branding_settings",
      resourceId: branding.id
    });
    return { branding };
  });
}
