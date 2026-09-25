import { NextRequest } from "next/server";

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const MAX_MAP_SIZE = 1000;
let lastSweepTime = Date.now();
const SWEEP_INTERVAL_MS = 30_000;

/**
 * Sweep stale/expired entries from the rate limit store to prevent memory leaks.
 */
function sweepStaleEntries(force = false) {
  const now = Date.now();
  if (!force && now - lastSweepTime < SWEEP_INTERVAL_MS && rateLimitStore.size < MAX_MAP_SIZE) {
    return;
  }

  lastSweepTime = now;
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  // If still oversized after sweeping expired entries, trim the oldest entries
  if (rateLimitStore.size > MAX_MAP_SIZE) {
    const keysToDelete = Array.from(rateLimitStore.keys()).slice(
      0,
      rateLimitStore.size - MAX_MAP_SIZE,
    );
    for (const key of keysToDelete) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Extracts a client rate limit identifier without trusting unverified proxy headers.
 * Only standard x-forwarded-for (first hop) or x-real-ip are trusted.
 * Vendor-specific / spoofable headers like cf-connecting-ip, fastly-client-ip,
 * true-client-ip, and x-client-ip are strictly ignored.
 */
export function getRateLimitKey(
  request: NextRequest | Request | Headers | { headers: Headers | Record<string, string | undefined> },
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
    return "anonymous";
  }

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const clientIp = xForwardedFor.split(",")[0].trim();
    if (clientIp) return clientIp;
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp && xRealIp.trim()) {
    return xRealIp.trim();
  }

  return "anonymous";
}

/**
 * Checks and records rate limit for a given key.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 60;
  const now = Date.now();

  sweepStaleEntries();

  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    resetTime: existing.resetTime,
  };
}

export function clearRateLimitStore() {
  rateLimitStore.clear();
}
