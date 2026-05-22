import { getAdminAppConfigs, resolveAdminActorFromRequest, updateAdminAppConfig } from "@/lib/admin-api";
import { isAppConfigKey, isAppConfigStatus } from "@/lib/app-config-admin";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminAppConfigs(actor);
  if (!payload) {
    return apiError("Admin role cannot access app configs", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const body = await parseJsonObject(request, "Admin app config update");
  if (body instanceof Response) return body;

  if (!isAppConfigKey(body.key) || !body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
    return apiError("Invalid app config update payload", 400, "ADMIN_INVALID_PAYLOAD");
  }

  if (body.status !== undefined && !isAppConfigStatus(body.status)) {
    return apiError("Invalid app config status", 400, "ADMIN_INVALID_STATUS");
  }

  const payload = await updateAdminAppConfig(actor, {
    key: body.key,
    payload: body.payload,
    status: body.status
  });
  if (!payload) {
    return apiError("Admin role cannot update app configs", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
