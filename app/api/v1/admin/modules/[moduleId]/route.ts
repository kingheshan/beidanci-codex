import { getAdminModuleDetail, isAdminModuleId, resolveAdminActorFromRequest } from "@/lib/admin-api";
import { apiError, type AdminModuleRouteContext, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request, context: AdminModuleRouteContext) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const moduleId = context.params.moduleId;
  if (!isAdminModuleId(moduleId)) {
    return apiError("Admin module was not found", 404, "ADMIN_MODULE_NOT_FOUND");
  }

  const params = new URL(request.url).searchParams;
  const detail = await getAdminModuleDetail(actor, moduleId, {
    q: params.get("q") ?? undefined,
    page: parseIntegerParam(params.get("page")),
    pageSize: parseIntegerParam(params.get("pageSize"))
  });
  if (!detail) {
    return apiError("Admin role cannot access this module", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => detail);
}

function parseIntegerParam(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}
