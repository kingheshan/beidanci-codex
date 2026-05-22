import { createAdminImportJob, getAdminImportJobs, resolveAdminActorFromRequest } from "@/lib/admin-api";
import { isWordbookId } from "@/lib/admin-content";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminImportJobs(actor);
  if (!payload) {
    return apiError("Admin role cannot access import quality", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin import job");
  if (payload instanceof Response) return payload;

  const { source, bookId } = payload;
  if (typeof source !== "string" || source.trim().length === 0 || typeof bookId !== "string" || !isWordbookId(bookId)) {
    return apiError("Admin import job payload is invalid", 400, "INVALID_ADMIN_IMPORT_PAYLOAD");
  }

  const result = await createAdminImportJob(actor, {
    source,
    bookId
  });
  if (!result) {
    return apiError("Admin role cannot manage import quality", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
