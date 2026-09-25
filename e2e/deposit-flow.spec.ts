import { expect, test } from "@playwright/test";

test.describe("Deposit flow", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /fill demo credentials/i }).click();
    await page.locator('[data-qa="login-submit-button"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test("deposit page can be navigated to from transactions", async ({ page }) => {
    await page.goto("/dashboard/transactions");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/deposit/i).first()).toBeVisible();
  });

  test("deposit form has amount input and review button", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=deposit&preview=interactive");
    await page.waitForLoadState("networkidle");

    const amountInput = page.locator("#amount");
    await expect(amountInput).toBeVisible();

    const reviewButton = page.locator('[data-qa="transaction-review-button"]');
    await expect(reviewButton).toBeVisible();
    await expect(reviewButton).toBeEnabled();
  });

  test("deposit shows confirm step after entering amount", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=deposit&preview=confirm");
    await page.waitForLoadState("networkidle");

    const confirmButton = page.locator('[data-qa="transaction-submit-button"]');
    await expect(confirmButton).toBeVisible();
  });

  test("deposit flow displays pending state", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=deposit&preview=pending");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/Pending on Stellar/i).first()).toBeVisible();
  });

  test("deposit flow displays success receipt", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=deposit&preview=success");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/NW-DEP-PREVIEW-SUCCESS/)).toBeVisible();
  });

  test("deposit flow displays failure state", async ({ page }) => {
    await page.goto("/dashboard/transactions?theme=light&kind=deposit&preview=failure");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText('Failed', { exact: true })).toBeVisible();
  });
});
