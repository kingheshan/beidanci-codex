import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 26 web mistakes renders desktop notebook and filters frequent rows", async ({ page }) => {
  await page.goto("/mistakes", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("mistakes-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "错题本" })).toBeVisible();
  await expect(page.getByText("AI 自动追踪你的弱项 · 重做错题效率提升 3 倍")).toBeVisible();
  await expect(page.getByText("错题工作台")).toBeVisible();
  await expect(page.getByText("纠错效率")).toBeVisible();
  await expect(page.getByRole("button", { name: /persist 坚持/ })).toBeVisible();

  await page.getByRole("button", { name: "高频错（≥2 次）" }).click();
  await expect(page.getByRole("button", { name: /determine 决定/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /ambition 抱负/ })).toHaveCount(0);

  await page.getByRole("button", { name: /persist 坚持/ }).first().click({ force: true });
  await expect(page).toHaveURL(/\/word\/w1$/);
});

test("Gate 26 web mistakes opens from dashboard and starts retry practice", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "错题本" }).click();
  await expect(page).toHaveURL(/\/mistakes$/);
  await expect(page.getByTestId("mistakes-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: /再练这 \d+ 个错词/ }).click();
  await expect(page).toHaveURL(/\/study\/mc(?:\?.*)?$/);
});
