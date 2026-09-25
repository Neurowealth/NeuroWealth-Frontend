import assert from "node:assert/strict";
import test from "node:test";

import { isLogLevelEnabled, scrubPII } from "@/lib/logger";

const originalEnv = { ...process.env };

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test("scrubPII redacts sensitive keys", () => {
  const result = scrubPII({
    email: "user@example.com",
    operation: "sign_in",
    nested: { token: "abc123", count: 1 },
  }) as Record<string, unknown>;

  assert.equal(result.email, "***REDACTED***");
  assert.equal(result.operation, "sign_in");
  assert.equal((result.nested as Record<string, unknown>).token, "***REDACTED***");
  assert.equal((result.nested as Record<string, unknown>).count, 1);
});

test("scrubPII redacts error and stack fields regardless of content", () => {
  const result = scrubPII({
    error: "Cannot read properties of undefined (reading 'foo')",
    stack: "Error: boom\n    at /Users/dev/app/src/lib/thing.ts:42:7",
    code: "UNKNOWN_ERROR",
  }) as Record<string, unknown>;

  assert.equal(result.error, "***REDACTED***");
  assert.equal(result.stack, "***REDACTED***");
  assert.equal(result.code, "UNKNOWN_ERROR");
});

test("scrubPII redacts email patterns in string values", () => {
  const result = scrubPII("Contact user@example.com for help");
  assert.equal(result, "Contact ***REDACTED*** for help");
});

test("isLogLevelEnabled respects NEXT_PUBLIC_LOG_LEVEL=silent", () => {
  process.env.NEXT_PUBLIC_LOG_LEVEL = "silent";
  assert.equal(isLogLevelEnabled("error"), false);
});

test("isLogLevelEnabled defaults to warn minimum in production", () => {
  Object.defineProperty(process.env, "NODE_ENV", { value: "production", writable: true, configurable: true });
  delete process.env.NEXT_PUBLIC_LOG_LEVEL;
  assert.equal(isLogLevelEnabled("info"), false);
  assert.equal(isLogLevelEnabled("warn"), true);
  assert.equal(isLogLevelEnabled("error"), true);
});
