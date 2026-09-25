import { expect, test } from "@playwright/test";

test.describe("Dashboard error boundaries", () => {
  test("route-level dashboard errors show the dashboard error page", async ({ page }) => {
    await page.goto("/dashboard/dev-errors/route-error");

    await expect(page.getByRole("heading", { name: /dashboard unavailable/i })).toBeVisible();
    await expect(page.getByText(/Your funds and wallet connection remain safe/i)).toBeVisible();
  });

  test("client boundary fallback renders after an intentional component crash", async ({ page }) => {
    await page.goto("/dashboard/dev-errors/boundary-error");

    await page.getByRole("button", { name: /trigger client error/i }).click();
    await expect(page.getByRole("heading", { name: /we hit a temporary app issue/i })).toBeVisible();
    await expect(page.getByText(/Try reloading this view/i)).toBeVisible();
  });

  test("global error boundary fallback renders on provider-level initialization failure", async ({ page }) => {
    await page.goto("/dashboard/dev-errors/global-error");

    await expect(page.getByRole("heading", { name: /(application error|we ran into an unexpected issue)/i })).toBeVisible();
    await expect(page.getByText(/Your (account and )?funds remain safe/i)).toBeVisible();
  });
});
