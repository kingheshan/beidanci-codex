import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 27 web profile renders desktop learning portfolio and routes actions", async ({ page }) => {
  await page.goto("/me", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("me-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "个人主页工作台" })).toBeVisible();
  await expect(page.getByText("学习数据总览")).toBeVisible();
  await expect(page.getByText("最近 13 周学习热力图")).toBeVisible();
  await expect(page.getByText("徽章墙")).toBeVisible();
  await expect(page.getByText("词书进度")).toBeVisible();
  await expect(page.getByText("中考核心 1600")).toBeVisible();

  await page.getByRole("button", { name: "错题本 5 个高频错词" }).click();
  await expect(page).toHaveURL(/\/mistakes$/);
});

test("Gate 27 web profile opens from dashboard and routes top actions", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "个人主页" }).click();
  await expect(page).toHaveURL(/\/me$/);
  await expect(page.getByTestId("me-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "学习计划设置 每日计划 · 提醒 · 偏好" }).click();
  await expect(page).toHaveURL(/\/settings$/);
});
