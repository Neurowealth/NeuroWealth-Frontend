import { expect, test } from "@playwright/test";

test.describe("Strategy update", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /fill demo credentials/i }).click();
    await page.locator('[data-qa="login-submit-button"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test("strategy page renders all strategy options", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    const count = await page.getByRole("article").count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("strategy page shows heading and description", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /Choose your strategy/i })).toBeVisible();
    await expect(page.getByText(/choose/i)).toBeVisible();
  });

  test("strategy page has section for investment strategies", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    const section = page.getByRole("region", { name: /Choose your strategy/i });
    await expect(section).toBeVisible();
  });

  test("strategy page shows active strategy indicator", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    const selectBalanced = page.getByRole("button", { name: "Select Balanced" });
    if (await selectBalanced.isVisible()) {
      await selectBalanced.click();
      await page.getByRole("button", { name: "Confirm" }).click();
      await page.waitForLoadState("networkidle");
    }

    const activeCheck = page.getByText("Current");
    await expect(activeCheck).toBeVisible();
  });

  test("strategy cards display APY and risk level", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/APY/i).first()).toBeVisible();
    await expect(page.getByText(/risk/i).first()).toBeVisible();
  });
});
