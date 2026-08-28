import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "./route";

function makeRequest(params?: Record<string, string>): Request {
  const url = new URL("http://localhost:3000/api/transaction-preview");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return new Request(url.toString());
}

test("GET /api/transaction-preview sets the expected Cache-Control header", async () => {
  const res = await GET(makeRequest());

  assert.equal(
    res.headers.get("Cache-Control"),
    "public, s-maxage=86400, max-age=3600",
  );
});

test("GET /api/transaction-preview sets the same Cache-Control header as /api/widget-preview", async () => {
  const res = await GET(makeRequest({ kind: "withdrawal" }));

  assert.equal(
    res.headers.get("Cache-Control"),
    "public, s-maxage=86400, max-age=3600",
  );
});
