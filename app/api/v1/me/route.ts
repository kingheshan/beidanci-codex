import { extractAuthTokenFromRequest, verifyAuthSessionToken } from "@/lib/auth-server";
import { getLearningSummary } from "@/lib/learning-records";
import { routeApi, withApiErrors } from "@/lib/mock-api-route-helpers";

export async function GET(request: Request) {
  const token = extractAuthTokenFromRequest(request);
  if (!token) {
    return withApiErrors(() => routeApi.getMe());
  }

  return withApiErrors(async () => {
    const [baseUser, session] = await Promise.all([routeApi.getMe(), verifyAuthSessionToken(token)]);
    const learning = await getLearningSummary(session.user.id);
    return {
      ...baseUser,
      id: session.user.id,
      name: session.user.name,
      avatar: session.user.avatar,
      phone: session.user.phone,
      wechatOpenId: session.user.wechatOpenId,
      xp: baseUser.xp + learning.xpEarned,
      hearts: Math.max(0, baseUser.hearts - learning.heartsLost)
    };
  });
}
