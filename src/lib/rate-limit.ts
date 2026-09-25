/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Designed for mock / single-instance deployments. A real backend should
 * replace this with a Redis- or database-backed implementation that shares
 * state across instances.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface RateLimitEntry {
  timestamps: number[];
}

export interface RateLimiterOptions {
  /** Number of requests allowed in the window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check whether `key` is within the rate limit. Returns immediately — does
 * not block or sleep.
 */
export function checkRateLimit(
  key: string,
  options: RateLimiterOptions,
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Prune timestamps outside the current window.
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= options.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow + options.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: options.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/** Clear all stored rate-limit state. Intended for tests only. */
export function resetRateLimitStore(): void {
  store.clear();
}

export function parseClientIp(value: string | null): string | null {
  if (!value) return null;

  const firstCandidate = value
    .split(",")
    .map((segment) => segment.trim())
    .find((segment) => segment.length > 0);

  return firstCandidate ?? null;
}

export function getRateLimitKey(request: Pick<Request, "headers">): string {
  const trustedHeaders = [
    "x-real-ip",
    "cf-connecting-ip",
    "x-client-ip",
    "fastly-client-ip",
    "true-client-ip",
  ];

  for (const headerName of trustedHeaders) {
    const ip = parseClientIp(request.headers.get(headerName));
    if (ip) return ip;
  }

  return parseClientIp(request.headers.get("x-forwarded-for")) ?? "unknown";
}

