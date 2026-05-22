import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 17 web review renders desktop queue and opens weak word detail", async ({ page }) => {
  await page.goto("/review", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "智能复习" })).toBeVisible();
  await expect(page.getByText("基于艾宾浩斯遗忘曲线 · 14 个词等待复习")).toBeVisible();
  await expect(page.getByText("本周完成")).toBeVisible();
  await expect(page.getByRole("button", { name: "开始复习 14 词" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "队列" })).toBeVisible();

  await page.getByRole("button", { name: "生疏" }).click();
  await expect(page.getByRole("button", { name: /persist 坚持/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /achieve 实现/ })).toHaveCount(0);

  await page.getByRole("button", { name: /persist 坚持/ }).click();
  await expect(page).toHaveURL(/\/word\/w1$/);
});

test("Gate 17 web review starts a review session", async ({ page }) => {
  await page.goto("/review", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "智能复习" })).toBeVisible();
  await page.getByRole("button", { name: "开始复习 14 词" }).click();
  await expect(page).toHaveURL(/\/study\/mc(?:\?.*)?$/);
});
