import { expect, test } from "./fixtures";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test("Gate 25 parent app renders weekly report and switches tabs", async ({ page }) => {
  await page.goto("/parent", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("parent-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "小敏今天表现不错" })).toBeVisible();
  await expect(page.getByText("1,240 XP")).toBeVisible();
  await expect(page.getByText("本周新徽章")).toBeVisible();

  await page.getByRole("button", { name: "分析" }).click();
  await expect(page.getByRole("heading", { name: "能力分析" })).toBeVisible();
  await expect(page.getByText("形似词混淆")).toBeVisible();
  await page.getByRole("button", { name: "一键添加到孩子计划" }).click();
  await expect(page.getByText("已加入小敏本周专项计划")).toBeVisible();

  await page.getByRole("button", { name: "老师" }).click();
  await expect(page.getByRole("heading", { name: "王老师" })).toBeVisible();
  await expect(page.getByPlaceholder("回复王老师...")).toBeVisible();

  await page.getByRole("button", { name: "我的" }).click();
  await expect(page.getByRole("heading", { name: "家长账号" })).toBeVisible();
  await expect(page.getByText("吴妈妈")).toBeVisible();
});

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 25 parent report opens from the student dashboard", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "家长报告" }).click();
  await expect(page).toHaveURL(/\/parent$/);
  await expect(page.getByTestId("parent-ready")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByRole("heading", { name: "小敏今天表现不错" })).toBeVisible();
});
