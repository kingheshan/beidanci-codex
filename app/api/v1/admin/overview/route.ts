import { getAdminOverview, resolveAdminActorFromRequest } from "@/lib/admin-api";
import { apiError, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  return withApiErrors(async () => getAdminOverview(actor));
}
