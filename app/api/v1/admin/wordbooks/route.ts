import { getAdminWordbookReleases, publishAdminWordbookRelease, resolveAdminActorFromRequest } from "@/lib/admin-api";
import { isAdminWordbookStatus, isWordbookId } from "@/lib/admin-content";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminWordbookReleases(actor);
  if (!payload) {
    return apiError("Admin role cannot access wordbook management", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin wordbook release");
  if (payload instanceof Response) return payload;

  const { bookId, version, status } = payload;
  if (
    typeof bookId !== "string" ||
    !isWordbookId(bookId) ||
    (version !== undefined && (typeof version !== "string" || !/^v\d{4}\.\d{2}\.\d{2}$/.test(version))) ||
    (status !== undefined && (typeof status !== "string" || !isAdminWordbookStatus(status)))
  ) {
    return apiError("Admin wordbook release payload is invalid", 400, "INVALID_ADMIN_WORDBOOK_PAYLOAD");
  }

  const result = await publishAdminWordbookRelease(actor, {
    bookId,
    version,
    status
  });
  if (!result) {
    return apiError("Admin role cannot publish wordbook releases", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
