/**
 * playwright.config.ts
 *
 * OWNERSHIP: Visual tests are LOCAL-ONLY for baseline capture.
 * CI runs screenshot comparison on PRs against committed baselines.
 *
 * Local prerequisites:
 *   1. yarn playwright install --with-deps chromium
 *   2. yarn dev  (server must be running on port 3000)
 *   3. yarn qa:visual-baseline   ← captures baselines into __visual-baselines__/
 *
 * CI behavior (set by PLAYWRIGHT_CI=true env var):
 *   - Runs yarn build + yarn start before tests
 *   - Compares screenshots against committed baselines
 *   - Uploads failure artifacts (see frontend-ci.yml)
 */

import { defineConfig, devices } from "@playwright/test";

const isCI = process.env.CI === "true" || process.env.PLAYWRIGHT_CI === "true";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  /* Baseline capture script lives in scripts/ and is separate from test runner */
  snapshotDir: "./__visual-baselines__",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}{ext}",

  fullyParallel: true,
  forbidOnly: isCI, // fail CI if .only is accidentally committed
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,

  reporter: isCI
    ? [
        ["github"],
        ["html", { outputFolder: "playwright-report", open: "never" }],
      ]
    : [["list"]],

  use: {
    baseURL,
    trace: isCI ? "on-first-retry" : "off",
    screenshot: isCI ? "only-on-failure" : "off",
    video: "off",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* In CI, start the production server before running tests.
   * next.config.mjs sets `output: "standalone"`, under which `next start`
   * (yarn start) doesn't serve the app correctly — Next.js itself warns
   * "next start does not work with output: standalone" and recommends
   * running the generated server.js directly. public/ and .next/static
   * aren't included in the standalone output automatically, so they're
   * copied in first, mirroring what the Dockerfile does for production. */
  ...(isCI && {
    webServer: {
      command:
        "mkdir -p .next/standalone/public .next/standalone/.next/static && " +
        "cp -r public/. .next/standalone/public/ && " +
        "cp -r .next/static/. .next/standalone/.next/static/ && " +
        "node .next/standalone/server.js",
      url: baseURL,
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        NEXT_PUBLIC_WEBHOOK_URL: "http://localhost:2000",
        NEXT_PUBLIC_API_URL: "http://localhost:3001",
        NEXT_PUBLIC_E2E_TESTING: "true",
      },
    },
  }),
});
