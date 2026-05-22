import { extractAuthTokenFromRequest, verifyAuthSessionToken } from "@/lib/auth-server";
import { submitLearningAnswer } from "@/lib/learning-records";
import { parseAnswerPayload, routeApi, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function POST(request: Request) {
  const input = await parseAnswerPayload(request);
  if (input instanceof Response) return input;

  const token = extractAuthTokenFromRequest(request);
  if (!token) {
    return withApiErrors(() => routeApi.submitAnswer(input));
  }

  return withApiErrors(async () => {
    const session = await verifyAuthSessionToken(token);
    return await submitLearningAnswer(input, { userId: session.user.id });
  });
}
