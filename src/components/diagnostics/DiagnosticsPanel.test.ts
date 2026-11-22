import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  canAccessDiagnostics,
  getRedactedDiagnosticsEnv,
  isDiagnosticsBuildEnabled,
  REDACTED_VALUE,
  redactDiagnosticLog,
} from "./diagnostics-config";

const panelSource = readFileSync(
  new URL("./DiagnosticsPanel.tsx", import.meta.url),
  "utf8",
);

test("DiagnosticsPanel — uses auth context and canAccessDiagnostics gate", () => {
  assert.match(panelSource, /useAuth/);
  assert.match(panelSource, /canAccessDiagnostics/);
  assert.doesNotMatch(panelSource, /process\.env\.NODE_ENV\s*!==\s*["']production["']/);
});

test("build-config (production) — always disabled even with opt-in flag and admin role", () => {
  const prodNodeEnv = {
    NODE_ENV: "production",
    NEXT_PUBLIC_APP_ENV: "production",
    NEXT_PUBLIC_ENABLE_DIAGNOSTICS: "true",
  };
  assert.equal(isDiagnosticsBuildEnabled(prodNodeEnv), false);
  assert.equal(canAccessDiagnostics({ role: "admin" }, prodNodeEnv), false);

  const prodAppEnv = {
    NODE_ENV: "development",
    NEXT_PUBLIC_APP_ENV: "production",
    NEXT_PUBLIC_ENABLE_DIAGNOSTICS: "true",
  };
  assert.equal(isDiagnosticsBuildEnabled(prodAppEnv), false);
  assert.equal(canAccessDiagnostics({ role: "admin" }, prodAppEnv), false);
});

test("build-config (staging) — disabled by default and in production-mode staging builds", () => {
  const stagingDefault = {
    NODE_ENV: "development",
    NEXT_PUBLIC_APP_ENV: "staging",
  };
  assert.equal(isDiagnosticsBuildEnabled(stagingDefault), false);
  assert.equal(canAccessDiagnostics({ role: "admin" }, stagingDefault), false);

  const stagingProdBuild = {
    NODE_ENV: "production",
    NEXT_PUBLIC_APP_ENV: "staging",
    NEXT_PUBLIC_ENABLE_DIAGNOSTICS: "true",
  };
  assert.equal(isDiagnosticsBuildEnabled(stagingProdBuild), false);
  assert.equal(canAccessDiagnostics({ role: "admin" }, stagingProdBuild), false);

  const stagingOptIn = {
    NODE_ENV: "development",
    NEXT_PUBLIC_APP_ENV: "staging",
    NEXT_PUBLIC_ENABLE_DIAGNOSTICS: "true",
  };
  assert.equal(isDiagnosticsBuildEnabled(stagingOptIn), true);
  assert.equal(canAccessDiagnostics(null, stagingOptIn), false);
  assert.equal(canAccessDiagnostics({ role: "user" }, stagingOptIn), false);
  assert.equal(canAccessDiagnostics({ role: "admin" }, stagingOptIn), true);
});

test("build-config (development) — requires explicit opt-in flag and admin role", () => {
  const devDefault = {
    NODE_ENV: "development",
    NEXT_PUBLIC_APP_ENV: "development",
  };
  assert.equal(isDiagnosticsBuildEnabled(devDefault), false);
  assert.equal(canAccessDiagnostics({ role: "admin" }, devDefault), false);

  const devOptIn = {
    NODE_ENV: "development",
    NEXT_PUBLIC_APP_ENV: "development",
    NEXT_PUBLIC_ENABLE_DIAGNOSTICS: "true",
  };
  assert.equal(isDiagnosticsBuildEnabled(devOptIn), true);
  assert.equal(canAccessDiagnostics(null, devOptIn), false);
  assert.equal(canAccessDiagnostics({ role: "user" }, devOptIn), false);
  assert.equal(canAccessDiagnostics({ role: "admin" }, devOptIn), true);
});

test("diagnostics redaction — scrubs PII from log messages/context and redacts env details", () => {
  const redactedLog = redactDiagnosticLog({
    id: "log-1",
    timestamp: "2026-01-01T00:00:00.000Z",
    level: "error",
    message: "Failed for alice@example.com with Bearer secret-token-123",
    context: { email: "alice@example.com", stack: "Error: boom" },
  });

  assert.doesNotMatch(redactedLog.message, /alice@example\.com/);
  assert.doesNotMatch(redactedLog.message, /secret-token-123/);
  assert.deepEqual(redactedLog.context, {
    email: "***REDACTED***",
    stack: "***REDACTED***",
  });

  const redactedEnv = getRedactedDiagnosticsEnv();
  assert.equal(redactedEnv.nodeEnv, REDACTED_VALUE);
  assert.equal(redactedEnv.userAgent, REDACTED_VALUE);
});
