import { test, expect } from '@playwright/test';

test.describe('Transaction Flows', () => {
    test.beforeEach(async ({ page }) => {
        // Sign in before each test
        await page.goto('/signin');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should complete deposit flow', async ({ page }) => {
        // Navigate to deposit
        await page.goto('/dashboard/transactions?kind=deposit');

        // Wait for form to load
        await page.waitForSelector('input[name="amount"]');

        // Fill in amount
        await page.fill('input[name="amount"]', '100');

        // Click review button
        await page.click('button:has-text("Review deposit")');

        // Should show confirmation
        await expect(page.locator('text=Confirm deposit')).toBeVisible();

        // Confirm transaction
        await page.click('button:has-text("Confirm deposit")');

        // Should show pending state
        await expect(page.locator('text=Pending')).toBeVisible();

        // Wait for completion
        await page.waitForTimeout(2000);

        // Should show success
        await expect(page.locator('text=confirmed')).toBeVisible();
    });

    test('should complete withdrawal flow', async ({ page }) => {
        // Navigate to withdrawal
        await page.goto('/dashboard/transactions?kind=withdrawal');

        // Wait for form to load
        await page.waitForSelector('input[name="amount"]');

        // Fill in amount
        await page.fill('input[name="amount"]', '100');

        // Fill in destination wallet
        const walletInput = page.locator('input[name="walletAddress"]');
        await walletInput.fill('GCFXJ4K7R2UTJHI4B74ZLGIBSAWZSA3O76UR3X5IYK6YG33BZINM2F3B');

        // Click review button
        await page.click('button:has-text("Review withdrawal")');

        // Should show confirmation
        await expect(page.locator('text=Confirm withdrawal')).toBeVisible();

        // Confirm transaction
        await page.click('button:has-text("Confirm withdrawal")');

        // Should show pending state
        await expect(page.locator('text=Pending')).toBeVisible();

        // Wait for completion
        await page.waitForTimeout(2000);

        // Should show success
        await expect(page.locator('text=confirmed')).toBeVisible();
    });

    test('should validate deposit amount', async ({ page }) => {
        await page.goto('/dashboard/transactions?kind=deposit');

        // Wait for form to load
        await page.waitForSelector('input[name="amount"]');

        // Try to submit with empty amount
        await page.click('button:has-text("Review deposit")');

        // Should show error
        await expect(page.locator('text=Enter an amount')).toBeVisible();
    });

    test('should validate withdrawal address', async ({ page }) => {
        await page.goto('/dashboard/transactions?kind=withdrawal');

        // Wait for form to load
        await page.waitForSelector('input[name="amount"]');

        // Fill in amount
        await page.fill('input[name="amount"]', '100');

        // Fill in invalid address
        const walletInput = page.locator('input[name="walletAddress"]');
        await walletInput.fill('INVALID_ADDRESS');

        // Try to submit
        await page.click('button:has-text("Review withdrawal")');

        // Should show error
        await expect(page.locator('text=valid Stellar')).toBeVisible();
    });

    test('should reject amount above available', async ({ page }) => {
        await page.goto('/dashboard/transactions?kind=deposit');

        // Wait for form to load
        await page.waitForSelector('input[name="amount"]');

        // Try to submit with amount above available
        await page.fill('input[name="amount"]', '99999');

        // Try to submit
        await page.click('button:has-text("Review deposit")');

        // Should show error
        await expect(page.locator('text=available')).toBeVisible();
    });
});
