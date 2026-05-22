import { authenticatePhoneLogin, createAuthCookie } from "@/lib/auth-server";
import { parsePhoneLoginPayload, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function POST(request: Request) {
  const input = await parsePhoneLoginPayload(request);
  if (input instanceof Response) return input;

  return withApiErrors(() => authenticatePhoneLogin(input), (session) => ({
    headers: {
      "Set-Cookie": createAuthCookie(session.token)
    }
  }));
}
