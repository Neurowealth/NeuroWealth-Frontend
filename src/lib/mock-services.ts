/**
 * @module mock-services
 *
 * Typed mock service layer for auth, portfolio, strategy, and transaction flows.
 *
 * Adapter contract:
 *   Each service exposes an interface (e.g. `AuthService`) that mirrors the
 *   shape a real backend adapter must satisfy. Swap `mockAuthService` for a
 *   real implementation without touching call-sites.
 *
 * Simulated latency:
 *   All async methods accept an optional `SimulationOptions` argument so
 *   callers can force success, failure, or use the default random-failure rate.
 */

"use client";

import { logger } from "./logger";
import {
  buildScenarioPayload,
  normalizePortfolioPayload,
  type PortfolioPayload,
} from "./portfolio";
import {
  buildTransactionQuote,
  buildPendingTransaction,
  buildTransactionReceipt,
  validateTransactionValues,
  type TransactionKind,
  type TransactionFormValues,
  type TransactionQuote,
  type PendingTransaction,
  type TransactionReceipt,
  type TransactionFieldErrors,
} from "./transactions";
import type { AuthSession } from "./mock-auth";

// ─── Shared error model ───────────────────────────────────────────────────────

export type ServiceErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UNKNOWN";

export class ServiceError extends Error {
  constructor(
    public readonly code: ServiceErrorCode,
    message: string,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

// ─── Simulation options ───────────────────────────────────────────────────────

export interface SimulationOptions {
  /** Force outcome. Defaults to "auto" (random ~15% failure rate). */
  outcome?: "success" | "failure" | "auto";
  /** Override simulated latency in ms. */
  latencyMs?: number;
}

function shouldFail(outcome: SimulationOptions["outcome"] = "auto"): boolean {
  if (outcome === "success") return false;
  if (outcome === "failure") return true;
  return Math.random() < 0.15;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export interface AuthService {
  signIn(email: string, password: string, opts?: SimulationOptions): Promise<AuthSession>;
  signUp(email: string, name: string, password: string, opts?: SimulationOptions): Promise<AuthSession>;
  signOut(): void;
  getSession(): AuthSession | null;
}

const STORAGE_KEY = "nw_auth_session";

export const mockAuthService: AuthService = {
  async signIn(email, password, opts = {}) {
    logger.info("mockAuthService.signIn", { email });
    await delay(opts.latencyMs ?? 800);

    if (shouldFail(opts.outcome)) {
      throw new ServiceError("NETWORK_ERROR", "Sign-in request failed. Please try again.", true);
    }

    if (password !== "password123") {
      throw new ServiceError("AUTH_ERROR", "Invalid email or password.", false);
    }

    const session: AuthSession = {
      user: { id: "u1", email, name: email.split("@")[0] },
      token: "mock-jwt-" + Math.random().toString(36).slice(2, 9),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  async signUp(email, name, password, opts = {}) {
    logger.info("mockAuthService.signUp", { email, name });
    await delay(opts.latencyMs ?? 1000);

    if (shouldFail(opts.outcome)) {
      throw new ServiceError("NETWORK_ERROR", "Sign-up request failed. Please try again.", true);
    }

    if (!password || password.length < 8) {
      throw new ServiceError("VALIDATION_ERROR", "Password must be at least 8 characters.", false);
    }

    const session: AuthSession = {
      user: { id: "u" + Math.random().toString(36).slice(2, 9), email, name },
      token: "mock-jwt-" + Math.random().toString(36).slice(2, 9),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  signOut() {
    logger.info("mockAuthService.signOut");
    localStorage.removeItem(STORAGE_KEY);
  },

  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as AuthSession;
    } catch {
      return null;
    }
  },
};

// ─── Portfolio service ────────────────────────────────────────────────────────

export interface PortfolioService {
  fetchPortfolio(opts?: SimulationOptions): Promise<PortfolioPayload>;
}

export const mockPortfolioService: PortfolioService = {
  async fetchPortfolio(opts = {}) {
    logger.info("mockPortfolioService.fetchPortfolio");
    await delay(opts.latencyMs ?? 900);

    if (shouldFail(opts.outcome)) {
      throw new ServiceError(
        "NETWORK_ERROR",
        "Could not load portfolio data. Check your connection and retry.",
        true,
      );
    }

    const raw = buildScenarioPayload("live");
    return normalizePortfolioPayload(raw, "demo");
  },
};

// ─── Strategy service ─────────────────────────────────────────────────────────

export type StrategyId = "conservative" | "balanced" | "growth";

export interface StrategyOption {
  id: StrategyId;
  label: string;
  description: string;
  apyRange: string;
  riskLabel: string;
}

export interface StrategyService {
  fetchStrategies(opts?: SimulationOptions): Promise<StrategyOption[]>;
  selectStrategy(id: StrategyId, opts?: SimulationOptions): Promise<void>;
}

const STRATEGIES: StrategyOption[] = [
  {
    id: "conservative",
    label: "Conservative",
    description: "Stablecoin lending on Blend. Low risk, steady returns.",
    apyRange: "3–6%",
    riskLabel: "Low",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Mix of lending and DEX liquidity provision.",
    apyRange: "6–10%",
    riskLabel: "Medium",
  },
  {
    id: "growth",
    label: "Growth",
    description: "Aggressive multi-protocol deployment for higher yield.",
    apyRange: "10–15%",
    riskLabel: "High",
  },
];

export const mockStrategyService: StrategyService = {
  async fetchStrategies(opts = {}) {
    logger.info("mockStrategyService.fetchStrategies");
    await delay(opts.latencyMs ?? 600);

    if (shouldFail(opts.outcome)) {
      throw new ServiceError(
        "NETWORK_ERROR",
        "Could not load strategies. Please retry.",
        true,
      );
    }

    return STRATEGIES;
  },

  async selectStrategy(id, opts = {}) {
    logger.info("mockStrategyService.selectStrategy", { id });
    await delay(opts.latencyMs ?? 700);

    if (shouldFail(opts.outcome)) {
      throw new ServiceError(
        "NETWORK_ERROR",
        "Strategy change failed. Your current strategy is unchanged.",
        true,
      );
    }
  },
};

// ─── Transaction service ──────────────────────────────────────────────────────

export interface TransactionQuoteResult {
  quote: TransactionQuote;
  fieldErrors: TransactionFieldErrors;
}

export interface TransactionSubmitResult {
  pending: PendingTransaction;
}

export interface TransactionSettleResult {
  receipt: TransactionReceipt;
}

export interface TransactionService {
  getQuote(
    kind: TransactionKind,
    values: TransactionFormValues,
    opts?: SimulationOptions,
  ): Promise<TransactionQuoteResult>;

  submit(
    kind: TransactionKind,
    values: TransactionFormValues,
    opts?: SimulationOptions,
  ): Promise<TransactionSubmitResult>;

  settle(
    pending: PendingTransaction,
    opts?: SimulationOptions,
  ): Promise<TransactionSettleResult>;
}

export const mockTransactionService: TransactionService = {
  async getQuote(kind, values, opts = {}) {
    logger.info("mockTransactionService.getQuote", { kind });
    await delay(opts.latencyMs ?? 400);

    if (shouldFail(opts.outcome)) {
      throw new ServiceError(
        "NETWORK_ERROR",
        "Quote request failed. Please retry.",
        true,
      );
    }

    const fieldErrors = validateTransactionValues(kind, values);
    if (Object.keys(fieldErrors).length > 0) {
      return { quote: buildTransactionQuote(kind, values), fieldErrors };
    }

    return { quote: buildTransactionQuote(kind, values), fieldErrors: {} };
  },

  async submit(kind, values, opts = {}) {
    logger.info("mockTransactionService.submit", { kind });
    await delay(opts.latencyMs ?? 600);

    if (shouldFail(opts.outcome)) {
      throw new ServiceError(
        "NETWORK_ERROR",
        "Submission failed before reaching the network. Please retry.",
        true,
      );
    }

    const nextStatus = opts.outcome === "failure" ? "failure" : "success";
    return { pending: buildPendingTransaction(kind, values, nextStatus) };
  },

  async settle(pending, opts = {}) {
    logger.info("mockTransactionService.settle", { ref: pending.reference });
    await delay(opts.latencyMs ?? pending.completionDelayMs ?? 1600);

    if (shouldFail(opts.outcome)) {
      return { receipt: buildTransactionReceipt(pending, "failure") };
    }

    return { receipt: buildTransactionReceipt(pending, pending.nextStatus) };
  },
};
