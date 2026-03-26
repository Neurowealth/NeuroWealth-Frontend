import { test, expect } from '@playwright/test';

test.describe('Portfolio Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Sign in before each test
        await page.goto('/signin');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should display portfolio dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for portfolio to load
        await page.waitForSelector('text=NeuroWealth overview');

        // Check for key sections
        await expect(page.locator('text=Total balance')).toBeVisible();
        await expect(page.locator('text=Total yield')).toBeVisible();
        await expect(page.locator('text=APY')).toBeVisible();
        await expect(page.locator('text=Strategy')).toBeVisible();
    });

    test('should display asset allocation', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for allocation section
        await page.waitForSelector('text=Asset allocation');

        // Check for allocation items
        await expect(page.locator('text=Blend USDC lending')).toBeVisible();
        await expect(page.locator('text=Stellar DEX LP')).toBeVisible();
    });

    test('should display recent activity', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for activity section
        await page.waitForSelector('text=Recent activity');

        // Check for activity items
        await expect(page.locator('text=Yield settled')).toBeVisible();
        await expect(page.locator('text=Deposit confirmed')).toBeVisible();
    });

    test('should toggle theme', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for theme controls
        await page.waitForSelector('button:has-text("Dark mode")');

        // Get initial theme
        const shell = page.locator('[data-theme]');
        const initialTheme = await shell.getAttribute('data-theme');

        // Click dark mode
        await page.click('button:has-text("Dark mode")');

        // Theme should change
        const newTheme = await shell.getAttribute('data-theme');
        expect(newTheme).toBe('dark');
    });

    test('should toggle scenario', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for scenario controls
        await page.waitForSelector('button:has-text("Empty states")');

        // Click empty states
        await page.click('button:has-text("Empty states")');

        // Should show empty state message
        await expect(page.locator('text=No allocation yet')).toBeVisible();

        // Click back to live
        await page.click('button:has-text("Live widgets")');

        // Should show allocation again
        await expect(page.locator('text=Blend USDC lending')).toBeVisible();
    });

    test('should display portfolio metrics', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for metrics to load
        await page.waitForSelector('text=Total balance');

        // Check that metrics have values
        const balanceCard = page.locator('text=Total balance').locator('..').locator('p').nth(1);
        const balanceText = await balanceCard.textContent();
        expect(balanceText).toMatch(/\$[\d,]+\.\d{2}/);
    });
});
