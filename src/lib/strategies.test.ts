import assert from "node:assert/strict";
import test from "node:test";

import {
  parseStrategyKind,
  STRATEGIES,
  COMPARISON_ROWS,
} from "./strategies";

test("parseStrategyKind parses valid strategy kinds", () => {
  assert.equal(parseStrategyKind("conservative"), "conservative");
  assert.equal(parseStrategyKind("balanced"), "balanced");
  assert.equal(parseStrategyKind("growth"), "growth");
});

test("parseStrategyKind returns null for invalid or null inputs", () => {
  assert.equal(parseStrategyKind(null), null);
  assert.equal(parseStrategyKind("aggressive"), null);
  assert.equal(parseStrategyKind(""), null);
});

test("STRATEGIES contains all 3 core strategies", () => {
  assert.equal(STRATEGIES.length, 3);
  const kinds = STRATEGIES.map((s) => s.kind);
  assert.ok(kinds.includes("conservative"));
  assert.ok(kinds.includes("balanced"));
  assert.ok(kinds.includes("growth"));
});

test("COMPARISON_ROWS is non-empty", () => {
  assert.ok(COMPARISON_ROWS.length > 0);
});
