import assert from "node:assert/strict";
import test from "node:test";

import {
  checkRateLimit,
  clearRateLimitStore,
  getRateLimitKey,
} from "@/lib/rate-limit";

test.beforeEach(() => {
  clearRateLimitStore();
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
  assert.equal(key, "anonymous");
});

test("checkRateLimit limits requests when threshold is exceeded", () => {
  const key = "test-client-1";
  const options = { maxRequests: 3, windowMs: 10_000 };

  const res1 = checkRateLimit(key, options);
  assert.equal(res1.success, true);
  assert.equal(res1.remaining, 2);

  const res2 = checkRateLimit(key, options);
  assert.equal(res2.success, true);
  assert.equal(res2.remaining, 1);

  const res3 = checkRateLimit(key, options);
  assert.equal(res3.success, true);
  assert.equal(res3.remaining, 0);

  const res4 = checkRateLimit(key, options);
  assert.equal(res4.success, false);
  assert.equal(res4.remaining, 0);
});
