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
const MAX_MAP_SIZE = 1000;
let lastSweepTime = Date.now();
const SWEEP_INTERVAL_MS = 30_000;

/**
 * Sweep stale/expired entries from the rate limit store to prevent memory exhaustion.
 */
function sweepStaleEntries(windowMs: number = 60_000, force = false): void {
  const now = Date.now();
  if (!force && now - lastSweepTime < SWEEP_INTERVAL_MS && store.size < MAX_MAP_SIZE) {
    return;
  }

  lastSweepTime = now;
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > now - windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }

  // If still oversized after removing expired timestamps, prune oldest keys
  if (store.size > MAX_MAP_SIZE) {
    const keysToDelete = Array.from(store.keys()).slice(0, store.size - MAX_MAP_SIZE);
    for (const key of keysToDelete) {
      store.delete(key);
    }
  }
}

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

  sweepStaleEntries(options.windowMs);

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

export const clearRateLimitStore = resetRateLimitStore;

export function parseClientIp(value: string | null | undefined): string | null {
  if (!value) return null;

  const firstCandidate = value
    .split(",")
    .map((segment) => segment.trim())
    .find((segment) => segment.length > 0);

  return firstCandidate ?? null;
}

/**
 * Extracts a client rate limit identifier without trusting unverified proxy headers.
 * Only standard x-forwarded-for (first hop) or x-real-ip are trusted.
 * Vendor-specific / spoofable headers like cf-connecting-ip, fastly-client-ip,
 * true-client-ip, and x-client-ip are strictly ignored.
 */
export function getRateLimitKey(
  request: Pick<Request, "headers"> | { headers: Headers | Record<string, string | undefined> } | Headers,
): string {
  let headers: Headers | { get(name: string): string | null | undefined };

  if ("headers" in request && typeof (request as { headers: Headers }).headers.get === "function") {
    headers = (request as { headers: Headers }).headers;
  } else if ("headers" in request && typeof request.headers === "object") {
    const headerObj = request.headers as Record<string, string | undefined>;
    headers = {
      get: (name: string) => headerObj[name.toLowerCase()] ?? headerObj[name] ?? null,
    };
  } else if (typeof (request as Headers).get === "function") {
    headers = request as Headers;
  } else {
    return "unknown";
  }

  const xForwardedFor = headers.get("x-forwarded-for");
  const parsedXff = parseClientIp(xForwardedFor);
  if (parsedXff) return parsedXff;

  const xRealIp = headers.get("x-real-ip");
  const parsedXReal = parseClientIp(xRealIp);
  if (parsedXReal) return parsedXReal;

  return "unknown";
}
