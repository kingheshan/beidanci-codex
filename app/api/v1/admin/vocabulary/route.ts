import { createAdminVocabularyIssue, getAdminVocabularyIssues, resolveAdminActorFromRequest } from "@/lib/admin-api";
import { isAdminVocabularyIssueKind, isWordbookId } from "@/lib/admin-content";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminVocabularyIssues(actor);
  if (!payload) {
    return apiError("Admin role cannot access vocabulary quality", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin vocabulary issue");
  if (payload instanceof Response) return payload;

  const { kind, word, bookId } = payload;
  if (
    typeof kind !== "string" ||
    !isAdminVocabularyIssueKind(kind) ||
    typeof word !== "string" ||
    word.trim().length === 0 ||
    typeof bookId !== "string" ||
    !isWordbookId(bookId)
  ) {
    return apiError("Admin vocabulary issue payload is invalid", 400, "INVALID_ADMIN_VOCABULARY_PAYLOAD");
  }

  const result = await createAdminVocabularyIssue(actor, {
    kind,
    word,
    bookId
  });
  if (!result) {
    return apiError("Admin role cannot manage vocabulary quality", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
