/**
 * Typed environment variable access with fail-fast validation.
 *
 * Validates all required environment variables **eagerly** — if a required var
 * is missing the module throws at import time with a clear, actionable message.
 *
 * ── Variable reference ────────────────────────────────────────────────────────
 *
 * Public — embedded in the browser bundle (safe to expose):
 *   NEXT_PUBLIC_WEBHOOK_URL          WhatsApp / webhook receiver URL
 *   NEXT_PUBLIC_API_URL              Base URL for internal Next.js /api/* routes
 *   NEXT_PUBLIC_STELLAR_NETWORK      "mainnet" | "testnet"
 *   NEXT_PUBLIC_STELLAR_HORIZON_URL  Stellar Horizon endpoint for the SDK
 *   NEXT_PUBLIC_DEMO_SEED            Optional seed for deterministic mock data
 *   NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX  "true" to enable the sandbox route
 *
 * Server-only — never sent to the browser (set via .env.local or hosting secrets):
 *   NEUROWEALTH_API_BASE_URL         Real backend base URL
 *                                    (e.g. https://api.neurowealth.app)
 *                                    When unset the app falls back to demo data.
 *   NEUROWEALTH_API_AUTH_TOKEN       Bearer token for server→backend requests.
 *                                    Required whenever NEUROWEALTH_API_BASE_URL is set.
 *                                    Injected as: Authorization: Bearer <token>
 *   NEUROWEALTH_PORTFOLIO_PATH       Backend path for portfolio data
 *                                    (default: /portfolio/overview)
 *   NEUROWEALTH_TRANSACTIONS_PATH    Backend path for transaction submission
 *                                    (default: /transactions)
 *   NEUROWEALTH_STRATEGY_PATH        Backend path for strategy preference
 *                                    (default: /strategy/preference)
 *
 * ── Related docs ──────────────────────────────────────────────────────────────
 *
 *   NEUROWEALTH_API.md      Full HTTP contract — paths, auth headers, error envelope
 *   docs/env.md             Deployment notes and validation scripts
 *   docs/api-integration.md Endpoint schemas and integration checklist
 *   README.md               Mock vs real API mode overview for contributors
 */

interface EnvConfig {
  /** NEXT_PUBLIC_WEBHOOK_URL — WhatsApp webhook receiver URL. */
  webhookUrl: string;
  /** NEXT_PUBLIC_API_URL — Base URL for internal Next.js /api/* routes. */
  apiUrl: string;
  /** NEXT_PUBLIC_STELLAR_NETWORK — Resolved to "testnet" | "mainnet". */
  stellarNetwork: string;
  /** NEXT_PUBLIC_STELLAR_HORIZON_URL — Horizon endpoint. */
  stellarHorizonUrl: string;
  /** NEUROWEALTH_API_BASE_URL — Real backend base URL; empty string means demo mode. */
  neuroWealthApiBaseUrl: string;
  /** NEUROWEALTH_API_AUTH_TOKEN — Bearer token sent to the real backend. */
  neuroWealthApiAuthToken: string;
  /** NEUROWEALTH_PORTFOLIO_PATH — Backend path for portfolio data. */
  neuroWealthPortfolioPath: string;
  /** NEUROWEALTH_TRANSACTIONS_PATH — Backend path for transaction submission. */
  neuroWealthTransactionsPath: string;
  /** NEUROWEALTH_STRATEGY_PATH — Backend path for strategy preference reads/writes. */
  neuroWealthStrategyPath: string;
}


const VALID_STELLAR_NETWORKS = ["testnet", "mainnet", "public"] as const;


// ── Validation ──────────────────────────────────────────────────────────────

