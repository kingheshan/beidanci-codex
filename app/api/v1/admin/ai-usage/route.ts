import { getAdminAiUsage, resolveAdminActorFromRequest, updateAdminAiUsageAlert } from "@/lib/admin-api";
import { isAdminAiUsageAlertAction } from "@/lib/admin-ai-usage";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminAiUsage(actor);
  if (!payload) {
    return apiError("Admin role cannot access AI usage telemetry", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const body = await parseJsonObject(request, "Admin AI usage action");
  if (body instanceof Response) return body;

  const alertId = body.alertId;
  const action = body.action;
  if (typeof alertId !== "string" || typeof action !== "string" || !isAdminAiUsageAlertAction(action)) {
    return apiError("Invalid AI usage alert action payload", 400, "ADMIN_INVALID_PAYLOAD");
  }

  const payload = await updateAdminAiUsageAlert(actor, alertId, action);
  if (!payload) {
    return apiError("Admin role cannot update AI usage telemetry", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
