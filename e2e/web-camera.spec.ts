import { expect, test } from "./fixtures";

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test("Gate 22 web camera shows the OCR coming-soon state", async ({ page }) => {
  await page.goto("/camera", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("camera-coming-soon")).toBeVisible();
  await expect(page.getByTestId("camera-coming-soon").getByText("敬请期待")).toBeVisible();
  await expect(page.getByRole("heading", { name: "拍照查词" })).toBeVisible();
  await expect(page.getByRole("link", { name: /返回首页/ })).toHaveAttribute("href", "/home");
  await expect(page.getByRole("button", { name: "拍照识别" })).toHaveCount(0);
});
