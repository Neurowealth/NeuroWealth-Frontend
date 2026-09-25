/**
 * Tests for sandbox-scenario.ts
 *
 * Verifies that scenario overrides are correctly gated behind NODE_ENV checks
 * and that production environments always return "live".
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("parseSandboxScenario", () => {
  const originalEnv = process.env.NODE_ENV;

  // Helper to temporarily override NODE_ENV for testing
  function setNodeEnv(value: string | undefined) {
    if (value === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (process.env as any).NODE_ENV;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = value;
    }
  }

  afterEach(() => {
    // Restore original NODE_ENV
    setNodeEnv(originalEnv);
    
    // Clear the module cache to ensure fresh imports
    delete require.cache[require.resolve("./sandbox-scenario")];
  });

  it("returns the correct scenario in non-production environments", () => {
    setNodeEnv("development");
    
    // Re-import after setting NODE_ENV
    const { parseSandboxScenario, isSandboxScenario } = require("./sandbox-scenario");
    
    assert.strictEqual(parseSandboxScenario("empty"), "empty");
    assert.strictEqual(parseSandboxScenario("loading"), "loading");
    assert.strictEqual(parseSandboxScenario("partial-failure"), "partial-failure");
    assert.strictEqual(parseSandboxScenario("timeout"), "timeout");
    assert.strictEqual(parseSandboxScenario("live"), "live");
    assert.strictEqual(parseSandboxScenario(null), "live");
    assert.strictEqual(parseSandboxScenario(undefined), "live");
    assert.strictEqual(parseSandboxScenario("unknown"), "live");
  });

  it("ignores all scenario overrides in production and returns live", () => {
    setNodeEnv("production");
    
    // Re-import after setting NODE_ENV
    const { parseSandboxScenario } = require("./sandbox-scenario");
    
    assert.strictEqual(parseSandboxScenario("empty"), "live");
    assert.strictEqual(parseSandboxScenario("loading"), "live");
    assert.strictEqual(parseSandboxScenario("partial-failure"), "live");
    assert.strictEqual(parseSandboxScenario("timeout"), "live");
    assert.strictEqual(parseSandboxScenario("live"), "live");
    assert.strictEqual(parseSandboxScenario(null), "live");
    assert.strictEqual(parseSandboxScenario(undefined), "live");
  });
});

describe("isSandboxScenario", () => {
  it("returns true for sandbox scenarios", () => {
    const { isSandboxScenario } = require("./sandbox-scenario");
    
    assert.strictEqual(isSandboxScenario("empty"), true);
    assert.strictEqual(isSandboxScenario("loading"), true);
    assert.strictEqual(isSandboxScenario("partial-failure"), true);
    assert.strictEqual(isSandboxScenario("timeout"), true);
  });

  it("returns false for live scenario", () => {
    const { isSandboxScenario } = require("./sandbox-scenario");
    
    assert.strictEqual(isSandboxScenario("live"), false);
  });
});
