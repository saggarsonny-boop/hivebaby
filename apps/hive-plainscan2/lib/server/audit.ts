import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { redactPHI } from "./phi";

export type AuditEventInput = {
  organizationId: string;
  actorUserId?: string;
  actorRole?: Role;
  eventType: string;
  resourceType: string;
  resourceId?: string;
  patientId?: string;
  imagingReportId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog(input: AuditEventInput) {
  const safeMetadata = input.metadata ? JSON.parse(redactPHI(input.metadata)) : undefined;
  return prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      actorRole: input.actorRole,
      eventType: input.eventType,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      patientId: input.patientId,
      imagingReportId: input.imagingReportId,
      ipAddress: input.ipAddress || undefined,
      userAgent: input.userAgent || undefined,
      metadataJson: safeMetadata
    }
  });
}

export function requestAuditMeta(request: Request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent")
  };
}
