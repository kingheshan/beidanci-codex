import { getAdminSafetyReviews, resolveAdminActorFromRequest, updateAdminSafetyReview } from "@/lib/admin-api";
import { isAdminSafetyAction } from "@/lib/admin-safety";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminSafetyReviews(actor);
  if (!payload) {
    return apiError("Admin role cannot access safety reviews", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin safety action");
  if (payload instanceof Response) return payload;

  const { reviewId, action } = payload;
  if (typeof reviewId !== "string" || reviewId.trim().length === 0 || typeof action !== "string" || !isAdminSafetyAction(action)) {
    return apiError("Admin safety action payload is invalid", 400, "INVALID_ADMIN_SAFETY_PAYLOAD");
  }

  const result = await updateAdminSafetyReview(actor, reviewId, action);
  if (!result) {
    return apiError("Admin role cannot manage safety reviews", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
