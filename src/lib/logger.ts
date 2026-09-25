import { random } from "./seeded-rng";

/**
 * Centralized application logger with PII scrubbing and configurable log levels.
 *
 * ── Safe logging guidelines (contributors) ───────────────────────────────────
 *
 * DO log:
 *   - Operation names and coarse outcomes ("auth_sign_in_failed", "portfolio_fetch")
 *   - Non-identifying correlation IDs, error codes, HTTP status codes
 *   - Scrubbed context objects (always pass objects — never interpolate PII into messages)
 *
 * DO NOT log:
 *   - Emails, names, phone numbers, wallet addresses, session tokens, passwords
 *   - Full request/response bodies, support message content, Authorization headers
 *   - Raw Error objects that may contain user input in `.message`
 *
 * Prefer `analytics.track(name, { ... })` for product events — params are scrubbed
 * automatically. Use `logger` for diagnostics and dev tooling only.
 *
 * ── Log levels ────────────────────────────────────────────────────────────────
 *
 * Set NEXT_PUBLIC_LOG_LEVEL to one of: info | warn | error | silent
 * Default: info in development, warn in production (errors always emit unless silent).
 */

export type LogLevel = "info" | "warn" | "error";
export type LogLevelConfig = LogLevel | "silent";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: unknown;
}

const LEVEL_RANK: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
};

const SENSITIVE_KEY_FRAGMENTS = [
  "email",
  "address",
  "phone",
  "password",
  "secret",
  "key",
  "name",
  "token",
  "userid",
  "user_id",
  "ip",
  "ssn",
  "dob",
  "dateofbirth",
  "creditcard",
  "cardnumber",
  "accountnumber",
  "authorization",
  "cookie",
  "session",
  "jwt",
  "bearer",
  "message",
  "content",
  "body",
  "wallet",
  "mnemonic",
  "seed",
  "private",
  "error",
  "stack",
] as const;

const SENSITIVE_VALUE_PATTERN =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|Bearer\s+\S+/gi;

function resolveMinLogLevel(): LogLevelConfig {
  const configured = process.env.NEXT_PUBLIC_LOG_LEVEL?.toLowerCase();
  if (
    configured === "info" ||
    configured === "warn" ||
    configured === "error" ||
    configured === "silent"
  ) {
    return configured;
  }
  return process.env.NODE_ENV === "production" ? "warn" : "info";
}

export function isLogLevelEnabled(level: LogLevel): boolean {
  const min = resolveMinLogLevel();
  if (min === "silent") return false;
  return LEVEL_RANK[level] >= LEVEL_RANK[min];
}

type LogListener = (entry: LogEntry) => void;
const listeners: LogListener[] = [];

