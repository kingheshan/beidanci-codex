import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 29 web memory map renders desktop graph workspace and node detail", async ({ page }) => {
  await page.goto("/map/w1", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("memory-map-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "AI 记忆图谱工作台" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "persist 记忆图谱" })).toBeVisible();
  await expect(page.getByText("关系网络")).toBeVisible();
  await expect(page.getByText("节点详情")).toBeVisible();
  await expect(page.getByText("学习闭环")).toBeVisible();

  await page.getByRole("button", { name: "persistent 派生关系 adj. 坚持不懈的" }).click({ force: true });
  await expect(page.getByText("派生关系")).toBeVisible();
  await expect(page.getByText("adj. 坚持不懈的")).toBeVisible();

  await page.getByRole("button", { name: "开始专项复习 Web" }).click({ force: true });
  await expect(page).toHaveURL(/\/study\/mc$/, { timeout: 10_000 });
});

test("Gate 29 web memory map opens from word detail and returns to word", async ({ page }) => {
  await page.goto("/word/w1", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("word-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "展开完整图谱" }).click();
  await expect(page).toHaveURL(/\/map\/w1$/);
  await expect(page.getByTestId("memory-map-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "返回单词 Web" }).click();
  await expect(page).toHaveURL(/\/word\/w1$/);
});
