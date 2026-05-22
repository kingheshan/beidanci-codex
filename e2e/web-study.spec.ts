import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 16 web study hub renders desktop cards and routes into a mode", async ({ page }) => {
  await page.goto("/study", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "选择刷词方式" })).toBeVisible();
  await expect(page.getByText("6 种科学验证的记忆方法，按你今天的状态自由切换。")).toBeVisible();
  await expect(page.getByText("经典 Duolingo 体验。配合 SRS 算法，给你刚好够难的题。")).toBeVisible();
  await expect(page.getByText("AI 根据你的兴趣生成例句，挖空让你选词。")).toBeVisible();
  await expect(page.getByRole("button", { name: "返回今日学习" })).toBeVisible();

  await page.getByRole("button", { name: /听音辨义/ }).click();
  await expect(page).toHaveURL(/\/study\/listen$/);
});

test("Gate 16 web study hub returns to the dashboard", async ({ page }) => {
  await page.goto("/study", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "选择刷词方式" })).toBeVisible();
  await page.getByRole("button", { name: "返回今日学习" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});
