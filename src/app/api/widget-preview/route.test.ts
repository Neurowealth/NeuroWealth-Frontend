import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "./route";

function makeRequest(params?: Record<string, string>): Request {
  const url = new URL("http://localhost:3000/api/widget-preview");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return new Request(url.toString());
}

test("GET /api/widget-preview sets the expected Cache-Control header", async () => {
  const res = await GET(makeRequest());

  assert.equal(
    res.headers.get("Cache-Control"),
    "public, s-maxage=86400, max-age=3600",
  );
});

test("GET /api/widget-preview sets the same Cache-Control header regardless of theme", async () => {
  const res = await GET(makeRequest({ theme: "dark" }));

  assert.equal(
    res.headers.get("Cache-Control"),
    "public, s-maxage=86400, max-age=3600",
  );
});
