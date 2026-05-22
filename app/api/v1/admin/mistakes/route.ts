import { getAdminMistakeInsights, resolveAdminActorFromRequest, updateAdminMistakeInsight } from "@/lib/admin-api";
import { isAdminMistakeAction } from "@/lib/admin-mistakes";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminMistakeInsights(actor);
  if (!payload) {
    return apiError("Admin role cannot access mistake insights", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin mistake action");
  if (payload instanceof Response) return payload;

  const { insightId, action } = payload;
  if (typeof insightId !== "string" || insightId.trim().length === 0 || typeof action !== "string" || !isAdminMistakeAction(action)) {
    return apiError("Admin mistake action payload is invalid", 400, "INVALID_ADMIN_MISTAKE_PAYLOAD");
  }

  const result = await updateAdminMistakeInsight(actor, insightId, action);
  if (!result) {
    return apiError("Admin role cannot manage mistake insights", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
