import { expect, test } from "@playwright/test";

test.describe("Strategy update", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /fill demo credentials/i }).click();
    await page.locator('[data-qa="login-submit-button"]').click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test("strategy page renders all strategy options", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    const count = await page.getByRole("article").count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("strategy page shows heading and description", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: /Choose your strategy/i })).toBeVisible();
    await expect(page.getByText(/choose/i)).toBeVisible();
  });

  test("strategy page has section for investment strategies", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    const section = page.getByRole("region", { name: /Choose your strategy/i });
    await expect(section).toBeVisible();
  });

  test("strategy page shows active strategy indicator", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    // Wait for the real cards (not the loading skeleton) before checking
    // selection state — isVisible() doesn't auto-wait, so checking too early
    // would always see no "Select Balanced" button and skip the click.
    await expect(page.getByRole("article")).toHaveCount(3);

    const selectBalanced = page.getByRole("button", { name: "Select Balanced" });
    if (await selectBalanced.isVisible()) {
      await selectBalanced.click();
      const [putResponse] = await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes("/api/strategy") && res.request().method() === "PUT",
        ),
        page.getByRole("button", { name: "Confirm" }).click(),
      ]);
      // TEMP DIAGNOSTIC: surface the PUT response in CI logs to root-cause
      // why the confirm modal doesn't close. Remove once resolved.
      console.log(`[diag] PUT /api/strategy -> ${putResponse.status()} ${await putResponse.text()}`);
      // Wait for the confirmation modal to close (save completed) rather
      // than just network idle, which can resolve before the UI updates.
      await expect(page.getByRole("dialog")).toBeHidden();
    }

    const activeCheck = page.getByText("Current");
    await expect(activeCheck).toBeVisible();
  });

  test("strategy cards display APY and risk level", async ({ page }) => {
    await page.goto("/dashboard/strategy");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(/APY/i).first()).toBeVisible();
    await expect(page.getByText(/risk/i).first()).toBeVisible();
  });
});
