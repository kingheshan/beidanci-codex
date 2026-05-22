import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 24 web dictionary renders books and filters words", async ({ page }) => {
  await page.goto("/dictionary", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("dictionary-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "我的词书" })).toBeVisible();
  await expect(page.getByText("中考核心 1600 · 1284 已掌握")).toBeVisible();
  await expect(page.getByText("词书进度")).toBeVisible();
  await expect(page.getByText("新概念二册")).toBeVisible();
  await expect(page.getByRole("button", { name: "persist 坚持" })).toBeVisible();

  const search = page.getByPlaceholder("搜索单词 / 中文释义");
  await search.fill("环境");
  await expect(search).toHaveValue("环境");
  await expect(page.getByRole("button", { name: "environment 环境" })).toBeVisible();
  await expect(page.getByRole("button", { name: "persist 坚持" })).toBeHidden();
});

test("Gate 24 web dictionary opens word detail and dashboard entry routes in", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("dashboard-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "我的词书" }).click({ force: true });
  await expect(page).toHaveURL(/\/dictionary$/, { timeout: 10_000 });
  await expect(page.getByTestId("dictionary-ready")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByRole("heading", { name: "我的词书" })).toBeVisible();

  await page.getByRole("button", { name: "achieve 实现" }).click({ force: true });
  await expect(page).toHaveURL(/\/word\/w3$/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "achieve" })).toBeVisible();
});
