import { afterEach, describe, expect, it } from "vitest";
import { createMemoryBillingRepository, createProCheckout, readBillingOrders, readUserSubscription, resetBillingStoreForTests } from "./billing";
import { ApiError } from "./api-client";

describe("billing", () => {
  afterEach(async () => {
    await resetBillingStoreForTests();
  });

  it("creates a paid demo checkout and persists a PRO subscription", async () => {
    const repository = createMemoryBillingRepository();
    const checkout = await createProCheckout(
      { planId: "yearly", channel: "wechat" },
      {
        userId: "u_test",
        customerName: "小敏",
        now: new Date("2026-05-22T12:00:00.000Z"),
        repository
      }
    );

    expect(checkout.order).toMatchObject({
      userId: "u_test",
      planId: "yearly",
      amountCny: 168,
      status: "paid"
    });
    expect(checkout.subscription).toMatchObject({
      isPro: true,
      planId: "yearly",
      startedAt: "2026-05-22T12:00:00.000Z",
      sourceOrderId: checkout.order.id
    });
    await expect(readUserSubscription("u_test", { repository })).resolves.toMatchObject({
      isPro: true,
      planId: "yearly"
    });
    await expect(readBillingOrders({ repository })).resolves.toEqual([expect.objectContaining({ id: checkout.order.id, planId: "yearly" })]);
  });

  it("keeps production checkout behind provider configuration", async () => {
    await expect(
      createProCheckout(
        { planId: "monthly", channel: "wechat" },
        {
          userId: "u_test",
          customerName: "小敏",
          repository: createMemoryBillingRepository(),
          env: { BILLING_PROVIDER_MODE: "production" }
        }
      )
    ).rejects.toEqual(expect.objectContaining({ code: "BILLING_PROVIDER_NOT_CONFIGURED" }));
    await expect(
      createProCheckout(
        { planId: "monthly", channel: "wechat" },
        {
          userId: "u_test",
          customerName: "小敏",
          repository: createMemoryBillingRepository(),
          env: { BILLING_PROVIDER_MODE: "production" }
        }
      )
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("creates a pending production checkout with the requested channel", async () => {
    const checkout = await createProCheckout(
      { planId: "monthly", channel: "alipay" },
      {
        userId: "u_test",
        customerName: "小敏",
        repository: createMemoryBillingRepository(),
        env: { BILLING_PROVIDER_MODE: "production", BILLING_CHECKOUT_URL: "https://pay.example.test/checkout" }
      }
    );

    expect(checkout.order).toMatchObject({
      channel: "alipay",
      status: "pending"
    });
    expect(checkout.subscription.isPro).toBe(false);
    expect(checkout.payment).toMatchObject({
      provider: "alipay",
      status: "pending",
      checkoutUrl: "https://pay.example.test/checkout"
    });
  });
});
