import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeAnalyticsParams } from "@/lib/analytics";

test("sanitizeAnalyticsParams strips userId from auth events", () => {
  const result = sanitizeAnalyticsParams("auth_sign_in", {
    userId: "u1",
    method: "password",
  });

  assert.deepEqual(result, { method: "password" });
});

test("sanitizeAnalyticsParams returns undefined for auth events with only PII params", () => {
  const result = sanitizeAnalyticsParams("auth_sign_up_failed");
  assert.equal(result, undefined);
});

test("sanitizeAnalyticsParams scrubs PII from non-auth events", () => {
  const result = sanitizeAnalyticsParams("notification_read", {
    id: "n1",
    email: "user@example.com",
  }) as Record<string, unknown>;

  assert.equal(result.id, "n1");
  assert.equal(result.email, "***REDACTED***");
});
