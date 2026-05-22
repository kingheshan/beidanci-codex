import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 21 web PK renders desktop match cockpit and starts a round", async ({ page }) => {
  await page.goto("/pk", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "PK 对战工作台" })).toBeVisible();
  await expect(page.getByText("AI 人机对战", { exact: true })).toBeVisible();
  await expect(page.getByText("6 题分胜负", { exact: true })).toBeVisible();
  await expect(page.getByText("赢家奖励", { exact: true })).toBeVisible();
  await expect(page.getByText("正在唤醒 AI 对手...").or(page.getByText("第 1 题 / 6"))).toBeVisible();

  await expect(page.getByText("第 1 题 / 6")).toBeVisible({ timeout: 6000 });
  await expect(page.getByText("本轮目标")).toBeVisible();
  await expect(page.getByRole("heading", { name: "坚持" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "战况分析" })).toBeVisible();
});

test("Gate 21 web PK answers and routes back from the desktop topbar", async ({ page }) => {
  await page.goto("/pk", { waitUntil: "networkidle" });

  await expect(page.getByText("第 1 题 / 6")).toBeVisible({ timeout: 6000 });
  await page.getByRole("button", { name: "persist 坚持" }).click();
  await expect(page.getByText("命中！对手 -18%")).toBeVisible();

  await page.getByRole("button", { name: "返回今日学习" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});
