import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 19 web rank renders desktop leaderboard and rules", async ({ page }) => {
  await page.goto("/rank", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "翡翠组排行" })).toBeVisible();
  await expect(page.getByText("本周前 10 名晋级铂金组 · 还剩 2 天")).toBeVisible();
  await expect(page.getByRole("heading", { name: "联赛总览" })).toBeVisible();
  await expect(page.getByText("冲榜建议")).toBeVisible();
  await expect(page.getByText("晋级区")).toBeVisible();
  await expect(page.getByText("保级线")).toBeVisible();
  await expect(page.getByText("降级线（保级及格 480 XP）")).toBeVisible();
  await expect(page.getByRole("button", { name: /5 吴小敏 \(你\) 820 XP/ })).toBeVisible();

  await page.getByRole("button", { name: "查看规则" }).click();
  await expect(page.getByText("每周结算一次，前 10 名晋级，最后 1 名进入保级区。")).toBeVisible();
});

test("Gate 19 web rank routes desktop actions", async ({ page }) => {
  await page.goto("/rank", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "返回今日学习" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/rank", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "开始冲榜练习 Web" }).click();
  await expect(page).toHaveURL(/\/study\/mc$/);
});

test("Gate 30 web leaderboard route aliases the rank workspace", async ({ page }) => {
  await page.goto("/leaderboard", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "翡翠组排行" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "联赛总览" })).toBeVisible();

  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");
  await page.getByRole("button", { name: "排行榜" }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);
  await expect(page.getByRole("heading", { name: "翡翠组排行" })).toBeVisible();
});
