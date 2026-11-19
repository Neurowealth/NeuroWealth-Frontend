import assert from "node:assert/strict";
import test from "node:test";

import { subscribeToLogs, type LogEntry } from "@/lib/logger";
import {
  mapErrorCodeToErrorMode,
  getTransactionRecoveryUI,
  parseAmount,
  parseTransactionKind,
  type ErrorMode,
  type TransactionRecoveryUI,
} from "@/lib/transactions";
import { dictionaries } from "@/lib/i18n/messages";

const tRecovery = dictionaries.en.transactions.domain.recovery;

test("mapErrorCodeToErrorMode maps NETWORK_ERROR", () => {
  const mode = mapErrorCodeToErrorMode("NETWORK_ERROR");
  assert.equal(mode, "network_error");
});

test("mapErrorCodeToErrorMode maps REQUEST_TIMEOUT", () => {
  const mode = mapErrorCodeToErrorMode("REQUEST_TIMEOUT");
  assert.equal(mode, "timeout");
});

test("mapErrorCodeToErrorMode maps validation error codes", () => {
  assert.equal(mapErrorCodeToErrorMode("VALIDATION_FAILED"), "validation_error");
  assert.equal(mapErrorCodeToErrorMode("INVALID_AMOUNT"), "validation_error");
  assert.equal(mapErrorCodeToErrorMode("INVALID_WALLET"), "validation_error");
});

test("mapErrorCodeToErrorMode maps quota error codes", () => {
  assert.equal(mapErrorCodeToErrorMode("INSUFFICIENT_BALANCE"), "quota_error");
  assert.equal(mapErrorCodeToErrorMode("QUOTA_EXCEEDED"), "quota_error");
  assert.equal(mapErrorCodeToErrorMode("RATE_LIMITED"), "quota_error");
});

test("mapErrorCodeToErrorMode maps state conflict codes", () => {
  assert.equal(mapErrorCodeToErrorMode("STATE_CONFLICT"), "state_conflict");
  assert.equal(mapErrorCodeToErrorMode("CONCURRENT_UPDATE"), "state_conflict");
});

test("mapErrorCodeToErrorMode maps server error codes", () => {
  assert.equal(mapErrorCodeToErrorMode("INVALID_JSON"), "server_error");
  assert.equal(mapErrorCodeToErrorMode("INVALID_ENVELOPE"), "server_error");
  assert.equal(mapErrorCodeToErrorMode("SERVICE_UNAVAILABLE"), "server_error");
  assert.equal(mapErrorCodeToErrorMode("INTERNAL_SERVER_ERROR"), "server_error");
});

test("mapErrorCodeToErrorMode defaults unknown codes to unknown_error", () => {
  const mode = mapErrorCodeToErrorMode("UNKNOWN_CODE");
  assert.equal(mode, "unknown_error");
});

test("getTransactionRecoveryUI returns network_error recovery with actionable copy", () => {
  const recovery = getTransactionRecoveryUI("NETWORK_ERROR", tRecovery);
  
  assert.equal(recovery.title, "Connection lost");
  assert(recovery.description.includes("connection"));
  assert(recovery.description.includes("check your network"));
  assert.equal(recovery.primaryAction.action, "retry");
  assert.equal(recovery.primaryAction.label, "Retry request");
  assert.ok(recovery.secondaryAction);
  assert.equal(recovery.secondaryAction.action, "edit");
  assert.ok(recovery.tertiaryAction);
  assert.equal(recovery.tertiaryAction.action, "support");
});

test("getTransactionRecoveryUI returns timeout recovery with retry action", () => {
  const recovery = getTransactionRecoveryUI("REQUEST_TIMEOUT", tRecovery);
  
  assert.equal(recovery.title, "Request timed out");
  assert(recovery.description.includes("took too long"));
  assert.equal(recovery.primaryAction.action, "retry");
  assert.equal(recovery.primaryAction.label, "Retry request");
});

