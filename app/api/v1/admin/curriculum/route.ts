import { getAdminCurriculumPolicies, resolveAdminActorFromRequest, updateAdminCurriculumPolicy } from "@/lib/admin-api";
import { isAdminCurriculumAction } from "@/lib/admin-curriculum";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminCurriculumPolicies(actor);
  if (!payload) {
    return apiError("Admin role cannot access curriculum policies", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const body = await parseJsonObject(request, "Admin curriculum action");
  if (body instanceof Response) return body;

  const policyId = body.policyId;
  const action = body.action;
  if (typeof policyId !== "string" || typeof action !== "string" || !isAdminCurriculumAction(action)) {
    return apiError("Invalid curriculum action payload", 400, "ADMIN_INVALID_PAYLOAD");
  }

  const payload = await updateAdminCurriculumPolicy(actor, policyId, action);
  if (!payload) {
    return apiError("Admin role cannot update curriculum policies", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
