import assert from "node:assert/strict";
import test from "node:test";

import {
  parseScenario,
  buildScenarioPayload,
  normalizePortfolioPayload,
} from "./portfolio";

test("parseScenario returns expected scenario or defaults to live", () => {
  assert.equal(parseScenario("empty"), "empty");
  assert.equal(parseScenario("loading"), "loading");
  assert.equal(parseScenario("partial-failure"), "partial-failure");
  assert.equal(parseScenario("timeout"), "timeout");
  assert.equal(parseScenario("live"), "live");
  assert.equal(parseScenario(null), "live");
  assert.equal(parseScenario("unknown-scenario"), "live");
});

test("buildScenarioPayload builds empty scenario correctly", () => {
  const payload = buildScenarioPayload("empty");
  assert.equal(payload.summary.totalBalance, 0);
  assert.equal(payload.allocation.length, 0);
  assert.equal(payload.activity.length, 0);
});

test("buildScenarioPayload builds live scenario with non-zero summary", () => {
  const payload = buildScenarioPayload("live");
  assert.ok(payload.summary.totalBalance > 0);
  assert.ok(payload.allocation.length > 0);
  assert.ok(payload.activity.length > 0);
});

test("normalizePortfolioPayload defaults missing fields safely", () => {
  const normalized = normalizePortfolioPayload({});
  assert.equal(normalized.summary.totalBalance, 0);
  assert.ok(Array.isArray(normalized.allocation));
  assert.ok(Array.isArray(normalized.activity));
});
