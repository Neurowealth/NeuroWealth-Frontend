import { expect, test } from "@playwright/test";

test.describe("Login flow", () => {
  test("login page renders sign-in form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByText(/connect your wallet/i)).toBeVisible();
  });

  test("demo credentials shortcut is visible", async ({ page }) => {
    await page.goto("/login");

    const demoLink = page.getByRole("button", { name: /fill demo credentials/i });
    await expect(demoLink).toBeVisible();
  });

  test("login page has proper data-qa attributes", async ({ page }) => {
    await page.goto("/login");

    const submitButton = page.locator('[data-qa="login-submit-button"]');
    await expect(submitButton).toBeVisible();
  });

  test("signin route redirects to login", async ({ page }) => {
    await page.goto("/signin");
    await expect(page).toHaveURL(/\/login/);
  });
});
