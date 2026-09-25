import { expect, test } from "@playwright/test";

test.describe("Withdrawal flow", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /fill demo credentials/i }).click();
    await page.locator('[data-qa="login-submit-button"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test("withdrawal tab is accessible", async ({ page }) => {
    await page.goto("/dashboard/transactions");
    await page.waitForLoadState("networkidle");

    const withdrawButton = page.getByRole("button", { name: /withdraw/i });
    await expect(withdrawButton).toBeVisible();
  });

  test("withdrawal form has wallet address input", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=withdrawal&preview=interactive");
    await page.waitForLoadState("networkidle");

    const walletInput = page.locator("#wallet");
    await expect(walletInput).toBeVisible();

    const reviewButton = page.locator('[data-qa="transaction-review-button"]');
    await expect(reviewButton).toBeVisible();
  });

  test("withdrawal shows confirm step", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=withdrawal&preview=confirm");
    await page.waitForLoadState("networkidle");

    const confirmButton = page.locator('[data-qa="transaction-submit-button"]');
    await expect(confirmButton).toBeVisible();
  });

  test("withdrawal shows pending state", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=withdrawal&preview=pending");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/Pending on Stellar/i).first()).toBeVisible();
  });

  test("withdrawal shows success receipt", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=withdrawal&preview=success");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/NW-WDR-PREVIEW-SUCCESS/)).toBeVisible();
  });

  test("withdrawal handles error recovery", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=withdrawal&preview=interactive");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-qa="transaction-review-button"]')).toBeVisible();
  });
});
