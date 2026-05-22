import { extractAuthTokenFromRequest, verifyAuthSessionToken } from "@/lib/auth-server";
import { routeApi, withApiErrors } from "@/lib/mock-api-route-helpers";
import { getUserReviewQueue } from "@/lib/srs-review";

export async function GET(request: Request) {
  const token = extractAuthTokenFromRequest(request);
  if (!token) {
    return withApiErrors(() => routeApi.getReviewQueue());
  }

  return withApiErrors(async () => {
    const session = await verifyAuthSessionToken(token);
    const queue = await getUserReviewQueue(session.user.id);
    return queue.length > 0 ? queue : await routeApi.getReviewQueue();
  });
}
