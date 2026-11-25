import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light", reducedMotion: "no-preference" });

test("theme toggle applies Tailwind dark variants and config utilities are available", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Switch to dark mode" });
  await expect(toggle).toBeVisible();

  await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.id = "tailwind-theme-probe";
    probe.className = "bg-black dark:bg-white font-body-medium animate-fade-in";
    document.body.append(probe);
  });

  const probe = page.locator("#tailwind-theme-probe");
  await expect(probe).toHaveCSS("background-color", "rgb(0, 0, 0)");

  await toggle.click();
  await expect(probe).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(probe).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(probe).toHaveCSS("font-weight", "500");
  await expect(probe).toHaveCSS("animation-name", "fadeIn");
});
