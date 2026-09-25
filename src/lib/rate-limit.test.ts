import assert from "node:assert/strict";
import test from "node:test";

import { checkRateLimit, resetRateLimitStore } from "./rate-limit";

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
