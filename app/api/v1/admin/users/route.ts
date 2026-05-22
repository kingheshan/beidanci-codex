import { getAdminUsers, resolveAdminActorFromRequest, updateAdminUserStatus } from "@/lib/admin-api";
import { isAdminUserAction } from "@/lib/admin-users";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminUsers(actor);
  if (!payload) {
    return apiError("Admin role cannot access users", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin user action");
  if (payload instanceof Response) return payload;

  const { userId, action } = payload;
  if (typeof userId !== "string" || userId.trim().length === 0 || typeof action !== "string" || !isAdminUserAction(action)) {
    return apiError("Admin user action payload is invalid", 400, "INVALID_ADMIN_USER_PAYLOAD");
  }

  const result = await updateAdminUserStatus(actor, userId, action);
  if (!result) {
    return apiError("Admin role cannot manage users", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
