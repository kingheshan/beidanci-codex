import { afterEach, describe, expect, it } from "vitest";
import { resetBillingStoreForTests } from "@/lib/billing";
import { POST } from "./route";

describe("/api/v1/billing/checkout", () => {
  afterEach(async () => {
    await resetBillingStoreForTests();
  });

  it("creates a paid checkout in demo mode", async () => {
    const response = await POST(
      new Request("http://localhost/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ planId: "lifetime", channel: "wechat" })
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.order).toMatchObject({
      planId: "lifetime",
      amountCny: 488,
      status: "paid"
    });
    expect(body.subscription).toMatchObject({
      isPro: true,
      planId: "lifetime",
      expiresAt: null
    });
  });

  it("rejects invalid plans and channels", async () => {
    const invalidPlan = await POST(
      new Request("http://localhost/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ planId: "weekly" })
      })
    );
    const invalidChannel = await POST(
      new Request("http://localhost/api/v1/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ planId: "monthly", channel: "cash" })
      })
    );

    expect(invalidPlan.status).toBe(400);
    expect(await invalidPlan.json()).toMatchObject({ code: "INVALID_PRO_PLAN" });
    expect(invalidChannel.status).toBe(400);
    expect(await invalidChannel.json()).toMatchObject({ code: "INVALID_BILLING_CHANNEL" });
  });
});
