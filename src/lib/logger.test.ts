import assert from "node:assert/strict";
import test from "node:test";

import { isLogLevelEnabled, logger, scrubPII, subscribeToLogs, type LogEntry } from "@/lib/logger";

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

test("scrubPII redacts Stellar and EVM wallet addresses in string values", () => {
  const stellar = "Account GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G not found";
  assert.equal(scrubPII(stellar), "Account ***REDACTED*** not found");

  const evm = "Account 0x1234567890123456789012345678901234567890 connected";
  assert.equal(scrubPII(evm), "Account ***REDACTED*** connected");
});

test("logger redacts address embedded in a message", () => {
  let captured: LogEntry | undefined;
  const unsubscribe = subscribeToLogs((entry) => {
    captured = entry;
  });

  const address = "GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G";
  logger.info(`Account ${address} not found. Fund it with XLM.`);
  unsubscribe();

  assert.ok(captured);
  assert.equal(
    captured.message,
    "Account ***REDACTED*** not found. Fund it with XLM."
  );
  assert.equal(captured.message.includes(address), false);
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
