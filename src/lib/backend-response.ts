/**
 * Helpers for proxying raw backend responses into this app's unified envelope.
 *
 * The real backend may return either a bare payload (e.g. `{ quote: ... }`) or
 * an already-wrapped `{ success: true, data: ... }` envelope. It may also fail
 * with an arbitrary body (HTML, plain text, an error object, ...). Routes must
 * validate and normalise those responses instead of forwarding them verbatim,
 * otherwise the browser client rejects them as INVALID_JSON/INVALID_ENVELOPE.
 */

import {
  ERROR_CODE,
  HTTP_STATUS,
  errorResponse,
  type ApiErrorResponse,
} from "@/lib/api-response";

export type BackendJsonResult =
  | { kind: "json"; value: unknown }
  | { kind: "empty" }
  | { kind: "invalid" };

export interface BackendErrorPayload {
  code?: string;
  message?: string;
  details?: Record<string, string | string[]>;
}

export interface MappedBackendFailure {
  code: (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
  status: number;
}

export interface BackendErrorResult {
  status: number;
  body: ApiErrorResponse;
}

type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Read a backend response body without throwing on HTML, plain text or empty
 * bodies. Callers decide how to treat `empty` (204) versus `invalid` (HTML).
 */
export async function readBackendJson(
  response: Response,
): Promise<BackendJsonResult> {
  let text: string;

  try {
    text = await response.text();
  } catch {
    return { kind: "invalid" };
  }

  if (!text.trim()) {
    return { kind: "empty" };
  }

  try {
    return { kind: "json", value: JSON.parse(text) };
  } catch {
    return { kind: "invalid" };
  }
}

/**
 * Unwrap the backend's own `{ success: true, data }` envelope when present,
 * otherwise return the bare payload unchanged.
 */
export function unwrapBackendPayload(value: unknown): unknown {
  if (isRecord(value) && value.success === true && "data" in value) {
    return value.data;
  }

  return value;
}

/**
 * Detect an explicit backend error envelope. Used on 2xx responses where a
 * backend may still signal failure through `success: false`.
 */
export function isBackendErrorEnvelope(value: unknown): boolean {
  return isRecord(value) && value.success === false;
}

function sanitizeDetails(
  value: unknown,
): Record<string, string | string[]> | undefined {
  if (!isRecord(value)) return undefined;

  const entries: [string, string | string[]][] = [];

  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === "string") {
      entries.push([key, entry]);
    } else if (
      Array.isArray(entry) &&
      entry.every((item) => typeof item === "string")
    ) {
      entries.push([key, entry as string[]]);
    }
  }

  return entries.length ? Object.fromEntries(entries) : undefined;
}

/**
 * Extract a code/message/details from any of the error shapes the backend is
 * known to produce. HTML and other non-JSON bodies yield an empty result.
 */
export function extractBackendError(value: unknown): BackendErrorPayload {
  if (!isRecord(value)) return {};

  const error = value.error;

  if (isRecord(error)) {
    return {
      code: typeof error.code === "string" ? error.code : undefined,
      message:
        typeof error.message === "string" && error.message.trim()
          ? error.message.trim()
          : undefined,
      details: sanitizeDetails(error.details),
    };
  }

  if (typeof error === "string" && error.trim()) {
    return { message: error.trim() };
  }

  return {
    code: typeof value.code === "string" ? value.code : undefined,
    message:
      typeof value.message === "string" && value.message.trim()
        ? value.message.trim()
        : undefined,
    details: sanitizeDetails(value.details),
  };
}

const BACKEND_CODE_MAP: Record<string, MappedBackendFailure> = {
  VALIDATION_ERROR: {
    code: ERROR_CODE.VALIDATION_ERROR,
    status: HTTP_STATUS.BAD_REQUEST,
  },
  VALIDATION_FAILED: {
    code: ERROR_CODE.VALIDATION_ERROR,
    status: HTTP_STATUS.BAD_REQUEST,
  },
  INVALID_AMOUNT: {
    code: ERROR_CODE.VALIDATION_ERROR,
    status: HTTP_STATUS.BAD_REQUEST,
  },
  INVALID_WALLET: {
    code: ERROR_CODE.VALIDATION_ERROR,
    status: HTTP_STATUS.BAD_REQUEST,
  },
  INSUFFICIENT_BALANCE: {
    code: ERROR_CODE.VALIDATION_ERROR,
    status: HTTP_STATUS.BAD_REQUEST,
  },
  QUOTA_EXCEEDED: {
    code: ERROR_CODE.VALIDATION_ERROR,
    status: HTTP_STATUS.BAD_REQUEST,
  },
  UNAUTHORIZED: {
    code: ERROR_CODE.UNAUTHORIZED,
    status: HTTP_STATUS.UNAUTHORIZED,
  },
  FORBIDDEN: { code: ERROR_CODE.FORBIDDEN, status: HTTP_STATUS.FORBIDDEN },
  NOT_FOUND: { code: ERROR_CODE.NOT_FOUND, status: HTTP_STATUS.NOT_FOUND },
  PAYLOAD_TOO_LARGE: {
    code: ERROR_CODE.PAYLOAD_TOO_LARGE,
    status: HTTP_STATUS.PAYLOAD_TOO_LARGE,
  },
  RATE_LIMITED: {
    code: ERROR_CODE.RATE_LIMITED,
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
  },
  TOO_MANY_REQUESTS: {
    code: ERROR_CODE.RATE_LIMITED,
    status: HTTP_STATUS.TOO_MANY_REQUESTS,
  },
  STATE_CONFLICT: {
    code: ERROR_CODE.BACKEND_ERROR,
    status: HTTP_STATUS.CONFLICT,
  },
  CONCURRENT_UPDATE: {
    code: ERROR_CODE.BACKEND_ERROR,
    status: HTTP_STATUS.CONFLICT,
  },
  INTERNAL_ERROR: {
    code: ERROR_CODE.BACKEND_ERROR,
    status: HTTP_STATUS.BAD_GATEWAY,
  },
  INTERNAL_SERVER_ERROR: {
    code: ERROR_CODE.BACKEND_ERROR,
    status: HTTP_STATUS.BAD_GATEWAY,
  },
  BACKEND_ERROR: {
    code: ERROR_CODE.BACKEND_ERROR,
    status: HTTP_STATUS.BAD_GATEWAY,
  },
  SERVICE_UNAVAILABLE: {
    code: ERROR_CODE.SERVICE_UNAVAILABLE,
    status: HTTP_STATUS.SERVICE_UNAVAILABLE,
  },
};

