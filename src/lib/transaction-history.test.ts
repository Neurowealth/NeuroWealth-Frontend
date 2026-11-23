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
    pageSize: 10,
  });

  assert.ok(page.items.every((item) => item.kind === "deposit"));
});
