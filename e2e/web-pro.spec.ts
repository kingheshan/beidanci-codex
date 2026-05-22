import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 23 web PRO renders desktop upgrade workspace and returns to dashboard", async ({ page }) => {
  await page.goto("/pro", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("pro-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "PRO 升级工作台" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "升级 PRO" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "PRO 能力对比" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "选择订阅方案" })).toBeVisible();
  await expect(page.getByText("3 倍 AI 学习加速")).toBeVisible();
  await expect(page.getByText("家长安心")).toBeVisible();
  await expect(page.getByRole("button", { name: /年会员/ })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "返回今日学习" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("Gate 23 web PRO selects lifetime plan and activates subscription", async ({ page }) => {
  await page.goto("/pro", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("pro-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: /终身会员/ }).click();
  await expect(page.getByRole("button", { name: "立即升级 PRO · ¥488" })).toBeVisible();
  await page.getByRole("button", { name: "立即升级 PRO · ¥488" }).click();

  await expect(page.getByText("升级成功，已解锁终身会员")).toBeVisible();
  await expect(page).toHaveURL(/\/me$/);

  const subscription = await page.evaluate(() => {
    const raw = localStorage.getItem("aishang-vocab-store");
    return raw ? JSON.parse(raw).state.subscription : null;
  });
  expect(subscription).toMatchObject({
    isPro: true,
    planId: "lifetime"
  });
});
