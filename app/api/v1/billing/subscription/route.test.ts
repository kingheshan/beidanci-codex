import { afterEach, describe, expect, it } from "vitest";
import { createProCheckout, resetBillingStoreForTests } from "@/lib/billing";
import { GET } from "./route";

describe("/api/v1/billing/subscription", () => {
  afterEach(async () => {
    await resetBillingStoreForTests();
  });

  it("returns the demo user's active subscription when present", async () => {
    await createProCheckout(
      { planId: "monthly", channel: "demo" },
      {
        userId: "u_xiaomin",
        customerName: "小敏",
        now: new Date("2026-05-22T12:00:00.000Z")
      }
    );

    const response = await GET(new Request("http://localhost/api/v1/billing/subscription"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      isPro: true,
      planId: "monthly",
      startedAt: "2026-05-22T12:00:00.000Z"
    });
  });
});
