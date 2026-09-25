import { test, expect } from "@playwright/test";

/**
 * QA for dashboard shell + marketing: one document landmark main, skip hash resolves.
 * Run: `yarn dev` then `yarn playwright test e2e/skip-link-landmarks.spec.ts`
 */
test.describe("Skip link and main landmark", () => {
  test("home has exactly one main and #main-content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("first skip link targets the primary main region", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("link", { name: /skip to main content/i });
    await expect(skip).toHaveAttribute("href", "#main-content");
  });

  test("docs tokens page exposes the same landmark id", async ({ page }) => {
    await page.goto("/docs/tokens");
    await expect(page.locator("main#main-content")).toHaveCount(1);
  });

  test("dashboard history has exactly one main", async ({ page }) => {
    await page.goto("/dashboard/history");
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
  });

  test("dashboard activity has exactly one main", async ({ page }) => {
    await page.goto("/dashboard/activity");
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
  });
});
