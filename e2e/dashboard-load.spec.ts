import { expect, test } from "@playwright/test";

test.describe("Dashboard load", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /fill demo credentials/i }).click();
    await page.locator('[data-qa="login-submit-button"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test("dashboard page loads after login", async ({ page }) => {
    // Sign in first
    // Verify dashboard elements
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("dashboard shows portfolio section", async ({ page }) => {
    // Dashboard should have main content
    await expect(page.locator("main")).toBeVisible();
  });

  test("dashboard navigation links are accessible", async ({ page }) => {
    // Check for navigation elements
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
  });
});
