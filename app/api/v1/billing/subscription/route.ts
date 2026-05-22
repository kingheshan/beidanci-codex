import { extractAuthTokenFromRequest, verifyAuthSessionToken } from "@/lib/auth-server";
import { readUserSubscription } from "@/lib/billing";
import { apiError, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const token = extractAuthTokenFromRequest(request);
  if (!token) {
    if (process.env.NODE_ENV === "production") {
      return apiError("请先登录", 401, "AUTH_REQUIRED");
    }

    return withApiErrors(() => readUserSubscription("u_xiaomin"));
  }

  return withApiErrors(async () => {
    const session = await verifyAuthSessionToken(token);
    return await readUserSubscription(session.user.id);
  });
}
