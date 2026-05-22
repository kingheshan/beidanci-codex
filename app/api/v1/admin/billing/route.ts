import { getAdminBillingOrders, resolveAdminActorFromRequest, updateAdminBillingOrder } from "@/lib/admin-api";
import { isAdminBillingAction } from "@/lib/admin-billing";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminBillingOrders(actor);
  if (!payload) {
    return apiError("Admin role cannot access billing orders", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const body = await parseJsonObject(request, "Admin billing action");
  if (body instanceof Response) return body;

  const orderId = body.orderId;
  const action = body.action;
  if (typeof orderId !== "string" || typeof action !== "string" || !isAdminBillingAction(action)) {
    return apiError("Invalid billing action payload", 400, "ADMIN_INVALID_PAYLOAD");
  }

  const payload = await updateAdminBillingOrder(actor, orderId, action);
  if (!payload) {
    return apiError("Admin role cannot update billing orders", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}
