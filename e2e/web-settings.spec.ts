import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 28 web settings renders desktop plan controls and toggles reminders", async ({ page }) => {
  await page.goto("/settings", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("settings-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "设置中心" })).toBeVisible();
  await expect(page.getByText("计划控制台")).toBeVisible();
  await expect(page.getByText("词书与进度")).toBeVisible();
  await expect(page.getByText("提醒与护航")).toBeVisible();
  await expect(page.getByText("发音与个性化")).toBeVisible();
  await expect(page.getByText("设备与账号")).toBeVisible();
  await expect(page.getByLabel("每日新词量")).toHaveValue("20");

  const reviewReminder = page.getByRole("switch", { name: "复习提醒" });
  await expect(reviewReminder).toHaveAttribute("aria-checked", "true");
  await reviewReminder.click();
  await expect(reviewReminder).toHaveAttribute("aria-checked", "false");

  await page.getByRole("button", { name: "个人主页" }).click();
  await expect(page).toHaveURL(/\/me$/);
});

test("Gate 28 web settings opens from dashboard and routes back to today's study", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "设置" }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByTestId("settings-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "今日学习" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});