export const subscribeToLogs = (listener: LogListener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = (entry: LogEntry) => {
  listeners.forEach((l) => l(entry));
};

export const scrubPII = (data: unknown): unknown => {
  if (data == null) return data;

  if (typeof data === "string") {
    return data.replace(SENSITIVE_VALUE_PATTERN, "***REDACTED***");
  }

  if (typeof data !== "object") return data;

  const scrubbed = Array.isArray(data) ? [...data] : { ...(data as Record<string, unknown>) };

  for (const key of Object.keys(scrubbed)) {
    const value = (scrubbed as Record<string, unknown>)[key];
    if (
      SENSITIVE_KEY_FRAGMENTS.some((fragment) =>
        key.toLowerCase().includes(fragment),
      )
    ) {
      (scrubbed as Record<string, unknown>)[key] = "***REDACTED***";
    } else if (typeof value === "object" && value !== null) {
      (scrubbed as Record<string, unknown>)[key] = scrubPII(value);
    } else if (typeof value === "string") {
      (scrubbed as Record<string, unknown>)[key] = scrubPII(value);
    }
  }

  return scrubbed;
};

const createEntry = (
  level: LogLevel,
  message: string,
  context?: unknown,
): LogEntry => ({
  id: random().toString(36).substring(7),
  timestamp: new Date().toISOString(),
  level,
  message,
  context: context === undefined ? undefined : scrubPII(context),
});

const emitToConsole = (level: LogLevel, message: string, context?: unknown) => {
  if (!isLogLevelEnabled(level)) return;

  const prefix = level.toUpperCase();
  const payload = context === undefined ? "" : scrubPII(context);

  switch (level) {
    case "info":
      console.log(`[${prefix}] ${message}`, payload);
      break;
    case "warn":
      console.warn(`[${prefix}] ${message}`, payload);
      break;
    case "error":
      console.error(`[${prefix}] ${message}`, payload);
      break;
  }
};


export interface ApiErrorPresentation {
  title: string;
  description: string;
  actionLabel: string;
  retryable: boolean;
  code: string;
  status?: number;
}

type ApiErrorShape = {
  code?: unknown;
  status?: unknown;
  message?: unknown;
};

const API_ERROR_PRESENTATION: Record<string, Omit<ApiErrorPresentation, "code" | "status">> = {
  NETWORK_ERROR: {
    title: "Connection problem",
    description: "We could not reach the service. Check your connection and try again.",
    actionLabel: "Retry",
    retryable: true,
  },
  REQUEST_TIMEOUT: {
    title: "Request timed out",
    description: "The service took too long to respond. Try again in a moment.",
    actionLabel: "Retry",
    retryable: true,
  },
  VALIDATION_FAILED: {
    title: "Check your changes",
    description: "Some values could not be saved. Review the highlighted fields and try again.",
    actionLabel: "Review",
    retryable: false,
  },
  INVALID_AMOUNT: {
    title: "Check your amount",
    description: "The amount could not be accepted. Update it and try again.",
    actionLabel: "Edit",
    retryable: false,
  },
  RATE_LIMITED: {
    title: "Too many attempts",
    description: "The service is receiving too many requests. Wait a moment before trying again.",
    actionLabel: "Try later",
    retryable: true,
  },
  STATE_CONFLICT: {
    title: "Refresh required",
    description: "This data changed before your update completed. Refresh and try again.",
    actionLabel: "Refresh",
    retryable: true,
  },
  INTERNAL_SERVER_ERROR: {
    title: "Service unavailable",
    description: "The service could not complete the request. Try again in a moment.",
    actionLabel: "Retry",
    retryable: true,
  },
};

function getApiErrorShape(error: unknown): ApiErrorShape {
  if (typeof error !== "object" || error === null) {
    return {};
  }
  return error as ApiErrorShape;
}

export function getApiErrorPresentation(
  error: unknown,
  fallback: Partial<Pick<ApiErrorPresentation, "title" | "description" | "actionLabel">> = {},
): ApiErrorPresentation {
  const shape = getApiErrorShape(error);
  const code = typeof shape.code === "string" ? shape.code : "UNKNOWN_ERROR";
  const status = typeof shape.status === "number" ? shape.status : undefined;
  const copy = API_ERROR_PRESENTATION[code] ?? {
    title: fallback.title ?? "Something went wrong",
    description:
      fallback.description ??
      (typeof shape.message === "string"
        ? shape.message
        : "The request could not be completed. Please try again."),
    actionLabel: fallback.actionLabel ?? "Retry",
    retryable: true,
  };

  const presentation = {
    ...copy,
    code,
  };

  return status === undefined ? presentation : { ...presentation, status };
}
export const logger = {
  info: (message: string, context?: unknown) => {
    const entry = createEntry("info", message, context);
    emitToConsole("info", message, entry.context);
    notifyListeners(entry);
  },
  warn: (message: string, context?: unknown) => {
    const entry = createEntry("warn", message, context);
    emitToConsole("warn", message, entry.context);
    notifyListeners(entry);
  },
  error: (message: string, error?: unknown) => {
    const context =
      error instanceof Error
        ? { error: error.message, stack: error.stack }
        : error;
    const entry = createEntry("error", message, context);
    emitToConsole("error", message, entry.context);
    notifyListeners(entry);
  },
};
