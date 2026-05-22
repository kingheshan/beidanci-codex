import { getAdminSystemHealth, resolveAdminActorFromRequest, updateAdminSystemHealthCheck } from "@/lib/admin-api";
import { isAdminSystemHealthAction } from "@/lib/admin-system-health";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminSystemHealth(actor);
  if (!payload) {
    return apiError("Admin role cannot access system health", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin system health");
  if (payload instanceof Response) return payload;

  const { checkId, action } = payload;
  if (typeof checkId !== "string" || checkId.trim().length === 0 || typeof action !== "string" || !isAdminSystemHealthAction(action)) {
    return apiError("Admin system health payload is invalid", 400, "INVALID_ADMIN_SYSTEM_PAYLOAD");
  }

  const result = await updateAdminSystemHealthCheck(actor, checkId, action);
  if (!result) {
    return apiError("Admin role cannot manage system health", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
