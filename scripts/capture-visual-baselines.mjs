import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const DATE_STAMP = process.env.VISUAL_BASELINE_DATE ?? "2026-03-28";
const OUTPUT_DIR = path.resolve(
  process.cwd(),
  "docs",
  "qa",
  "baselines",
  DATE_STAMP,
);

// ─── Demo seed ────────────────────────────────────────────────────────────────
// NEXT_PUBLIC_DEMO_SEED must be set in the environment of the *server* process
// that is already running (yarn dev / yarn start) before this script is called.
// The browser-side RNG is initialised from the inlined env var at build time,
// so the value baked into the running server is what matters here.
//
// Recommended workflow:
//   NEXT_PUBLIC_DEMO_SEED=demo-seed-2026 yarn dev
//   yarn qa:visual-baseline
//
// The seed value is written into the manifest so baselines are traceable.
const DEMO_SEED = process.env.NEXT_PUBLIC_DEMO_SEED ?? "";

const DESKTOP_VIEWPORT = {
  name: "desktop-1440x900",
  options: {
    viewport: {
      width: 1440,
      height: 900,
    },
    isMobile: false,
    hasTouch: false,
  },
};

const MOBILE_VIEWPORT = {
  name: "mobile-390x844",
  options: {
    ...devices["iPhone 13"],
    viewport: {
      width: 390,
      height: 844,
    },
    colorScheme: "dark",
    locale: "en-US",
  },
};

// Tailwind sm: breakpoint — triggers text-5xl on the hero headline
const SM_VIEWPORT = {
  name: "sm-640x900",
  options: {
    viewport: { width: 640, height: 900 },
    isMobile: false,
    hasTouch: false,
    colorScheme: "dark",
    locale: "en-US",
  },
};

// Tailwind md: breakpoint — triggers text-6xl on the hero headline
const MD_VIEWPORT = {
  name: "md-768x1024",
  options: {
    viewport: { width: 768, height: 1024 },
    isMobile: false,
    hasTouch: false,
    colorScheme: "dark",
    locale: "en-US",
  },
};

// Tailwind lg: breakpoint — wide tablet / small desktop
const LG_VIEWPORT = {
  name: "lg-1024x768",
  options: {
    viewport: { width: 1024, height: 768 },
    isMobile: false,
    hasTouch: false,
    colorScheme: "dark",
    locale: "en-US",
  },
};

// All breakpoints relevant to landing hero responsive styles
const LANDING_VIEWPORTS = [
  MOBILE_VIEWPORT,
  SM_VIEWPORT,
  MD_VIEWPORT,
  LG_VIEWPORT,
  DESKTOP_VIEWPORT,
];

// Landing-hero-specific scenarios targeting src/features/landing/**
const LANDING_SCENARIOS = [
  {
    page: "landing-hero",
    state: "above-fold",
    path: "/",
    waitForText: "AI-Powered",
  },
  {
    page: "landing-hero",
    state: "stats-visible",
    path: "/",
    waitForText: "AI-Powered",
    action: async (page) => {
      // Scroll to the stats row inside the hero section
      await page.evaluate(() => {
        const stats = document.querySelector(".grid.grid-cols-3");
        if (stats) stats.scrollIntoView({ behavior: "instant" });
      });
      await page.waitForTimeout(300);
    },
  },
  {
    page: "landing-hero",
    state: "wallet-error",
    path: "/",
    waitForText: "AI-Powered",
    action: async (page) => {
      // Trigger the Connect Wallet button without Freighter installed so the
      // error message renders — confirms the error state is visually correct.
      const btn = page.getByRole("button", { name: /connect wallet/i });
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(800);
      }
    },
  },
];

const AUTH_SESSION = {
  user: {
    id: "u1",
    email: "qa@neurowealth.app",
    name: "Visual QA",
  },
  token: "mock-jwt-token-visual-baseline",
};

const DEFAULT_PROFILE = {
  displayName: "Visual QA",
  locale: "en-US",
  timezone: "UTC",
  currencyFormat: "USD",
};

const DEFAULT_PREFERENCES = {
  locale: "en-US",
  timezone: "UTC",
  currencyFormat: "USD",
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  emailNotifications: true,
  transactionAlerts: true,
  marketingUpdates: false,
  securityAlerts: true,
  weeklyDigest: true,
};

function buildStorageState(overrides = {}) {
  const state = {
    "neurowealth_profile": JSON.stringify(DEFAULT_PROFILE),
    "nw_preferences": JSON.stringify(DEFAULT_PREFERENCES),
    "nw_notifications": JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS),
    ...overrides,
  };

  return state;
}

