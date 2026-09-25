/**
 * Typed HTTP client for NeuroWealth API routes.
 *
 * All responses — from both the internal Next.js /api/* routes and the real
 * backend — must conform to the unified envelope defined in api-response.ts:
 *
 *   Success:  { success: true,  data: T }
 *   Error:    { success: false, error: { code, message, details? } }
 *
 * ── Auth contract ─────────────────────────────────────────────────────────────
 *
 * Browser → Next.js /api/* routes
 *   Authenticated via the session cookie (nw_session) set at sign-in. This
 *   cookie is client-readable (not httpOnly) and unsigned while auth is
 *   mock-only — see the AUTH_SECRET note in docs/env.md and the
 *   signature-verification issue for the tracking gaps. No explicit
 *   Authorization header is required from the browser.
 *
 * Next.js server → Real backend (NEUROWEALTH_API_BASE_URL)
 *   All proxied requests must include:
 *     Authorization: Bearer <NEUROWEALTH_API_AUTH_TOKEN>
 *   Use createServerApiClient() in route handlers instead of calling fetch
 *   directly so the token is attached consistently. If the backend endpoint
 *   returns its own raw JSON shape rather than this app's {success,data}
 *   envelope (or the caller needs to forward status/content-type verbatim),
 *   use createServerFetcher() instead — same auth injection, no envelope
 *   parsing.
 *
 * ── Timeout ───────────────────────────────────────────────────────────────────
 *
 * Default request timeout is 10 000 ms. Override per-call via timeoutMs.
 * A timed-out request rejects with ApiRequestError { code: "REQUEST_TIMEOUT", status: 408 }.
 *
 * ── Error codes ───────────────────────────────────────────────────────────────
 *
 * Code                  HTTP   Meaning
 * REQUEST_TIMEOUT       408    Fetch exceeded timeoutMs
 * NETWORK_ERROR         503    fetch() itself threw (DNS, refused, etc.)
 * INVALID_JSON          —      Response body was not parseable JSON
 * INVALID_ENVELOPE      —      JSON parsed but did not match the success/error envelope
 * (any backend code)    —      Forwarded verbatim from the backend error envelope
 */

import type { ApiErrorResponse, ApiResponse } from "@/lib/api-response";

/** Options accepted by apiRequest on top of standard RequestInit. */
export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** Prepended to the path to form the full URL. */
  baseUrl?: string;
  /** Plain objects are JSON-serialised automatically; Content-Type is set for you. */
  body?: BodyInit | Record<string, unknown> | null;
  /** Milliseconds before the request is aborted. Defaults to 10 000. */
  timeoutMs?: number;
}

/**
 * Thrown by apiRequest whenever the request fails or the server returns an
 * error envelope. Callers can inspect `code` for machine-readable classification
 * and `details` for per-field validation messages.
 */
export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, string | string[]>;

  constructor(
    message: string,
    options: {
      code: string;
      status: number;
      details?: Record<string, string | string[]>;
    },
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

function isApiErrorResponse(payload: unknown): payload is ApiErrorResponse {
  if (typeof payload !== "object" || payload == null) {
    return false;
  }

  const candidate = payload as Partial<ApiErrorResponse>;
  return (
    candidate.success === false &&
    typeof candidate.error?.code === "string" &&
    typeof candidate.error?.message === "string"
  );
}

function isAbortLikeError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function resolveRequestUrl(pathOrUrl: string, baseUrl?: string): string {
  if (!baseUrl) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl, baseUrl).toString();
}

/**
 * Resolve a backend path against a base URL, treating the path as relative
 * even when it starts with "/" so a base URL with its own path prefix (e.g.
 * "https://api.example.com/v1") is preserved instead of being replaced by an
 * absolute-path resolution.
 */
export function resolveServerEndpoint(baseUrl: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl.slice(1)
    : pathOrUrl;

  return new URL(normalizedPath, normalizedBase).toString();
}

