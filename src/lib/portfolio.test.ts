import { test } from "node:test";
import { strict as assert } from "node:assert";
import { normalizePortfolioPayload } from "./portfolio.ts";

test("normalizePortfolioPayload: truncates labels to 256 chars", () => {
  const longLabel = "A".repeat(300);

  const payload = normalizePortfolioPayload(
    {
      allocation: [
        { label: longLabel, symbol: "TEST" },
      ],
    },
    "api",
  );

  assert.equal(payload.allocation[0].label.length, 256);
  assert.equal(payload.allocation[0].label, "A".repeat(256));
});

test("normalizePortfolioPayload: truncates symbols to 256 chars", () => {
  const longSymbol = "B".repeat(300);

  const payload = normalizePortfolioPayload(
    {
      allocation: [
        { label: "Test", symbol: longSymbol },
      ],
    },
    "api",
  );

  assert.equal(payload.allocation[0].symbol.length, 256);
});

test("normalizePortfolioPayload: truncates activity titles to 256 chars", () => {
  const longTitle = "C".repeat(300);

  const payload = normalizePortfolioPayload(
    {
      activity: [
        { title: longTitle, kind: "deposit" },
      ],
    },
    "api",
  );

  assert.equal(payload.activity[0].title.length, 256);
});

test("normalizePortfolioPayload: truncates activity details to 512 chars", () => {
  const longDetail = "D".repeat(600);

  const payload = normalizePortfolioPayload(
    {
      activity: [
        { detail: longDetail, kind: "deposit" },
      ],
    },
    "api",
  );

  assert.equal(payload.activity[0].detail.length, 512);
});

test("normalizePortfolioPayload: limits allocation array to 100 items", () => {
  const allocations = Array.from({ length: 150 }, (_, i) => ({
    label: `Asset ${i}`,
    symbol: `SYM${i}`,
  }));

  const payload = normalizePortfolioPayload(
    { allocation: allocations },
    "api",
  );

  assert.equal(payload.allocation.length, 100);
});

test("normalizePortfolioPayload: limits activity array to 100 items", () => {
  const activities = Array.from({ length: 150 }, (_, i) => ({
    title: `Event ${i}`,
    kind: "deposit",
  }));

  const payload = normalizePortfolioPayload(
    { activity: activities },
    "api",
  );

  assert.equal(payload.activity.length, 100);
});

test("normalizePortfolioPayload: preserves values under limits", () => {
  const label = "A".repeat(256); // Exactly at limit
  const detail = "D".repeat(512); // Exactly at limit

  const payload = normalizePortfolioPayload(
    {
      allocation: [{ label, symbol: "TEST" }],
      activity: [{ title: label, detail, kind: "deposit" }],
    },
    "api",
  );

  assert.equal(payload.allocation[0].label.length, 256);
  assert.equal(payload.activity[0].title.length, 256);
  assert.equal(payload.activity[0].detail.length, 512);
});

test("normalizePortfolioPayload: allows exactly 100 items", () => {
  const allocations = Array.from({ length: 100 }, (_, i) => ({
    label: `Asset ${i}`,
  }));

  const payload = normalizePortfolioPayload(
    { allocation: allocations },
    "api",
  );

  assert.equal(payload.allocation.length, 100);
});
