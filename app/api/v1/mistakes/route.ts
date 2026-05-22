import { extractAuthTokenFromRequest, verifyAuthSessionToken } from "@/lib/auth-server";
import { getUserMistakes } from "@/lib/learning-records";
import { parseMistakesQuery, routeApi, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const input = parseMistakesQuery(request);
  if (input instanceof Response) return input;

  const token = extractAuthTokenFromRequest(request);
  if (!token) {
    return withApiErrors(() => routeApi.getMistakes(input));
  }

  return withApiErrors(async () => {
    const session = await verifyAuthSessionToken(token);
    return await getUserMistakes(session.user.id, input);
  });
}
