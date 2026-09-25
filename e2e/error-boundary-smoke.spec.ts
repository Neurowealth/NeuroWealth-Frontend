import { expect, test } from "@playwright/test";

test.describe("Dashboard error boundaries", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /fill demo credentials/i }).click();
    await page.locator('[data-qa="login-submit-button"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test("route-level dashboard errors show the dashboard error page", async ({ page }) => {
    await page.goto("/dashboard/dev-errors/route-error");

    await expect(page.getByRole("heading", { name: /dashboard unavailable/i })).toBeVisible();
    await expect(page.getByText(/Your funds and wallet connection remain safe/i)).toBeVisible();
  });

  test("client boundary fallback renders after an intentional component crash", async ({ page }) => {
    await page.goto("/dashboard/dev-errors/boundary-error");

    await page.getByRole("button", { name: /trigger client error/i }).click();
    await expect(page.getByRole("heading", { name: /dashboard unavailable/i })).toBeVisible();
    await expect(page.getByText(/Your funds and wallet connection remain safe/i)).toBeVisible();
  });
});
