import { COOKIE_SESSION_TOKEN } from "@/lib/auth";
import { extractAuthTokenFromRequest, verifyAuthSessionToken } from "@/lib/auth-server";
import { apiError, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const token = extractAuthTokenFromRequest(request);
  if (!token) {
    return apiError("请先登录", 401, "AUTH_SESSION_REQUIRED");
  }

  return withApiErrors(async () => {
    const session = await verifyAuthSessionToken(token);
    return {
      ...session,
      token: COOKIE_SESSION_TOKEN
    };
  });
}