function mapBackendStatus(status: number): MappedBackendFailure {
  if (status === HTTP_STATUS.BAD_REQUEST || status === HTTP_STATUS.UNPROCESSABLE_ENTITY) {
    return {
      code: ERROR_CODE.VALIDATION_ERROR,
      status: HTTP_STATUS.BAD_REQUEST,
    };
  }
  if (status === HTTP_STATUS.UNAUTHORIZED) {
    return {
      code: ERROR_CODE.UNAUTHORIZED,
      status: HTTP_STATUS.UNAUTHORIZED,
    };
  }
  if (status === HTTP_STATUS.FORBIDDEN) {
    return { code: ERROR_CODE.FORBIDDEN, status: HTTP_STATUS.FORBIDDEN };
  }
  if (status === HTTP_STATUS.NOT_FOUND) {
    return { code: ERROR_CODE.NOT_FOUND, status: HTTP_STATUS.NOT_FOUND };
  }
  if (status === HTTP_STATUS.CONFLICT) {
    return { code: ERROR_CODE.BACKEND_ERROR, status: HTTP_STATUS.CONFLICT };
  }
  if (status === HTTP_STATUS.PAYLOAD_TOO_LARGE) {
    return {
      code: ERROR_CODE.PAYLOAD_TOO_LARGE,
      status: HTTP_STATUS.PAYLOAD_TOO_LARGE,
    };
  }
  if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
    return {
      code: ERROR_CODE.RATE_LIMITED,
      status: HTTP_STATUS.TOO_MANY_REQUESTS,
    };
  }
  if (status === HTTP_STATUS.SERVICE_UNAVAILABLE || status === 504) {
    return {
      code: ERROR_CODE.SERVICE_UNAVAILABLE,
      status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    };
  }
  if (status >= 500) {
    return { code: ERROR_CODE.BACKEND_ERROR, status: HTTP_STATUS.BAD_GATEWAY };
  }

  return { code: ERROR_CODE.BACKEND_ERROR, status: HTTP_STATUS.BAD_GATEWAY };
}

/**
 * Map a backend status/code pair to one of this app's error codes and the HTTP
 * status the proxy should return.
 */
export function mapBackendFailure(
  status: number,
  backendCode?: string,
): MappedBackendFailure {
  if (status >= 500) {
    return mapBackendStatus(status);
  }

  const normalizedCode = backendCode?.trim().toUpperCase();
  const mappedCode = normalizedCode
    ? BACKEND_CODE_MAP[normalizedCode]
    : undefined;

  return mappedCode ?? mapBackendStatus(status);
}

const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "The request could not be processed. Please check your input.",
  UNAUTHORIZED: "Authentication required. Please sign in again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  PAYLOAD_TOO_LARGE: "Request body is too large.",
  RATE_LIMITED: "Too many requests. Please try again later.",
  INTERNAL_ERROR: "The service could not complete the request.",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again.",
  BACKEND_ERROR: "The service returned an unexpected response.",
};

function safeMessage(message: string | undefined, fallback: string): string {
  if (!message) return fallback;
  const trimmed = message.trim();
  if (!trimmed) return fallback;
  return trimmed.length > 300 ? `${trimmed.slice(0, 297)}...` : trimmed;
}

/**
 * Build a normalised error envelope for a failed proxied response.
 *
 * `rawBody` should be the parsed JSON body when available (null for HTML,
 * plain text, empty bodies, or network failures).
 */
export function toBackendErrorResponse(
  status: number,
  rawBody: unknown,
  fallbackMessage: string,
): BackendErrorResult {
  const backendError = extractBackendError(rawBody);
  const mapped = mapBackendFailure(status, backendError.code);
  const defaultMessage =
    mapped.code === ERROR_CODE.BACKEND_ERROR ||
    mapped.code === ERROR_CODE.SERVICE_UNAVAILABLE
      ? fallbackMessage
      : DEFAULT_MESSAGES[mapped.code];
  const message = safeMessage(backendError.message, defaultMessage);

  return {
    status: mapped.status,
    body: errorResponse(mapped.code, message, backendError.details),
  };
}