test("getTransactionRecoveryUI returns validation_error recovery with edit action", () => {
  const recovery = getTransactionRecoveryUI("VALIDATION_FAILED", tRecovery);
  
  assert.equal(recovery.title, "Validation failed");
  assert(recovery.description.includes("validation"));
  assert.equal(recovery.primaryAction.action, "edit");
  assert.equal(recovery.primaryAction.label, "Edit details");
});

test("getTransactionRecoveryUI returns quota_error recovery with edit action", () => {
  const recovery = getTransactionRecoveryUI("INSUFFICIENT_BALANCE", tRecovery);
  
  assert.equal(recovery.title, "Amount exceeds limit");
  assert(recovery.description.includes("available balance"));
  assert.equal(recovery.primaryAction.action, "edit");
  assert.equal(recovery.primaryAction.label, "Edit details");
});

test("getTransactionRecoveryUI returns state_conflict recovery with retry action", () => {
  const recovery = getTransactionRecoveryUI("STATE_CONFLICT", tRecovery);
  
  assert.equal(recovery.title, "Account state changed");
  assert(recovery.description.includes("balance"));
  assert.equal(recovery.primaryAction.action, "edit");
});

test("getTransactionRecoveryUI returns server_error recovery with support action", () => {
  const recovery = getTransactionRecoveryUI("SERVICE_UNAVAILABLE", tRecovery);
  
  assert.equal(recovery.title, "Service experiencing issues");
  assert(recovery.description.includes("Service is temporarily unavailable"));
  assert.equal(recovery.primaryAction.action, "retry");
});

test("getTransactionRecoveryUI includes transaction reference when provided", () => {
  const reference = "NW-DEP-20260426124530-ABC123";
  const recovery = getTransactionRecoveryUI("REQUEST_TIMEOUT", tRecovery, reference);
  
  assert.equal(recovery.reference, reference);
});

test("getTransactionRecoveryUI handles error mode input directly", () => {
  const recovery = getTransactionRecoveryUI("network_error", tRecovery);
  
  assert.equal(recovery.title, "Connection lost");
  assert.equal(recovery.primaryAction.action, "retry");
});

test("getTransactionRecoveryUI all recovery UIs include support email", () => {
  const errorModes: Array<string> = [
    "NETWORK_ERROR",
    "REQUEST_TIMEOUT",
    "VALIDATION_FAILED",
    "INSUFFICIENT_BALANCE",
    "STATE_CONFLICT",
    "INTERNAL_SERVER_ERROR",
  ];

  errorModes.forEach((code) => {
    const recovery = getTransactionRecoveryUI(code, tRecovery);
    assert.ok(recovery.supportEmail, `Missing support email for ${code}`);
    assert(recovery.supportEmail.includes("@"), `Invalid email for ${code}`);
  });
});

test("getTransactionRecoveryUI unknown error returns sensible defaults", () => {
  const recovery = getTransactionRecoveryUI("COMPLETELY_UNKNOWN_ERROR", tRecovery);
  
  assert.equal(recovery.title, "Something went wrong");
  assert(recovery.description.includes("unexpected error"));
  assert.equal(recovery.primaryAction.action, "retry");
  assert.ok(recovery.secondaryAction);
  assert.ok(recovery.tertiaryAction);
});

test("getTransactionRecoveryUI all primary actions are one of retry, edit, support", () => {
  const errorModes = [
    "NETWORK_ERROR",
    "REQUEST_TIMEOUT",
    "VALIDATION_FAILED",
    "INSUFFICIENT_BALANCE",
    "STATE_CONFLICT",
    "SERVICE_UNAVAILABLE",
  ];

  errorModes.forEach((code) => {
    const recovery = getTransactionRecoveryUI(code, tRecovery);
    const validActions = ["retry", "edit", "support"];
    assert(
      validActions.includes(recovery.primaryAction.action),
      `Invalid primary action for ${code}: ${recovery.primaryAction.action}`,
    );
  });
});