function mergeSignalWithTimeout(
  signal: AbortSignal | null,
  timeoutMs: number,
): {
  signal: AbortSignal;
  cancel: () => void;
  wasTimedOut: () => boolean;
} {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let timedOut = false;

  const onExternalAbort = () => controller.abort(signal?.reason);

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener("abort", onExternalAbort, { once: true });
    }
  }

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort(new Error("Request timed out"));
    }, timeoutMs);
  }

  return {
    signal: controller.signal,
    wasTimedOut: () => timedOut,
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      signal?.removeEventListener("abort", onExternalAbort);
    },
  };
}

function toJsonBody(body: ApiRequestOptions["body"]): BodyInit | null | undefined {
  if (
    body == null ||
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return body as BodyInit | null | undefined;
  }

  return JSON.stringify(body);
}

/**
 * Make a typed HTTP request to a NeuroWealth API endpoint.
 *
 * The function expects the server to respond with the standard envelope.
 * On success it resolves with the unwrapped `data` payload typed as `T`.
 * On any failure it rejects with an `ApiRequestError`.
 *
 * @example — internal Next.js route (browser)
 *   const portfolio = await apiRequest<PortfolioPayload>("/api/portfolio");
 *
 * @example — server route handler calling the real backend
 *   const client = createServerApiClient();
 *   const portfolio = await client<PortfolioPayload>("/portfolio/overview");
 *
 * @example — authenticated request with explicit headers
 *   const data = await apiRequest<MyType>("/api/resource", {
 *     method: "POST",
 *     body: { amount: "100" },
 *     headers: { Authorization: `Bearer ${token}` },
 *     timeoutMs: 5000,
 *   });
 */
export async function apiRequest<T>(
  pathOrUrl: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    baseUrl,
    timeoutMs = 10000,
    body,
    headers,
    signal,
    ...rest
  } = options;

  const resolvedUrl = resolveRequestUrl(pathOrUrl, baseUrl);
  const timeout = mergeSignalWithTimeout(signal ?? null, timeoutMs);

  const nextHeaders = new Headers(headers);
  const nextBody = toJsonBody(body);

  if (
    nextBody &&
    typeof nextBody === "string" &&
    !nextHeaders.has("Content-Type")
  ) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(resolvedUrl, {
      ...rest,
      headers: nextHeaders,
      body: nextBody,
      signal: timeout.signal,
    });
  } catch (error) {
    timeout.cancel();

    if (isAbortLikeError(error) && timeout.wasTimedOut()) {
      throw new ApiRequestError("Request timed out. Please try again.", {
        code: "REQUEST_TIMEOUT",
        status: 408,
      });
    }

    throw new ApiRequestError("Unable to reach the service right now.", {
      code: "NETWORK_ERROR",
      status: 503,
    });
  }

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    timeout.cancel();
    throw new ApiRequestError("Service returned an unreadable response.", {
      code: "INVALID_JSON",
      status: response.status || 500,
    });
  }

  timeout.cancel();

  if (isApiErrorResponse(payload)) {
    throw new ApiRequestError(payload.error.message, {
      code: payload.error.code,
      status: response.status || 500,
      details: payload.error.details,
    });
  }

  if (!payload || payload.success !== true || !("data" in payload)) {
    throw new ApiRequestError("Service returned an unexpected payload.", {
      code: "INVALID_ENVELOPE",
      status: response.status || 500,
    });
  }

  return payload.data;
}

