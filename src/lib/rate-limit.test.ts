import { test } from "node:test";
import { strict as assert } from "node:assert";
import { checkRateLimit, resetRateLimitStore } from "./rate-limit.ts";

test("rate limiting: allows request within limit", () => {
  resetRateLimitStore();

  const result = checkRateLimit("test-key", {
    maxRequests: 3,
    windowMs: 1000,
  });

  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 2);
});

test("rate limiting: blocks request at limit", () => {
  resetRateLimitStore();

  // Use up all 3 requests
  checkRateLimit("test-key-2", { maxRequests: 3, windowMs: 1000 });
  checkRateLimit("test-key-2", { maxRequests: 3, windowMs: 1000 });
  checkRateLimit("test-key-2", { maxRequests: 3, windowMs: 1000 });

  // Fourth request should be blocked
  const result = checkRateLimit("test-key-2", {
    maxRequests: 3,
    windowMs: 1000,
  });

  assert.equal(result.allowed, false);
  assert.equal(result.remaining, 0);
  assert.ok(result.retryAfterMs > 0);
});

test("rate limiting: different keys have independent limits", () => {
  resetRateLimitStore();

  const limit = 2;

  // Max out key1
  checkRateLimit("key1", { maxRequests: limit, windowMs: 1000 });
  checkRateLimit("key1", { maxRequests: limit, windowMs: 1000 });

  // key2 should still have room
  const result = checkRateLimit("key2", { maxRequests: limit, windowMs: 1000 });
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 1);
});

test("rate limiting: portfolio GET uses GET:/api/portfolio:clientId key", () => {
  resetRateLimitStore();

  // Simulate portfolio GET rate limiting
  const clientId = "192.168.1.1";
  const key = `GET:/api/portfolio:${clientId}`;

  // Allow up to 30 requests per minute
  for (let i = 0; i < 30; i++) {
    const result = checkRateLimit(key, {
      maxRequests: 30,
      windowMs: 60_000,
    });
    assert.equal(result.allowed, true);
  }

  // 31st request should be blocked
  const result = checkRateLimit(key, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  assert.equal(result.allowed, false);
});
