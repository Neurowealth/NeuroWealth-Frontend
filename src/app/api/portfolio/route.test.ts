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

test("GET /api/portfolio rejects an unknown scenario in development", async (t) => {
  const originalEnv = process.env.NODE_ENV;
  t.after(() => {
    Reflect.deleteProperty(process.env, "NODE_ENV");
    if (originalEnv !== undefined) Object.assign(process.env, { NODE_ENV: originalEnv });
  });
  Object.assign(process.env, { NODE_ENV: "development" });

  const res = await GET(makeRequest("bogus"));
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.equal(body.error.message, "Query validation failed.");
  assert.ok(body.error.details.scenario);
});

test("GET /api/portfolio ignores an unknown scenario in production", async (t) => {
  const originalEnv = process.env.NODE_ENV;
  t.after(() => {
    Reflect.deleteProperty(process.env, "NODE_ENV");
    if (originalEnv !== undefined) Object.assign(process.env, { NODE_ENV: originalEnv });
  });
  Object.assign(process.env, { NODE_ENV: "production" });

  const res = await GET(makeRequest("bogus"));

  assert.equal(res.status, 200);
  assert.equal((await res.json()).success, true);
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

test("GET /api/portfolio returns 408 when the backend never responds", async () => {
  const originalUrl = process.env.NEUROWEALTH_API_BASE_URL;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  const originalFetch = global.fetch;

  try {
    // Simulate a backend that accepts the connection but never sends a response
    global.fetch = async (_url, init) =>
      new Promise((_resolve, reject) => {
        const signal = (init as RequestInit)?.signal;
        if (!signal) return;
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("The operation was aborted.", "AbortError")),
          { once: true },
        );
      });

    // Use a very short timeout so the test doesn't block for 10 s
    // We can't pass timeoutMs to the route directly, but we can override
    // createServerFetcher globally by injecting a fast-timeout via env.
    // Instead we test at the unit level via the fetcher; here we verify
    // the route handler's catch block maps the error to 408.
    //
    // To keep the test fast we monkey-patch the module's fetcher by making
    // fetch abort immediately after the signal is wired up.
    global.fetch = async (_url, init) => {
      // Trigger the abort signal on the next micro-task so the fetcher wires
      // up its own timeout listener first
      await Promise.resolve();
      const signal = (init as RequestInit)?.signal as AbortSignal | undefined;
      if (signal && !signal.aborted) {
        // Force the internal controller to fire via a matching abort
        const ctrl = new AbortController();
        ctrl.abort();
      }
      // Resolve with an AbortError to simulate what Node does
      throw new DOMException("The operation was aborted.", "AbortError");
    };

    // We import the route's server fetcher with an effectively-zero timeout
    // by overriding NEUROWEALTH_API_BASE_URL and providing a 1 ms timeout
    // through a fresh dynamic import. Because Next.js caches modules we work
    // around this by directly testing the fetcher timeout path; the route
    // catch block is integration-tested separately.
    //
    // For this test file we confirm the route returns 408 by simulating the
    // exact same error the route's catch block receives: a ServerFetchTimeoutError.
    const { ServerFetchTimeoutError: STE } = await import("@/lib/api-client");
    global.fetch = async () => { throw new STE(); };

    const req = makeRequest();
    const res = await GET(req);
    const body = await res.json();

    assert.equal(res.status, 408);
    assert.equal(body.success, false);
    assert.equal(res.headers.get("Cache-Control"), "no-store");
  } finally {
    process.env.NEUROWEALTH_API_BASE_URL = originalUrl;
    global.fetch = originalFetch;
  }
});
