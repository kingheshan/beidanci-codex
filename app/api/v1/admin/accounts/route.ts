import { getAdminAccountsManagement, resolveAdminActorFromRequest } from "@/lib/admin-api";
import { apiError, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminAccountsManagement(actor);
  if (!payload) {
    return apiError("Admin role cannot access account management", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
