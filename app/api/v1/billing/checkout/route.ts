import { extractAuthTokenFromRequest, verifyAuthSessionToken } from "@/lib/auth-server";
import { createProCheckout } from "@/lib/billing";
import { ApiError } from "@/lib/api-client";
import { apiError, parseJsonObject, withApiErrors } from "@/lib/mock-api-route-helpers";
import { isBillingChannel, isProPlanId } from "@/lib/pro-data";

function demoBillingUser() {
  return {
    id: "u_xiaomin",
    name: "小敏"
  };
}

async function resolveBillingUser(request: Request) {
  const token = extractAuthTokenFromRequest(request);
  if (!token) {
    if (process.env.NODE_ENV === "production") return null;
    return demoBillingUser();
  }

  const session = await verifyAuthSessionToken(token);
  return {
    id: session.user.id,
    name: session.user.name
  };
}

export async function POST(request: Request) {
  const body = await parseJsonObject(request, "Billing checkout");
  if (body instanceof Response) return body;

  const planId = body.planId;
  const channel = body.channel;

  if (!isProPlanId(planId)) {
    return apiError("Unsupported PRO plan", 400, "INVALID_PRO_PLAN");
  }

  if (channel !== undefined && !isBillingChannel(channel)) {
    return apiError("Unsupported billing channel", 400, "INVALID_BILLING_CHANNEL");
  }

  return withApiErrors(async () => {
    const user = await resolveBillingUser(request);
    if (!user) {
      throw new ApiError("请先登录", { status: 401, code: "AUTH_REQUIRED" });
    }

    return await createProCheckout(
      {
        planId,
        channel
      },
      {
        userId: user.id,
        customerName: user.name
      }
    );
  });
}
