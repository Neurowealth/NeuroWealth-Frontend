import "@/test-utils/jsdom-setup";

import assert from "node:assert/strict";
import test from "node:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import {
  SandboxProvider,
  useSandbox,
  validateScenarioState,
  defaultScenarios,
} from "./SandboxContext";
import { STORAGE_KEYS } from "@/lib/storage-keys";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const originalSandboxFlag = process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX;

test.beforeEach(() => {
  process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX = "true";
});

test.afterEach(() => {
  localStorage.clear();
  process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX = originalSandboxFlag;
});

test("validateScenarioState — handles null input safely", () => {
  const result = validateScenarioState(null);
  assert.deepEqual(result, defaultScenarios);
});

test("validateScenarioState — handles array input safely", () => {
  const emptyArrayResult = validateScenarioState([]);
  assert.deepEqual(emptyArrayResult, defaultScenarios);

  const populatedArrayResult = validateScenarioState(["portfolio", "loading"]);
  assert.deepEqual(populatedArrayResult, defaultScenarios);
});

test("validateScenarioState — handles non-object primitive inputs safely", () => {
  assert.deepEqual(validateScenarioState("string-value"), defaultScenarios);
  assert.deepEqual(validateScenarioState(12345), defaultScenarios);
  assert.deepEqual(validateScenarioState(true), defaultScenarios);
  assert.deepEqual(validateScenarioState(undefined), defaultScenarios);
});

test("validateScenarioState — filters out unknown keys and merges missing defaults", () => {
  const invalidObject = {
    unknownModule: "loading",
    arbitraryField: 123,
    portfolio: "timeout",
    // history, transactions, notifications are missing
  };

  const result = validateScenarioState(invalidObject);
  assert.equal(result.portfolio, "timeout");
  assert.equal(result.history, defaultScenarios.history);
  assert.equal(result.transactions, defaultScenarios.transactions);
  assert.equal(result.notifications, defaultScenarios.notifications);
  assert.equal((result as Record<string, unknown>).unknownModule, undefined);
  assert.equal((result as Record<string, unknown>).arbitraryField, undefined);
});

test("validateScenarioState — rejects invalid scenario type values and keeps defaults", () => {
  const objectWithInvalidType = {
    portfolio: "malicious-code",
    history: "loading",
  };

  const result = validateScenarioState(objectWithInvalidType);
  assert.equal(result.portfolio, defaultScenarios.portfolio);
  assert.equal(result.history, "loading");
});

test("SandboxProvider — mounts safely when storage has null, array, or invalid object", () => {
  function SandboxProbe() {
    const { scenarios, getCurrentScenario } = useSandbox();
    return createElement(
      "div",
      { id: "probe" },
      `${scenarios.portfolio}:${getCurrentScenario("portfolio")}`
    );
  }

  // 1. Test when storage contains corrupted 'null'
  localStorage.setItem(STORAGE_KEYS.SANDBOX_SCENARIOS, "null");

  let container = document.createElement("div");
  document.body.appendChild(container);
  let root = createRoot(container);

  act(() => {
    root.render(createElement(SandboxProvider, null, createElement(SandboxProbe)));
  });
  assert.equal(container.textContent, "success:success");
  act(() => root.unmount());
  container.remove();

  // 2. Test when storage contains an array
  localStorage.setItem(STORAGE_KEYS.SANDBOX_SCENARIOS, JSON.stringify(["invalid", "array"]));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root.render(createElement(SandboxProvider, null, createElement(SandboxProbe)));
  });
  assert.equal(container.textContent, "success:success");
  act(() => root.unmount());
  container.remove();

  // 3. Test when storage contains an object with unknown and valid keys
  localStorage.setItem(
    STORAGE_KEYS.SANDBOX_SCENARIOS,
    JSON.stringify({ unknownKey: "foo", portfolio: "empty" })
  );
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root.render(createElement(SandboxProvider, null, createElement(SandboxProbe)));
  });
  assert.equal(container.textContent, "empty:empty");
  act(() => root.unmount());
  container.remove();
});
