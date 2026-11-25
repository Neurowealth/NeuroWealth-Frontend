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
  /** Window of the limiter that last used this key; sweeps prune with it. */
  windowMs: number;
  /** Last time this key was checked; used to evict least-recently-used keys. */
  lastAccess: number;
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
function sweepStaleEntries(force = false): void {
  const now = Date.now();
  if (!force && now - lastSweepTime < SWEEP_INTERVAL_MS && store.size < MAX_MAP_SIZE) {
    return;
  }

  lastSweepTime = now;
  for (const [key, entry] of store.entries()) {
    // Prune with the entry's own window, not the caller's, so a short-window
    // limiter cannot discard timestamps that a longer-window limiter relies on.
    entry.timestamps = entry.timestamps.filter((t) => t > now - entry.windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }

  // If still oversized after removing expired timestamps, prune the least
  // recently used keys so an actively throttled client is not evicted while
  // older-but-idle keys remain tracked.
  if (store.size > MAX_MAP_SIZE) {
    const oldestKeys = Array.from(store.entries())
      .sort(([, a], [, b]) => a.lastAccess - b.lastAccess)
      .slice(0, store.size - MAX_MAP_SIZE)
      .map(([key]) => key);
    for (const key of oldestKeys) {
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

  sweepStaleEntries();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [], windowMs: options.windowMs, lastAccess: now };
    store.set(key, entry);
  }
  entry.lastAccess = now;
  // A key can be shared by limiters with different windows. Keep the longest
  // so timestamps are retained for as long as any of them may need them.
  entry.windowMs = Math.max(entry.windowMs, options.windowMs);

  // Drop timestamps no limiter sharing this key can still need (the entry
  // keeps the longest window), then count only those inside *this* caller's
  // window. Pruning with the caller's window would erase the history a
  // longer-window limiter on the same key depends on.
  entry.timestamps = entry.timestamps.filter((t) => t > now - entry.windowMs);
  const inWindow = entry.timestamps.filter((t) => t > windowStart);

  if (inWindow.length >= options.maxRequests) {
    const oldestInWindow = inWindow[0];
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
    remaining: options.maxRequests - (inWindow.length + 1),
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
 *
 * Returns the client IP, or fallback (defaults to null) if no trusted client IP header is present.
 */
export function getRateLimitKey(
  request: Pick<Request, "headers"> | { headers: Headers | Record<string, string | undefined> } | Headers,
  fallback?: string | null,
): string | null {
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
    return fallback ?? null;
  }

  // x-real-ip is set by the trusted reverse proxy itself and cannot be
  // spoofed by the client, so it takes priority over x-forwarded-for.
  const xRealIp = headers.get("x-real-ip");
  const parsedXReal = parseClientIp(xRealIp);
  if (parsedXReal) return parsedXReal;

  const xForwardedFor = headers.get("x-forwarded-for");
  const parsedXff = parseClientIp(xForwardedFor);
  if (parsedXff) return parsedXff;

  return fallback ?? null;
}
