import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "./route";
import { NextRequest } from "next/server";

const VALID_SESSION_COOKIE = encodeURIComponent(
  JSON.stringify({ token: "test_token", expiresAt: Date.now() + 3600 * 1000 }),
);

function makeRequest(scenario?: string, authenticated = true): NextRequest {
  const url = scenario
    ? `http://localhost:3000/api/portfolio?scenario=${scenario}`
    : "http://localhost:3000/api/portfolio";
  const headers = new Headers();
  if (authenticated) {
    headers.set("Cookie", `nw_session=${VALID_SESSION_COOKIE}`);
  }
  return new NextRequest(url, { headers });
}

test("GET /api/portfolio returns 401 when unauthenticated", async () => {
  const req = makeRequest("live", false);
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "UNAUTHORIZED");
});

test("GET /api/portfolio returns 200 with valid scenario", async () => {
  const req = makeRequest("live");
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data);
});

test("GET /api/portfolio returns 200 with no scenario", async () => {
  const req = makeRequest();
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
});

test("GET /api/portfolio returns 400 for invalid scenario", async () => {
  const req = makeRequest("invalid-scenario");
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("GET /api/portfolio sandbox scenarios return demo data", async () => {
  const scenarios = ["empty", "loading", "partial-failure", "timeout"];

  for (const scenario of scenarios) {
    const req = makeRequest(scenario);
    const res = await GET(req);
    const body = await res.json();

    assert.equal(res.status, 200, `Scenario ${scenario} should return 200`);
    assert.equal(body.success, true, `Scenario ${scenario} should be successful`);
  }
});

test("GET /api/portfolio normalizes real backend responses when NEUROWEALTH_API_BASE_URL is set", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";
  
  const originalFetch = global.fetch;
  
  try {
    global.fetch = async (input, init) => {
      return new Response(
        JSON.stringify({
          portfolio: {
            balance: 5000,
            yield: 100,
            apy: 2,
            strategy: "growth",
            strategyLabel: "Growth Strategy",
            strategyDescription: "Test",
          },
          assets: [
            { asset: "BTC", value: 3000, weight: 60, changePercent: 5, chartTone: "primary" },
            { asset: "ETH", value: 2000, weight: 40, changePercent: -2, chartTone: "accent" }
          ],
          history: [
            { type: "deposit", name: "Deposit", description: "First deposit", createdAt: "2023-01-01T00:00:00.000Z", amount: 5000, status: "completed" }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const req = makeRequest("live");
    const res = await GET(req);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.source, "api");
    assert.equal(body.data.summary.totalBalance, 5000);
    assert.equal(body.data.summary.totalYield, 100);
    assert.equal(body.data.summary.apy, 2);
    assert.equal(body.data.summary.strategy, "growth");
    assert.equal(body.data.allocation.length, 2);
    assert.equal(body.data.allocation[0].symbol, "BTC");
    assert.equal(body.data.allocation[0].amount, 3000);
    assert.equal(body.data.allocation[0].share, 60);
    assert.equal(body.data.activity.length, 1);
    assert.equal(body.data.activity[0].kind, "deposit");
  } finally {
    process.env.NEUROWEALTH_API_BASE_URL = originalEnv;
    global.fetch = originalFetch;
  }
});
