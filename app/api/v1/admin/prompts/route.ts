import { createAdminPromptVersion, getAdminPrompts, resolveAdminActorFromRequest } from "@/lib/admin-api";
import { isAdminPromptKey } from "@/lib/admin-prompts";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await getAdminPrompts(actor);
  if (!payload) {
    return apiError("Admin role cannot access Prompt management", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => payload);
}

export async function POST(request: Request) {
  const actor = await resolveAdminActorFromRequest(request);
  if (!actor) {
    return apiError("Admin role is required", 401, "ADMIN_UNAUTHORIZED");
  }

  const payload = await parseJsonObject(request, "Admin prompt");
  if (payload instanceof Response) return payload;

  const { key, title, body, safetyRules, outputSchema, notes } = payload;
  if (
    typeof key !== "string" ||
    !isAdminPromptKey(key) ||
    typeof title !== "string" ||
    title.trim().length === 0 ||
    typeof body !== "string" ||
    body.trim().length === 0 ||
    !Array.isArray(safetyRules) ||
    safetyRules.some((rule) => typeof rule !== "string" || rule.trim().length === 0) ||
    typeof outputSchema !== "string" ||
    outputSchema.trim().length === 0 ||
    (notes !== undefined && typeof notes !== "string")
  ) {
    return apiError("Admin prompt payload is invalid", 400, "INVALID_ADMIN_PROMPT_PAYLOAD");
  }

  const result = await createAdminPromptVersion(actor, {
    key,
    title,
    body,
    safetyRules,
    outputSchema,
    notes
  });
  if (!result) {
    return apiError("Admin role cannot manage prompts", 403, "ADMIN_FORBIDDEN");
  }

  return withApiErrors(async () => result);
}
