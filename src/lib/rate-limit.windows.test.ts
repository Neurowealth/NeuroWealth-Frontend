/**
 * Limiters with different windows sharing a key must not erase each other's
 * history (#1286).
 */

import assert from "node:assert/strict";
import test, { mock } from "node:test";

import { checkRateLimit, resetRateLimitStore } from "./rate-limit";

const LONG = { maxRequests: 2, windowMs: 10 * 60_000 };
const SHORT = { maxRequests: 5, windowMs: 1_000 };

let now = Date.now() + 1_000_000;
const at = (t: number) => {
  now = t;
};

test.beforeEach(() => {
  resetRateLimitStore();
  now = Date.now() + 1_000_000;
  mock.method(Date, "now", () => now);
});

test.afterEach(() => {
  mock.restoreAll();
  resetRateLimitStore();
});

test("a short-window sweep does not prune a longer-window key", () => {
  const base = now;
  assert.equal(checkRateLimit("api:key", LONG).allowed, true);
  assert.equal(checkRateLimit("api:key", LONG).allowed, true);

  // 31s later (past the sweep interval) a short-window caller on another key
  // triggers a sweep of the whole store.
  at(base + 31_000);
  checkRateLimit("other:key", SHORT);

  // The long-window key still remembers its two requests.
  assert.equal(checkRateLimit("api:key", LONG).allowed, false);
});

test("alternating short and long limiters over the same key keeps the long limit", () => {
  const base = now;
  assert.equal(checkRateLimit("shared", LONG).allowed, true);

  at(base + 5_000);
  assert.equal(checkRateLimit("shared", SHORT).allowed, true);

  at(base + 10_000);
  // Two earlier hits (one long, one short) are inside the long window.
  assert.equal(checkRateLimit("shared", LONG).allowed, false);
});

test("the short limiter only counts hits inside its own window", () => {
  const base = now;
  const tight = { maxRequests: 1, windowMs: 1_000 };

  assert.equal(checkRateLimit("k", LONG).allowed, true);
  at(base + 5_000);
  // The long-window hit is 5s old: outside the tight window, so allowed.
  assert.equal(checkRateLimit("k", tight).allowed, true);
  at(base + 5_500);
  assert.equal(checkRateLimit("k", tight).allowed, false);
});

test("entries still expire once their longest window has passed", () => {
  const base = now;
  checkRateLimit("exp", LONG);
  checkRateLimit("exp", LONG);

  at(base + LONG.windowMs + 1);
  const result = checkRateLimit("exp", LONG);

  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 1);
});

test("a single limiter behaves as before", () => {
  const opts = { maxRequests: 2, windowMs: 1_000 };
  const base = now;

  assert.equal(checkRateLimit("solo", opts).remaining, 1);
  assert.equal(checkRateLimit("solo", opts).remaining, 0);
  const denied = checkRateLimit("solo", opts);
  assert.equal(denied.allowed, false);
  assert.equal(denied.retryAfterMs, 1_000);

  at(base + 1_001);
  assert.equal(checkRateLimit("solo", opts).allowed, true);
});
