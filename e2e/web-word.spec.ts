import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 18 web word detail renders desktop learning cards and opens map", async ({ page }) => {
  await page.goto("/word/w1", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "persist" })).toBeVisible();
  await expect(page.getByText("/pərˈsɪst/")).toBeVisible();
  await expect(page.getByText("单词详情")).toBeVisible();
  await expect(page.getByText("今日掌握度")).toBeVisible();
  await expect(page.getByText("AI 记忆线索")).toBeVisible();
  await expect(page.getByText("例句 · 含 AI 个性化")).toBeVisible();
  await expect(page.getByText("派生 · 词组 · 关联")).toBeVisible();

  await page.getByRole("button", { name: "展开完整图谱" }).click();
  await expect(page).toHaveURL(/\/map\/w1$/);
});

test("Gate 18 web word detail starts review and returns to the queue", async ({ page }) => {
  await page.goto("/word/w1", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "返回复习队列" }).click();
  await expect(page).toHaveURL(/\/review$/);

  await page.goto("/word/w1", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "开始复习 persist" }).click();
  await expect(page).toHaveURL(/\/study\/mc$/);
});