const scenarios = [
  {
    page: "home",
    state: "default",
    path: "/",
    waitForText: "AI-Powered",
  },
  {
    page: "signin",
    state: "default",
    path: "/signin",
    waitForText: "Welcome Back",
  },
  {
    page: "signin",
    state: "invalid",
    path: "/signin",
    waitForText: "Welcome Back",
    action: async (page) => {
      await page.getByLabel("Email Address").fill("qa@neurowealth.app");
      await page.getByLabel("Password").fill("wrong-password");
      await page.locator('form button[type="submit"]').click();
      await page.getByText("Invalid Credentials").waitFor({ timeout: 5000 });
    },
  },
  {
    page: "signup",
    state: "default",
    path: "/signup",
    waitForText: "Create Account",
  },
  {
    page: "signup",
    state: "validation",
    path: "/signup",
    waitForText: "Create Account",
    action: async (page) => {
      await page.locator('form button[type="submit"]').click();
      await page.getByText(/Please fix \d+ error/i).waitFor({ timeout: 5000 });
    },
  },
  {
    page: "onboarding",
    state: "start",
    path: "/onboarding",
    waitForText: "Connect your wallet",
  },
  {
    page: "onboarding",
    state: "completed",
    path: "/onboarding",
    waitForText: "Onboarding Already Completed",
    localStorage: buildStorageState({
      "onboarding-state": JSON.stringify({
        completed: true,
        lastStep: 2,
        timestamp: 1711584000000,
      }),
    }),
  },
  {
    page: "dashboard",
    state: "default",
    path: "/dashboard",
    requiresAuth: true,
    waitForText: "Total balance",
  },
  {
    page: "transactions",
    state: "deposit-interactive",
    path: "/dashboard/transactions",
    requiresAuth: true,
    waitForText: "Deposit and withdrawal flow",
  },
  {
    page: "transactions",
    state: "deposit-confirm",
    path: "/dashboard/transactions",
    requiresAuth: true,
    waitForText: "Deposit and withdrawal flow",
    action: async (page) => {
      await page.getByRole("button", { name: /^confirm$/i }).click();
      await page.getByText("Review fees").waitFor({ timeout: 5000 }).catch(() => Promise.resolve());
    },
  },
  {
    page: "transactions",
    state: "deposit-pending",
    path: "/dashboard/transactions",
    requiresAuth: true,
    waitForText: "Deposit and withdrawal flow",
    action: async (page) => {
      await page.getByRole("button", { name: /^pending$/i }).click();
    },
  },
  {
    page: "transactions",
    state: "deposit-success",
    path: "/dashboard/transactions",
    requiresAuth: true,
    waitForText: "Deposit and withdrawal flow",
    action: async (page) => {
      await page.getByRole("button", { name: /^success$/i }).click();
    },
  },
  {
    page: "transactions",
    state: "withdrawal-failure",
    path: "/dashboard/transactions",
    requiresAuth: true,
    waitForText: "Deposit and withdrawal flow",
    action: async (page) => {
      await page.getByRole("button", { name: /^Withdraw$/i }).click();
      await page.getByRole("button", { name: /^failure$/i }).click();
    },
  },
  {
    page: "history",
    state: "empty",
    path: "/dashboard/history",
    requiresAuth: true,
    waitForText: "No transaction history",
  },
  {
    page: "history",
    state: "data",
    path: "/dashboard/history",
    requiresAuth: true,
    waitForText: "History",
    action: async (page) => {
      await page.getByRole("button", { name: /Mock: show data/i }).click();
      await page.getByText("Transaction history content goes here.").waitFor({ timeout: 5000 });
    },
  },
  {
    page: "notifications",
    state: "empty",
    path: "/dashboard/notifications",
    requiresAuth: true,
    waitForText: "All caught up",
  },
  {
    page: "notifications",
    state: "data",
    path: "/dashboard/notifications",
    requiresAuth: true,
    waitForText: "Notifications",
    action: async (page) => {
      await page.getByRole("button", { name: /Mock: show data/i }).click();
      await page.getByText("Notifications content goes here.").waitFor({ timeout: 5000 });
    },
  },
  {
    page: "audit",
    state: "default",
    path: "/dashboard/audit",
    requiresAuth: true,
    waitForText: "Account Audit Trail",
  },
  {
    page: "settings",
    state: "default",
    path: "/settings",
    localStorage: buildStorageState({
      "onboarding-state": JSON.stringify({
        completed: true,
        lastStep: 2,
        timestamp: 1711584000000,
      }),
    }),
    waitForText: "Manage your account settings and preferences.",
  },
  {
    page: "settings-preferences",
    state: "default",
    path: "/dashboard/settings/preferences",
    requiresAuth: true,
    waitForText: "Manage language, timezone, and currency settings",
  },
  {
    page: "settings-security",
    state: "default",
    path: "/dashboard/settings/security",
    requiresAuth: true,
    waitForText: "Manage your account security and authentication",
  },
  {
    page: "settings-notifications",
    state: "default",
    path: "/dashboard/settings/notifications",
    requiresAuth: true,
    waitForText: "Manage how and when you receive notifications",
  },
  {
    page: "profile",
    state: "default",
    path: "/profile",
    localStorage: buildStorageState({
      "neurowealth_profile": JSON.stringify({
        displayName: "Visual QA",
        locale: "en-US",
        timezone: "UTC",
        currencyFormat: "USD",
      }),
    }),
    waitForText: "Visual QA",
  },
  {
    page: "forbidden",
    state: "default",
    path: "/forbidden",
    waitForText: "Access denied",
  },
  {
    page: "unauthorized",
    state: "default",
    path: "/unauthorized",
    waitForText: "Authentication required",
  },
  {
    page: "tokens-docs",
    state: "default",
    path: "/docs/tokens",
    waitForText: "Design Tokens",
  },
];