function validateEnv(): EnvConfig {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ── Required public variables ──────────────────────────────────────────
  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!webhookUrl) {
    errors.push("NEXT_PUBLIC_WEBHOOK_URL");
  }
  if (!apiUrl) {
    errors.push("NEXT_PUBLIC_API_URL");
  }

  // ── Stellar network (optional, defaults to "testnet") ─────────────────
  const rawStellarNetwork = (
    process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet"
  ).toLowerCase();

  if (
    !VALID_STELLAR_NETWORKS.includes(
      rawStellarNetwork as (typeof VALID_STELLAR_NETWORKS)[number],
    )
  ) {
    errors.push(
      `NEXT_PUBLIC_STELLAR_NETWORK must be "testnet" or "mainnet" (got "${rawStellarNetwork}")`,
    );
  }

  const stellarNetwork =
    rawStellarNetwork === "public" ? "mainnet" : rawStellarNetwork;
  const isMainnet = stellarNetwork === "mainnet";
  const fallbackHorizonUrl = isMainnet
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";

  const stellarHorizonUrl =
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || fallbackHorizonUrl;

  // ── Server-only variables (optional) ───────────────────────────────────
  const neuroWealthApiBaseUrl = process.env.NEUROWEALTH_API_BASE_URL ?? "";
  const neuroWealthApiAuthToken =
    process.env.NEUROWEALTH_API_AUTH_TOKEN ?? "";
  const neuroWealthPortfolioPath =
    process.env.NEUROWEALTH_PORTFOLIO_PATH ?? "/portfolio/overview";
  const neuroWealthTransactionsPath =
    process.env.NEUROWEALTH_TRANSACTIONS_PATH ?? "/transactions";
  const neuroWealthStrategyPath =
    process.env.NEUROWEALTH_STRATEGY_PATH ?? "/strategy/preference";

  // ── Dev-only warnings ──────────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    if (!process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX) {
      warnings.push(
        "NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX not set. " +
          'The dashboard sandbox (/dashboard/sandbox) is disabled. Set to "true" to enable.',
      );
    }

    if (!neuroWealthApiBaseUrl) {
      warnings.push(
        "NEUROWEALTH_API_BASE_URL not set. Using demo data for portfolio and transactions.",
      );
    } else if (!neuroWealthApiAuthToken) {
      warnings.push(
        "NEUROWEALTH_API_BASE_URL is set but NEUROWEALTH_API_AUTH_TOKEN is missing. " +
          "Server→backend requests will not include an Authorization header.",
      );
    }
  }

  // ── Report ─────────────────────────────────────────────────────────────
  for (const w of warnings) {
    console.warn(`[env] ${w}`);
  }

  if (errors.length > 0) {
    // Separate simple "missing" names from validation messages.
    const missingNames = errors.filter((e) => !e.includes(" "));
    const validationErrors = errors.filter((e) => e.includes(" "));

    const parts: string[] = [
      "\n╔══════════════════════════════════════════════════════════════╗",
      "║        ⚠  MISSING ENVIRONMENT VARIABLES  ⚠               ║",
      "╠══════════════════════════════════════════════════════════════╣",
    ];

    if (missingNames.length > 0) {
      parts.push("║  The following required variables are not set:");
      parts.push("║");
      parts.push(missingNames.map((n) => `║    ✗ ${n}`).join("\n"));
      parts.push("║");
    }

    if (validationErrors.length > 0) {
      parts.push("║  Validation errors:");
      parts.push("║");
      parts.push(validationErrors.map((e) => `║    ✗ ${e}`).join("\n"));
      parts.push("║");
    }

    parts.push("║  Fix: copy .env.example → .env.local and fill in values.");
    parts.push(
      "╚══════════════════════════════════════════════════════════════╝\n",
    );

    throw new Error(parts.join("\n"));
  }

  return {
    webhookUrl: webhookUrl!,
    apiUrl: apiUrl!,
    stellarNetwork,
    stellarHorizonUrl,
    neuroWealthApiBaseUrl,
    neuroWealthApiAuthToken,
    neuroWealthPortfolioPath,
    neuroWealthTransactionsPath,
    neuroWealthStrategyPath,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

// Validate on module load — lazy but cached.
let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

// For backward compatibility, export as const
export const env = getEnv();
