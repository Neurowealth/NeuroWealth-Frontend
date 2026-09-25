import { expect, test } from "@playwright/test";

test.describe("Wallet connect", () => {
  test("wallet connect button is visible on landing page", async ({ page }) => {
    await page.goto("/");

    // Check for wallet connect button
    const walletButton = page.locator('[data-qa="wallet-connect-button"]');
    await expect(walletButton).toBeVisible();
  });

  test("wallet connect button has correct data-qa attribute", async ({ page }) => {
    await page.goto("/");

    const walletButton = page.locator('[data-qa="wallet-connect-button"]');
    await expect(walletButton).toHaveAttribute("data-qa", "wallet-connect-button");
  });

  test("wallet connect button shows connect text when not connected", async ({ page }) => {
    await page.goto("/");

    const walletButton = page.locator('[data-qa="wallet-connect-button"]');
    await expect(walletButton).toContainText(/connect/i);
  });
});