function buildFileName(viewportName, pageName, stateName) {
  return `${DATE_STAMP}__${viewportName}__${pageName}__${stateName}.png`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function injectStorage(page, storageState) {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      window.localStorage.setItem(key, value);
    }
  }, storageState);
}

async function stabilizePage(page, scenario) {
  await page.goto(`${BASE_URL}${scenario.path}`, {
    waitUntil: "domcontentloaded",
  });

  if (scenario.waitForText) {
    await page.getByText(scenario.waitForText, { exact: false }).first().waitFor({
      timeout: 10000,
    });
  }

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
      caret-color: transparent !important;
    `,
  });

  await page.waitForTimeout(1200);

  if (scenario.action) {
    await scenario.action(page);
    await page.waitForTimeout(1200);
  }
}

async function captureScenario(browser, viewport, scenario) {
  const storageState = buildStorageState(
    scenario.requiresAuth
      ? {
          "nw_auth_session": JSON.stringify(AUTH_SESSION),
        }
      : {},
  );

  const mergedStorage = {
    ...storageState,
    ...(scenario.localStorage ?? {}),
  };

  const context = await browser.newContext({
    ...viewport.options,
    colorScheme: "dark",
    locale: "en-US",
  });
  const page = await context.newPage();

  await injectStorage(page, mergedStorage);
  await stabilizePage(page, scenario);

  const fileName = buildFileName(viewport.name, scenario.page, scenario.state);
  const outputPath = path.join(OUTPUT_DIR, fileName);

  await page.screenshot({
    path: outputPath,
    fullPage: true,
  });

  await context.close();

  return {
    file: outputPath,
    relativeFile: path.relative(process.cwd(), outputPath),
    route: scenario.path,
    page: scenario.page,
    state: scenario.state,
    viewport: viewport.name,
  };
}

async function main() {
  await ensureDir(OUTPUT_DIR);

  if (!DEMO_SEED) {
    console.warn(
      "⚠  NEXT_PUBLIC_DEMO_SEED is not set. Mock chart data will be random " +
      "and baselines may differ between runs.\n" +
      "   Recommended: NEXT_PUBLIC_DEMO_SEED=demo-seed-2026 yarn dev, then re-run this script.",
    );
  } else {
    console.log(`ℹ  Demo seed: "${DEMO_SEED}" — mock data will be deterministic.`);
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const manifest = [];

  try {
    for (const scenario of scenarios) {
      for (const viewport of [DESKTOP_VIEWPORT, MOBILE_VIEWPORT]) {
        const result = await captureScenario(browser, viewport, scenario);
        manifest.push(result);
        console.log(`captured ${result.relativeFile}`);
      }
    }

    // Landing hero — capture at every Tailwind breakpoint so responsive
    // styles (text-4xl / sm:text-5xl / md:text-6xl) are all exercised.
    for (const scenario of LANDING_SCENARIOS) {
      for (const viewport of LANDING_VIEWPORTS) {
        const result = await captureScenario(browser, viewport, scenario);
        manifest.push(result);
        console.log(`captured ${result.relativeFile}`);
      }
    }
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        demoSeed: DEMO_SEED || null,
        namingConvention:
          "<date>__<viewport>__<page>__<state>.png",
        scenarioCount: scenarios.length,
        screenshotCount: manifest.length,
        screenshots: manifest,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(`manifest written to ${path.relative(process.cwd(), manifestPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});