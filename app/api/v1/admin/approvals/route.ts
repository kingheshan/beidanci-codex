import { getAdminApprovals, resolveAdminActorFromRequest, updateAdminApprovalRequest } from "@/lib/admin-api";
import { isAdminApprovalAction } from "@/lib/admin-approvals";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminApprovals(actor);
  if (!payload) {
    return apiError("Admin role cannot access approval requests", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const body = await parseJsonObject(request, "Admin approval action");
  if (body instanceof Response) return body;

  const requestId = body.requestId;
  const action = body.action;
  if (typeof requestId !== "string" || typeof action !== "string" || !isAdminApprovalAction(action)) {
    return apiError("Invalid approval action payload", 400, "ADMIN_INVALID_PAYLOAD");
  }

  const payload = await updateAdminApprovalRequest(actor, requestId, action);
  if (!payload) {
    return apiError("Admin role cannot update approval requests", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
