import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "./route";
import { NextRequest } from "next/server";

const VALID_SESSION_COOKIE = encodeURIComponent(
  JSON.stringify({ token: "test_token", expiresAt: Date.now() + 3600 * 1000 }),
);

function makeRequest(params?: Record<string, string>, authenticated = true): NextRequest {
  const url = new URL("http://localhost:3000/api/transaction-history");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  const headers = new Headers();
  if (authenticated) {
    headers.set("Cookie", `nw_session=${VALID_SESSION_COOKIE}`);
  }
  return new NextRequest(url.toString(), { headers });
}

test("GET /api/transaction-history returns 401 when unauthenticated", async () => {
  const req = makeRequest(undefined, false);
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "UNAUTHORIZED");
});

test("GET /api/transaction-history returns 200 with default params", async () => {
  const req = makeRequest();
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data);

  // Assert on actual response data structure
  assert.ok(Array.isArray(body.data.items));
  assert.ok(body.data.items.length > 0);
  assert.equal(typeof body.data.total, "number");
  assert.equal(typeof body.data.page, "number");
  assert.equal(typeof body.data.pageSize, "number");
  assert.equal(typeof body.data.totalPages, "number");

  // Verify default pagination
  assert.equal(body.data.page, 1);
  assert.equal(body.data.pageSize, 10);
  assert.ok(body.data.totalPages >= 1);
  assert.ok(body.data.items.length <= body.data.pageSize);
});

test("GET /api/transaction-history returns 200 with valid kind filter", async () => {
  const kinds = ["all", "deposit", "withdrawal", "rebalance"];

  for (const kind of kinds) {
    const req = makeRequest({ kind });
    const res = await GET(req);
    const body = await res.json();

    assert.equal(res.status, 200, `Kind ${kind} should return 200`);
    assert.equal(body.success, true);

    // Assert on actual data
    assert.ok(Array.isArray(body.data.items));
    assert.ok(body.data.items.length >= 0);

    // Verify all items match the kind filter
    if (kind !== "all") {
      body.data.items.forEach((item: { kind: string }) => {
        assert.equal(item.kind, kind, `Item should be of kind ${kind}`);
      });
    }

    // Verify totalPages calculation
    const expectedTotalPages = Math.max(
      1,
      Math.ceil(body.data.total / body.data.pageSize),
    );
    assert.equal(body.data.totalPages, expectedTotalPages);
  }
});

test("GET /api/transaction-history returns 200 with valid status filter", async () => {
  const statuses = ["all", "pending", "confirmed", "failed"];

  for (const status of statuses) {
    const req = makeRequest({ status });
    const res = await GET(req);
    const body = await res.json();

    assert.equal(res.status, 200, `Status ${status} should return 200`);
    assert.equal(body.success, true);
  }
});

test("GET /api/transaction-history returns 200 with pagination", async () => {
  const req = makeRequest({ page: "1", pageSize: "10" });
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);

  // Assert pagination data
  assert.equal(body.data.page, 1);
  assert.equal(body.data.pageSize, 10);
  assert.ok(body.data.items.length <= 10);
  assert.equal(
    body.data.totalPages,
    Math.max(1, Math.ceil(body.data.total / 10)),
  );

  // Verify items match page boundaries
  if (body.data.total > 10) {
    assert.equal(body.data.items.length, 10);
  }
});

test("GET /api/transaction-history returns 400 for invalid kind", async () => {
  const req = makeRequest({ kind: "invalid" });
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("GET /api/transaction-history returns 400 for invalid status", async () => {
  const req = makeRequest({ status: "invalid" });
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("GET /api/transaction-history returns 400 for invalid page", async () => {
  const req = makeRequest({ page: "0" });
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test("GET /api/transaction-history returns 400 for pageSize > 50", async () => {
  const req = makeRequest({ pageSize: "100" });
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test("GET /api/transaction-history returns 200 with date range", async () => {
  const req = makeRequest({
    dateFrom: "2026-01-01",
    dateTo: "2026-12-31",
  });
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);

  // Assert on returned data
  assert.ok(Array.isArray(body.data.items));
  assert.equal(typeof body.data.total, "number");
  assert.equal(typeof body.data.totalPages, "number");

  // Verify date boundary inclusivity
  // All items should be within the date range (inclusive on both ends)
  const dateFrom = new Date("2026-01-01");
  const dateTo = new Date("2026-12-31");
  dateTo.setDate(dateTo.getDate() + 1); // Date filter is exclusive of next day

  body.data.items.forEach((item: { occurredAt: string }) => {
    const itemDate = new Date(item.occurredAt);
    assert.ok(
      itemDate >= dateFrom && itemDate < dateTo,
      `Item date ${itemDate.toISOString()} should be within range`,
    );
  });
});