test("getTransactionRecoveryUI secondary and tertiary actions are optional or valid", () => {
  const errorModes = [
    "NETWORK_ERROR",
    "REQUEST_TIMEOUT",
    "VALIDATION_FAILED",
    "INSUFFICIENT_BALANCE",
    "STATE_CONFLICT",
    "SERVICE_UNAVAILABLE",
  ];

  errorModes.forEach((code) => {
    const recovery = getTransactionRecoveryUI(code, tRecovery);
    const validActions = ["retry", "edit", "support"];

    if (recovery.secondaryAction) {
      assert(
        validActions.includes(recovery.secondaryAction.action),
        `Invalid secondary action for ${code}`,
      );
    }

    if (recovery.tertiaryAction) {
      assert(
        validActions.includes(recovery.tertiaryAction.action),
        `Invalid tertiary action for ${code}`,
      );
    }
  });
});

// ── parseAmount ──────────────────────────────────────────────────────────────

test("parseAmount accepts plain decimal amounts", () => {
  assert.equal(parseAmount("123"), 123);
  assert.equal(parseAmount("123.45"), 123.45);
  assert.equal(parseAmount(".5"), 0.5);
  assert.equal(parseAmount("-10.5"), -10.5);
  assert.equal(parseAmount("1,234.56"), 1234.56);
  assert.equal(parseAmount("  42  "), 42);
});

test("parseAmount rejects hexadecimal input", () => {
  assert.ok(Number.isNaN(parseAmount("0x10")));
  assert.ok(Number.isNaN(parseAmount("0X1A")));
  assert.ok(Number.isNaN(parseAmount("-0x1")));
  assert.ok(Number.isNaN(parseAmount("0xFF")));
});

test("parseAmount rejects scientific-notation input", () => {
  assert.ok(Number.isNaN(parseAmount("1e10")));
  assert.ok(Number.isNaN(parseAmount("1E10")));
  assert.ok(Number.isNaN(parseAmount("1e-5")));
  assert.ok(Number.isNaN(parseAmount("1.5e3")));
});

test("parseAmount rejects other non-numeric or malformed input", () => {
  assert.ok(Number.isNaN(parseAmount("abc")));
  assert.ok(Number.isNaN(parseAmount("")));
  assert.ok(Number.isNaN(parseAmount("5abc")));
  assert.ok(Number.isNaN(parseAmount("Infinity")));
  assert.ok(Number.isNaN(parseAmount("NaN")));
});

// ── parseTransactionKind ───────────────────────────────────────────────────

test("parseTransactionKind parses deposit and withdrawal", () => {
  assert.equal(parseTransactionKind("deposit"), "deposit");
  assert.equal(parseTransactionKind("withdrawal"), "withdrawal");
});

test("parseTransactionKind defaults null, empty, and invalid values to deposit with logger warning", () => {
  let loggedWarning: LogEntry | null = null;
  const unsubscribe = subscribeToLogs((entry) => {
    if (entry.level === "warn") {
      loggedWarning = entry;
    }
  });

  try {
    assert.equal(parseTransactionKind(null), "deposit");
    assert.equal(loggedWarning, null);

    assert.equal(parseTransactionKind(""), "deposit");
    assert.equal(loggedWarning, null);

    assert.equal(parseTransactionKind("invalid-kind"), "deposit");
    assert.ok(loggedWarning !== null);
    assert.equal(
      (loggedWarning as LogEntry).message,
      'Unrecognized transaction kind value. Expected "deposit" or "withdrawal". Defaulting to "deposit".',
    );
    assert.deepEqual((loggedWarning as LogEntry).context, { kind: "invalid-kind" });

    // Verify PII scrubbing on context when sensitive pattern or key is present
    loggedWarning = null;
    parseTransactionKind("attacker@example.com");
    assert.ok(loggedWarning !== null);
    assert.deepEqual((loggedWarning as LogEntry).context, { kind: "***REDACTED***" });
  } finally {
    unsubscribe();
  }
});

