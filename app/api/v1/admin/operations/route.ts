import { getAdminOperationConfigs, resolveAdminActorFromRequest, updateAdminOperationConfig } from "@/lib/admin-api";
import { isAdminOperationAction } from "@/lib/admin-operations";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminOperationConfigs(actor);
  if (!payload) {
    return apiError("Admin role cannot access operation configs", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const body = await parseJsonObject(request, "Admin operation action");
  if (body instanceof Response) return body;

  const configId = body.configId;
  const action = body.action;
  if (typeof configId !== "string" || typeof action !== "string" || !isAdminOperationAction(action)) {
    return apiError("Invalid operation action payload", 400, "ADMIN_INVALID_PAYLOAD");
  }

  const payload = await updateAdminOperationConfig(actor, configId, action);
  if (!payload) {
    return apiError("Admin role cannot update operation configs", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
