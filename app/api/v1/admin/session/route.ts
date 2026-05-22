import { adminAccountToActor, authenticateAdminCredentials, createAdminSessionRecord } from "@/lib/admin-auth";
import { getAdminRepository } from "@/lib/admin-repository";
import { createAdminSessionIdCookie } from "@/lib/admin-session";
import { apiError, apiJson, parseJsonObject } from "@/lib/mock-api-route-helpers";

export async function POST(request: Request) {
  const payload = await parseJsonObject(request, "Admin session");
  if (payload instanceof Response) return payload;

  const { email, password } = payload;
  if (typeof email !== "string" || typeof password !== "string") {
    return apiError("Admin session payload is missing required fields", 400, "INVALID_ADMIN_SESSION_PAYLOAD");
  }

  const repository = getAdminRepository();
  const account = await authenticateAdminCredentials(repository, email, password);
  if (!account) {
    return apiError("Admin credentials are invalid", 401, "ADMIN_LOGIN_FAILED");
  }
  const actor = adminAccountToActor(account);
  const session = await repository.createAdminSession(createAdminSessionRecord(account));

  return apiJson(
    {
      actor
    },
    {
      headers: {
        "Set-Cookie": createAdminSessionIdCookie(session)
      }
    }
  );
}
