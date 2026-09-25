import { expect, test } from "@playwright/test";

/**
 * RTL layout smoke test — covers locale-switching infrastructure today
 * and documents RTL requirements for future right-to-left locales (Arabic,
 * Hebrew, etc.).
 *
 * Run: `yarn dev` then `yarn playwright test e2e/rtl-layout-smoke.spec.ts`
 *
 * RTL implementation checklist (for when an RTL locale is added):
 *  1. Add the locale to `AppLocale` in `src/lib/i18n/messages.ts`
 *  2. Add its Intl tag to `localeToIntl`
 *  3. In `I18nContext.tsx`, set `document.documentElement.dir` based on locale
 *     e.g. RTL_LOCALES.has(locale) ? "rtl" : "ltr"
 *  4. Ensure Tailwind's `dir` variant or `[dir="rtl"]` overrides are in place
 *  5. Un-fixme the tests below and add the new locale to LocaleSwitcher
 */

test.describe("Locale switching and RTL layout readiness", () => {
  test("default locale sets html[lang] to en-US", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  });

  test("switching to French updates html[lang] to fr-FR", async ({ page }) => {
    await page.goto("/");
    await page.selectOption("#locale-switcher", "fr");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr-FR");
  });

  test("switching back to English restores html[lang] to en-US", async ({ page }) => {
    await page.goto("/");
    await page.selectOption("#locale-switcher", "fr");
    await page.selectOption("#locale-switcher", "en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  });

  test("LTR locales do not set html[dir] to rtl", async ({ page }) => {
    await page.goto("/");
    const dir = await page.locator("html").getAttribute("dir");
    expect(dir === null || dir === "ltr").toBeTruthy();

    await page.selectOption("#locale-switcher", "fr");
    const dirFr = await page.locator("html").getAttribute("dir");
    expect(dirFr === null || dirFr === "ltr").toBeTruthy();
  });

  // ── RTL stubs ────────────────────────────────────────────────────────────
  // These tests are skipped until an RTL locale (Arabic, Hebrew, …) is added.
  // Un-fixme them and adjust the locale value when that work lands.

  test.fixme(
    "RTL locale sets html[dir] to rtl",
    async ({ page }) => {
      await page.goto("/");
      // Replace "ar" with the value used in LocaleSwitcher once Arabic is added.
      await page.selectOption("#locale-switcher", "ar");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    },
  );

  test.fixme(
    "RTL locale sets html[lang] to the correct BCP-47 tag",
    async ({ page }) => {
      await page.goto("/");
      await page.selectOption("#locale-switcher", "ar");
      // Adjust the expected lang tag to match the localeToIntl entry (e.g. "ar-SA").
      await expect(page.locator("html")).toHaveAttribute("lang", "ar-SA");
    },
  );

  test.fixme(
    "dashboard main landmark is visible and not clipped under RTL",
    async ({ page }) => {
      await page.goto("/dashboard");
      await page.selectOption("#locale-switcher", "ar");
      // The primary content region must remain fully in the viewport.
      const main = page.locator("main#main-content");
      await expect(main).toBeVisible();
      const box = await main.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
    },
  );

  test.fixme(
    "RTL locale does not cause horizontal overflow on the home page",
    async ({ page }) => {
      await page.goto("/");
      await page.selectOption("#locale-switcher", "ar");
      const body = page.locator("body");
      const bodyWidth = await body.evaluate((el) => el.scrollWidth);
      const viewportWidth = page.viewportSize()!.width;
      // Allow a 2 px tolerance for sub-pixel rounding.
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 2);
    },
  );
});
