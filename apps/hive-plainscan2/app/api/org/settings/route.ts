import { requirePermission } from "@/lib/server/auth";
import { createAuditLog, requestAuditMeta } from "@/lib/server/audit";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { handleRoute } from "@/lib/server/route";
import { settingsPatchSchema } from "@/lib/server/schemas";

export async function GET() {
  return handleRoute(async () => {
    const context = await requirePermission("manage_org_settings");
    const [org, settings, retention] = await Promise.all([
      prisma.organization.findUniqueOrThrow({ where: { id: context.organizationId } }),
      prisma.organizationSettings.upsert({
        where: { organizationId: context.organizationId },
        update: {},
        create: { organizationId: context.organizationId }
      }),
      prisma.retentionPolicy.upsert({
        where: { organizationId: context.organizationId },
        update: {},
        create: { organizationId: context.organizationId }
      })
    ]);
    return { organization: org, settings, retention };
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const context = await requirePermission("manage_org_settings");
    const input = settingsPatchSchema.parse(await request.json());
    if (input.allowPdfBeforeApproval && process.env.NODE_ENV === "production") {
      throw new ApiError(400, "PDFs before approval cannot be enabled in production.", "unsafe_setting_rejected");
    }
    const settings = await prisma.organizationSettings.upsert({
      where: { organizationId: context.organizationId },
      update: {
        requirePhysicianApproval: input.requirePhysicianApproval,
        allowPdfBeforeApproval: input.allowPdfBeforeApproval,
        sessionTimeoutMinutes: input.sessionTimeoutMinutes,
        phiLoggingDisabled: input.phiLoggingDisabled,
        allowPdfUpload: input.allowPdfUpload,
        allowImageUpload: input.allowImageUpload
      },
      create: {
        organizationId: context.organizationId,
        requirePhysicianApproval: input.requirePhysicianApproval ?? true,
        allowPdfBeforeApproval: input.allowPdfBeforeApproval ?? false,
        sessionTimeoutMinutes: input.sessionTimeoutMinutes ?? 15,
        phiLoggingDisabled: input.phiLoggingDisabled ?? true,
        allowPdfUpload: input.allowPdfUpload ?? true,
        allowImageUpload: input.allowImageUpload ?? false
      }
    });
    await prisma.organization.update({
      where: { id: context.organizationId },
      data: {
        allowClinicianReviewerApproval: input.allowClinicianReviewerApproval,
        dailyAiCostCapCents: input.dailyAiCostCapCents,
        defaultRetentionDays: input.defaultRetentionDays
      }
    });
    await createAuditLog({
      ...requestAuditMeta(request),
      organizationId: context.organizationId,
      actorUserId: context.user.id,
      actorRole: context.user.role,
      eventType: "settings_changed",
      resourceType: "organization",
      resourceId: context.organizationId
    });
    return { settings };
  });
}