/**
 * Create a pre-configured apiRequest caller for server-side route handlers
 * that proxy to the real backend (NEUROWEALTH_API_BASE_URL).
 *
 * Automatically injects:
 *   - baseUrl  from NEUROWEALTH_API_BASE_URL
 *   - Authorization: Bearer <NEUROWEALTH_API_AUTH_TOKEN> (server credential)
 *   - X-User-Identity: <userIdentity> (per-user identity from session)
 *
 * Trust Model:
 *   The backend receives two credentials:
 *   1. Authorization header: Shared server-to-server credential (NEUROWEALTH_API_AUTH_TOKEN)
 *      - Proves the request originated from this Next.js frontend server
 *      - Allows backend to trust the frontend as a trusted proxy
 *   2. X-User-Identity header: Per-user identity derived from session cookie
 *      - Identifies which user issued the request
 *      - Allows backend to apply per-user authorization and data filtering
 *      - Backend should validate this against its own session store or JWT
 *
 *   This dual-credential approach ensures:
 *   - Backend can distinguish between users (per-user identity)
 *   - Backend trusts the frontend source (shared server credential)
 *   - Backend can enforce user-specific access controls
 *
 * Usage in a Next.js route handler:
 *   const client = createServerApiClient(userIdentity);
 *   if (!client) {
 *     // NEUROWEALTH_API_BASE_URL is not set — fall back to demo data
 *   } else {
 *     const data = await client<PortfolioPayload>("/portfolio/overview");
 *   }
 *
 * Returns null when NEUROWEALTH_API_BASE_URL is not configured so callers
 * can cleanly branch to demo/mock mode without checking env themselves.
 */
export function createServerApiClient(
  userIdentity?: string,
): (<T>(
  path: string,
  options?: Omit<ApiRequestOptions, "baseUrl">,
) => Promise<T>) | null {
  const baseUrl = process.env.NEUROWEALTH_API_BASE_URL;
  if (!baseUrl) return null;

  const token = process.env.NEUROWEALTH_API_AUTH_TOKEN;

  return function serverApiRequest<T>(
    path: string,
    options: Omit<ApiRequestOptions, "baseUrl"> = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (userIdentity && !headers.has("X-User-Identity")) {
      headers.set("X-User-Identity", userIdentity);
    }
    return apiRequest<T>(path, { ...options, baseUrl, headers });
  };
}

/**
 * Create a pre-configured raw fetch for server-side route handlers that proxy
 * to the real backend (NEUROWEALTH_API_BASE_URL) but need the unparsed
 * Response — e.g. because the backend returns its own JSON shape rather than
 * this app's {success,data} envelope, or the caller needs to forward the
 * backend's status/content-type verbatim instead of unwrapping it.
 *
 * Automatically injects:
 *   - Authorization: Bearer <NEUROWEALTH_API_AUTH_TOKEN> (server credential)
 *   - X-User-Identity: <userIdentity> (per-user identity from session)
 * and resolves `path` against NEUROWEALTH_API_BASE_URL via resolveServerEndpoint.
 *
 * Trust Model:
 *   See createServerApiClient() documentation for the dual-credential approach.
 *   The backend receives both a shared server credential (Authorization) and
 *   a per-user identity (X-User-Identity) to enable proper authorization.
 *
 * Usage in a Next.js route handler:
 *   const fetchBackend = createServerFetcher(userIdentity);
 *   if (!fetchBackend) {
 *     // NEUROWEALTH_API_BASE_URL is not set — fall back to demo data
 *   } else {
 *     const response = await fetchBackend("/portfolio/overview", { cache: "no-store" });
 *   }
 *
 * Returns null when NEUROWEALTH_API_BASE_URL is not configured so callers
 * can cleanly branch to demo/mock mode without checking env themselves.
 */
export function createServerFetcher(
  userIdentity?: string,
): ((
  path: string,
  init?: RequestInit,
) => Promise<Response>) | null {
  const baseUrl = process.env.NEUROWEALTH_API_BASE_URL;
  if (!baseUrl) return null;

  const token = process.env.NEUROWEALTH_API_AUTH_TOKEN;

  return function serverFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (userIdentity && !headers.has("X-User-Identity")) {
      headers.set("X-User-Identity", userIdentity);
    }
    return fetch(resolveServerEndpoint(baseUrl, path), { ...init, headers });
  };
}
