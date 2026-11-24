import assert from "node:assert/strict";
import test from "node:test";

import {
  parseHistoryKind,
  parseHistoryStatus,
  filterAndPaginateHistory,
  MOCK_HISTORY_ITEMS,
} from "./transaction-history";

test("parseHistoryKind parses valid kinds or defaults to all", () => {
  assert.equal(parseHistoryKind("deposit"), "deposit");
  assert.equal(parseHistoryKind("withdrawal"), "withdrawal");
  assert.equal(parseHistoryKind("rebalance"), "rebalance");
  assert.equal(parseHistoryKind("all"), "all");
  assert.equal(parseHistoryKind(null), "all");
  assert.equal(parseHistoryKind("invalid"), "all");
});

test("parseHistoryStatus parses valid statuses or defaults to all", () => {
  assert.equal(parseHistoryStatus("success"), "success");
  assert.equal(parseHistoryStatus("pending"), "pending");
  assert.equal(parseHistoryStatus("failed"), "failed");
  assert.equal(parseHistoryStatus("all"), "all");
  assert.equal(parseHistoryStatus(null), "all");
  assert.equal(parseHistoryStatus("invalid"), "all");
});

test("filterAndPaginateHistory filters and paginates items", () => {
  const page = filterAndPaginateHistory({
    kind: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
    pageSize: 10,
  });

  assert.equal(page.page, 1);
  assert.equal(page.pageSize, 10);
  assert.equal(page.items.length, 10);
  assert.equal(page.total, MOCK_HISTORY_ITEMS.length);
  assert.ok(page.totalPages > 1);
});

test("filterAndPaginateHistory filters by kind deposit", () => {
  const page = filterAndPaginateHistory({
    kind: "deposit",
    status: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
    pageSize: 50,
  });

  assert.ok(page.items.every((item) => item.kind === "deposit"));
});

test("every generated transaction has title/detail that matches its status", () => {
  const statusKeywords = {
    success: ["confirmed", "executed", "settled", "cleared"],
    pending: ["pending", "awaiting", "queued", "submitted"],
    failed: ["failed", "expired", "timeout"],
  };

  for (const item of MOCK_HISTORY_ITEMS) {
    const lowerTitle = item.title.toLowerCase();
    const lowerDetail = item.detail.toLowerCase();
    const combined = `${lowerTitle} ${lowerDetail}`;

    // Check if the status matches the keywords in title/detail
    const expectedStatus = item.status;
    const matchesStatus = statusKeywords[expectedStatus].some((keyword) =>
      combined.includes(keyword),
    );

    assert.ok(
      matchesStatus,
      `Item ${item.id} has status "${expectedStatus}" but title/detail don't match: "${item.title}" / "${item.detail}"`,
    );
  }
});

test("failed transactions have no transaction hash", () => {
  const failed = MOCK_HISTORY_ITEMS.filter((item) => item.status === "failed");
  assert.ok(failed.length > 0, "Should have some failed transactions in mock data");

  for (const item of failed) {
    assert.equal(
      item.txHash,
      null,
      `Failed transaction ${item.id} should not have a txHash`,
    );
  }
});

test("pending transactions have no transaction hash", () => {
  const pending = MOCK_HISTORY_ITEMS.filter((item) => item.status === "pending");
  assert.ok(pending.length > 0, "Should have some pending transactions in mock data");

  for (const item of pending) {
    assert.equal(
      item.txHash,
      null,
      `Pending transaction ${item.id} should not have a txHash`,
    );
  }
});

test("success transactions have a transaction hash", () => {
  const success = MOCK_HISTORY_ITEMS.filter((item) => item.status === "success");
  assert.ok(success.length > 0, "Should have some successful transactions in mock data");

  for (const item of success) {
    assert.ok(
      item.txHash !== null && item.txHash.length === 64,
      `Success transaction ${item.id} should have a 64-char transaction hash`,
    );
  }
});
