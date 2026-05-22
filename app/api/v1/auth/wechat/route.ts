import { authenticateWechatLogin, createAuthCookie } from "@/lib/auth-server";
import { parseWechatLoginPayload, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function POST(request: Request) {
  const input = await parseWechatLoginPayload(request);
  if (input instanceof Response) return input;

  return withApiErrors(() => authenticateWechatLogin(input), (session) => ({
    headers: {
      "Set-Cookie": createAuthCookie(session.token)
    }
  }));
}
