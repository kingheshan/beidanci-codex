import { applyAdminAction, canAccessPersistedAdminModule, isAdminModuleId, requiresAdminActionConfirmation, resolveAdminActorFromRequest, type AdminActionInput } from "@/lib/admin-api";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin action");
  if (payload instanceof Response) return payload;

  const { moduleId, action, target, confirmation } = payload;
  if (typeof moduleId !== "string" || !isAdminModuleId(moduleId) || typeof action !== "string" || action.trim().length === 0) {
    return apiError("Admin action payload is missing required fields", 400, "INVALID_ADMIN_ACTION_PAYLOAD");
  }

  if (target !== undefined && typeof target !== "string") {
    return apiError("Admin action target must be a string", 400, "INVALID_ADMIN_ACTION_PAYLOAD");
  }

  const input: AdminActionInput = {
    moduleId,
    action,
    target
  };
  if (!(await canAccessPersistedAdminModule(actor, moduleId))) {
    return apiError("Admin role cannot perform this action", 403, "ADMIN_FORBIDDEN");
  }

  if (requiresAdminActionConfirmation(input) && confirmation !== "confirmed") {
    return apiError("Admin action requires confirmation", 428, "ADMIN_CONFIRMATION_REQUIRED");
  }

  const result = await applyAdminAction(actor, input);
  if (!result) {
    return apiError("Admin role cannot perform this action", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
