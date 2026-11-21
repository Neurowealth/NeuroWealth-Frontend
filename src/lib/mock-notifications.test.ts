/**
 * Mock notification timestamps must not depend on the wall clock, otherwise
 * server and client bundles disagree and hydration breaks (#1285).
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  MOCK_NOTIFICATIONS,
  MOCK_NOTIFICATIONS_REFERENCE_TIME,
} from "./mock-notifications";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

test("timestamps are fixed offsets from the reference time", () => {
  const expected = [5 * MINUTE, 2 * HOUR, DAY, 2 * DAY, 3 * DAY].map((ms) =>
    new Date(MOCK_NOTIFICATIONS_REFERENCE_TIME - ms).toISOString(),
  );

  assert.deepEqual(
    MOCK_NOTIFICATIONS.map((n) => n.timestamp),
    expected,
  );
});

test("timestamps are literal values that do not change with the clock", () => {
  assert.deepEqual(
    MOCK_NOTIFICATIONS.map((n) => n.timestamp),
    [
      "2026-01-15T11:55:00.000Z",
      "2026-01-15T10:00:00.000Z",
      "2026-01-14T12:00:00.000Z",
      "2026-01-13T12:00:00.000Z",
      "2026-01-12T12:00:00.000Z",
    ],
  );
});

test("the module never reads the wall clock", () => {
  const source = readFileSync(new URL("./mock-notifications.ts", import.meta.url), "utf8");
  assert.equal(/Date\.now\(|new Date\(\)/.test(source), false);
});

test("every timestamp is a valid ISO string", () => {
  for (const n of MOCK_NOTIFICATIONS) {
    assert.equal(new Date(n.timestamp).toISOString(), n.timestamp);
  }
});
