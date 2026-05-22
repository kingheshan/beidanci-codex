import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 15 web dashboard renders and starts the primary lesson", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "今日学习总览" })).toBeVisible();
  await expect(page.getByText("下午好，小敏")).toBeVisible();
  await expect(page.getByText("中考 1600 · 今日计划")).toBeVisible();
  await expect(page.getByText("今日新词")).toBeVisible();
  await expect(page.getByText("The Persistent Bookworm")).toBeVisible();

  await page.getByRole("button", { name: "开始今日学习" }).click({ force: true });
  await expect(page).toHaveURL(/\/study\/mc$/, { timeout: 10_000 });
});

test("Gate 15 web dashboard opens implemented desktop entries", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "今日学习总览" })).toBeVisible();
  await page.getByRole("button", { name: "我的词书" }).click({ force: true });
  await expect(page).toHaveURL(/\/dictionary$/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "我的词书" })).toBeVisible();

  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "只看 AI 故事" }).click({ force: true });
  await expect(page).toHaveURL(/\/story$/, { timeout: 10_000 });
});
