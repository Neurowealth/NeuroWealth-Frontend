import assert from "node:assert/strict";
import test from "node:test";

import {
  checkRateLimit,
  getRateLimitKey,
  resetRateLimitStore,
} from "./rate-limit";

test.afterEach(() => {
  resetRateLimitStore();
});

test("allows requests under the limit", () => {
  const opts = { maxRequests: 3, windowMs: 60_000 };

  const r1 = checkRateLimit("user:a", opts);
  const r2 = checkRateLimit("user:a", opts);
  const r3 = checkRateLimit("user:a", opts);

  assert.equal(r1.allowed, true);
  assert.equal(r2.allowed, true);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);
});

test("blocks requests exceeding the limit", () => {
  const opts = { maxRequests: 2, windowMs: 60_000 };

  checkRateLimit("user:b", opts);
  checkRateLimit("user:b", opts);
  const blocked = checkRateLimit("user:b", opts);

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfterMs > 0);
});

test("tracks keys independently", () => {
  const opts = { maxRequests: 1, windowMs: 60_000 };

  checkRateLimit("user:c", opts);
  const other = checkRateLimit("user:d", opts);

  assert.equal(other.allowed, true);
});

test("resets after the window elapses", () => {
  const opts = { maxRequests: 1, windowMs: 1 }; // 1ms window

  checkRateLimit("user:e", opts);

  // Wait for window to expire.
  const start = Date.now();
  while (Date.now() - start < 5) {
    /* spin */
  }

  const afterWindow = checkRateLimit("user:e", opts);
  assert.equal(afterWindow.allowed, true);
});

test("getRateLimitKey extracts client IP from x-forwarded-for first hop", () => {
  const headers = new Headers({
    "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
  });
  const key = getRateLimitKey(headers);
  assert.equal(key, "203.0.113.195");
});

test("getRateLimitKey extracts client IP from x-real-ip when x-forwarded-for is missing", () => {
  const headers = new Headers({
    "x-real-ip": "198.51.100.42",
  });
  const key = getRateLimitKey(headers);
  assert.equal(key, "198.51.100.42");
});

test("getRateLimitKey ignores spoofed vendor-specific headers (cf-connecting-ip, fastly-client-ip)", () => {
  const headers = new Headers({
    "cf-connecting-ip": "1.2.3.4",
    "fastly-client-ip": "5.6.7.8",
    "true-client-ip": "9.10.11.12",
    "x-client-ip": "13.14.15.16",
  });
  const key = getRateLimitKey(headers);
  // Vendor headers must not be used as trusted keys
  assert.equal(key, "unknown");
});
