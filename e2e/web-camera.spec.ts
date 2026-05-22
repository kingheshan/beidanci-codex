import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 22 web camera renders desktop OCR workspace and returns to dashboard", async ({ page }) => {
  await page.goto("/camera", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("camera-ready")).toHaveAttribute("data-hydrated", "true");

  await expect(page.getByRole("heading", { name: "拍照查词工作台" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "拍照 / 上传查词" })).toBeVisible();
  await expect(page.getByText("点击上传或拖入图片", { exact: true })).toBeVisible();
  await expect(page.getByText("OCR 工作流")).toBeVisible();
  await expect(page.getByText("自动识别", { exact: true })).toBeVisible();
  await expect(page.getByText("AI 圈生词", { exact: true })).toBeVisible();
  await expect(page.getByText("一键加入", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "返回今日学习" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("Gate 22 web camera uploads, reviews OCR words, and adds selected words", async ({ page }) => {
  await page.goto("/camera", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("camera-ready")).toHaveAttribute("data-hydrated", "true");

  await page.getByRole("button", { name: "上传并识别" }).click();
  await expect(page.getByText("AI 识别中...").or(page.getByRole("heading", { name: "桌面识别结果" }))).toBeVisible();
  await expect(page.getByRole("heading", { name: "桌面识别结果" })).toBeVisible({ timeout: 3000 });
  await expect(page.getByRole("heading", { name: "Web OCR 文档预览" })).toBeVisible();
  await expect(page.getByText("识别词汇 · 已选 4")).toBeVisible();
  await expect(page.getByRole("heading", { name: "OCR 质量" })).toBeVisible();

  await page.getByRole("button", { name: /perseverance/ }).click();
  await expect(page.getByText("识别词汇 · 已选 3")).toBeVisible();
  await page.getByRole("button", { name: "加入复习计划（3 个）" }).click();

  await expect(page.getByText("已添加 3 个词到复习计划")).toBeVisible();
  await expect(page).toHaveURL(/\/review$/);
});
