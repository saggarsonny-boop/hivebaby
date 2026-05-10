import { requireOrganization } from "@/lib/server/auth";
import { handleRoute } from "@/lib/server/route";

export async function GET() {
  return handleRoute(async () => {
    const { user, organizationId } = await requireOrganization();
    return {
      user: {
        id: user.id,
        organizationId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  });
}
