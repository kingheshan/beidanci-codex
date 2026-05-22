import { getAdminRolesManagement, isAdminModuleId, isAdminRole, resolveAdminActorFromRequest, updateAdminRolePermissions } from "@/lib/admin-api";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminRolesManagement(actor);
  if (!payload) {
    return apiError("Admin role cannot access role management", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin role update");
  if (payload instanceof Response) return payload;

  const { role, moduleIds } = payload;
  if (typeof role !== "string" || !isAdminRole(role) || !Array.isArray(moduleIds) || moduleIds.some((moduleId) => typeof moduleId !== "string" || !isAdminModuleId(moduleId))) {
    return apiError("Admin role update payload is invalid", 400, "INVALID_ADMIN_ROLE_PAYLOAD");
  }

  const result = await updateAdminRolePermissions(actor, role, moduleIds);
  if (!result) {
    return apiError("Admin role cannot update role permissions", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
