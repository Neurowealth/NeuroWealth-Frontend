import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should sign in user', async ({ page }) => {
        await page.goto('/signin');

        // Fill in credentials
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');

        // Submit form
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL('/dashboard');
    });

    test('should sign up user', async ({ page }) => {
        await page.goto('/signup');

        // Fill in credentials
        await page.fill('input[type="email"]', 'newuser@example.com');
        await page.fill('input[name="name"]', 'New User');
        await page.fill('input[type="password"]', 'password123');

        // Submit form
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL('/dashboard');
    });

    test('should protect dashboard route', async ({ page }) => {
        await page.goto('/dashboard');

        // Should redirect to signin if not authenticated
        await expect(page).toHaveURL(/\/signin/);
    });

    test('should sign out user', async ({ page }) => {
        // Sign in first
        await page.goto('/signin');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for dashboard
        await expect(page).toHaveURL('/dashboard');

        // Find and click sign out button
        const signOutButton = page.locator('button:has-text("Sign Out")');
        if (await signOutButton.isVisible()) {
            await signOutButton.click();
            await expect(page).toHaveURL('/');
        }
    });

    test('should persist session on page reload', async ({ page }) => {
        // Sign in
        await page.goto('/signin');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL('/dashboard');

        // Reload page
        await page.reload();

        // Should still be on dashboard (session persisted)
        await expect(page).toHaveURL('/dashboard');
    });
});
