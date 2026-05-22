import { expect, test, type Page } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

async function gotoStoryReady(page: Page) {
  const storyResponse = page
    .waitForResponse((response) => response.url().includes("/api/v1/ai/story/today"), { timeout: 15_000 })
    .catch(() => null);

  await page.goto("/story", { waitUntil: "domcontentloaded" });
  await storyResponse;
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/EPISODE \d+ ·/)).toBeVisible();
}

test("Gate 20 web story renders desktop reading workspace and word popover", async ({ page }) => {
  await gotoStoryReady(page);

  await expect(page.getByRole("heading", { name: "阅读助手" })).toBeVisible();
  await expect(page.getByText("今日复习词")).toBeVisible();
  await expect(page.getByText("阅读策略")).toBeVisible();

  await page.getByRole("button", { name: /ambition|ambitious/i }).first().click();
  await expect(page.getByRole("dialog", { name: "ambition 单词卡" })).toBeVisible();
  await page.getByRole("button", { name: "知道了" }).click({ force: true });
  await expect(page.getByRole("dialog", { name: "ambition 单词卡" })).toHaveCount(0);
});

test("Gate 20 web story routes topbar and desktop player actions", async ({ page }) => {
  await gotoStoryReady(page);

  await page.getByRole("button", { name: "播放故事 Web" }).click();
  await expect(page.getByRole("button", { name: "暂停故事 Web" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "桌面故事播放进度" })).toHaveAttribute("aria-valuenow", /^(?:[1-9]\d?|100)$/);

  await page.getByRole("button", { name: /^A / }).click({ force: true });
  await expect(page.getByText("理解正确")).toBeVisible();

  await page.getByRole("button", { name: "返回今日学习" }).click({ force: true });
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10_000 });
});
