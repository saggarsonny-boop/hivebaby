import { auth, currentUser } from "@clerk/nextjs/server";
import type { Role, UserProfile } from "@prisma/client";
import { prisma } from "./prisma";
import { ApiError } from "./errors";
import { roleHasPermission } from "./permissions";

export type RequestContext = {
  clerkUserId: string;
  organizationId: string;
  user: UserProfile;
};

export async function getCurrentUser() {
  const session = await auth();
  if (!session.userId) return null;
  const user = await prisma.userProfile.findUnique({ where: { clerkUserId: session.userId } });
  if (!user?.isActive) return null;
  return user;
}

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Authentication required.", "unauthenticated");
  return user;
}

export async function requireOrganization() {
  const user = await requireAuth();
  if (!user.organizationId) throw new ApiError(403, "Organization membership required.", "organization_required");
  return { clerkUserId: user.clerkUserId, organizationId: user.organizationId, user };
}

export async function getCurrentOrganizationId() {
  return (await requireOrganization()).organizationId;
}

export async function requireRole(allowedRoles: Role[]) {
  const context = await requireOrganization();
  if (!allowedRoles.includes(context.user.role)) throw new ApiError(403, "Insufficient role.", "insufficient_role");
  return context;
}

export async function requirePermission(permission: string) {
  const context = await requireOrganization();
  const org = await prisma.organization.findUnique({ where: { id: context.organizationId } });
  let allowed = roleHasPermission(context.user.role, permission);

  if (
    permission === "approve_explanations" &&
    context.user.role === "clinician_reviewer" &&
    org?.allowClinicianReviewerApproval
  ) {
    allowed = true;
  }

  if (!allowed) throw new ApiError(403, "Insufficient permission.", "insufficient_permission");
  return context;
}

export function assertSameOrganization(resource: { organizationId: string } | null | undefined, organizationId: string) {
  if (!resource || resource.organizationId !== organizationId) {
    throw new ApiError(404, "Resource not found.", "cross_tenant_or_missing");
  }
  return resource;
}

export async function syncCurrentClerkUser() {
  const session = await auth();
  const clerkUser = await currentUser();
  if (!session.userId || !clerkUser) throw new ApiError(401, "Authentication required.", "unauthenticated");
  return prisma.userProfile.findUnique({ where: { clerkUserId: session.userId } });
}
