import { expect, test } from "./fixtures";

test("Gate 1 design system preview renders and switches theme", async ({ page }) => {
  await page.goto("/design-system");

  await expect(page).toHaveTitle("爱上背单词");
  await expect(page.getByText("Gate 1 Design System")).toBeVisible();
  await expect(page.getByRole("button", { name: "晨光橘" })).toBeVisible();

  await page.getByRole("button", { name: "晨光橘" }).click();

  await expect.poll(async () => {
    return page.locator("html").evaluate((node) => getComputedStyle(node).getPropertyValue("--c-bg").trim());
  }).toBe("#FFF6EE");
});
