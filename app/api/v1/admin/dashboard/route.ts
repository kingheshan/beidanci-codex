import { getAdminDashboardSnapshot, resolveAdminActorFromRequest, updateAdminDashboardSnapshot } from "@/lib/admin-api";
import { isAdminDashboardAction } from "@/lib/admin-dashboard";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminDashboardSnapshot(actor);
  if (!payload) {
    return apiError("Admin role cannot access dashboard snapshots", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const body = await parseJsonObject(request, "Admin dashboard action");
  if (body instanceof Response) return body;

  const action = body.action;
  if (typeof action !== "string" || !isAdminDashboardAction(action)) {
    return apiError("Invalid dashboard action payload", 400, "ADMIN_INVALID_PAYLOAD");
  }

  const payload = await updateAdminDashboardSnapshot(actor, action);
  if (!payload) {
    return apiError("Admin role cannot update dashboard snapshots", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
