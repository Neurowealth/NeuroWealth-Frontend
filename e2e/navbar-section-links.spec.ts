import { expect, test } from "@playwright/test";

const landingLinks = [
  { name: "Features", section: "features" },
  { name: "How it works", section: "how-it-works" },
  { name: "Strategies", section: "strategies" },
];

test.describe("Navbar landing links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login?from=%2Fdashboard%2Faudit");
    await page.getByRole("button", { name: /fill demo credentials/i }).click();
    await page.locator('[data-qa="login-submit-button"]').click();
    await page.waitForURL("**/dashboard/audit");
  });

  for (const { name, section } of landingLinks) {
    test(`${name} opens its home section from the dashboard`, async ({ page }) => {
      const navbar = page.getByRole("navigation", { name: "Main navigation" });
      await navbar.getByRole("link", { name, exact: true }).click();

      await expect(page).toHaveURL(`/#${section}`);
      await expect(
        page.locator(`section#${section}`).getByRole("heading", { level: 2 }),
      ).toBeInViewport();
    });
  }
});
