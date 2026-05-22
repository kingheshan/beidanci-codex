import { resolveAdminActorFromRequest, revokeAdminSession } from "@/lib/admin-api";
import { apiError, withApiErrors } from "@/lib/mock-api-route-helpers";

type AdminSessionRouteContext = {
  params: {
    sessionId: string;
  };
};

export async function DELETE(request: Request, context: AdminSessionRouteContext) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  if (actor.role !== "owner") {
    return apiError("Admin role cannot revoke sessions", 403, "ADMIN_FORBIDDEN");
  }

  const result = await revokeAdminSession(actor, context.params.sessionId);
  if (!result) {
    return apiError("Admin session was not found", 404, "ADMIN_SESSION_NOT_FOUND");
  }

  return withApiErrors(async () => result);
}
