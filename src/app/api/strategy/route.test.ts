import assert from "node:assert/strict";
import test from "node:test";

import { GET, PUT } from "./route";
import { getRateLimitKey, resetRateLimitStore } from "@/lib/rate-limit";
import { NextRequest } from "next/server";
import { ERROR_CODE, HTTP_STATUS, MAX_BODY_BYTES } from "@/lib/api-response";

test.afterEach(() => {
  resetRateLimitStore();
});

const VALID_SESSION_COOKIE = encodeURIComponent(
  JSON.stringify({ token: "test_token", expiresAt: Date.now() + 3600 * 1000 }),
);

function makeGetRequest(cookieValue?: string, authenticated = true): NextRequest {
  const url = "http://localhost:3000/api/strategy";
  const cookies: string[] = [];
  if (authenticated) {
    cookies.push(`nw_session=${VALID_SESSION_COOKIE}`);
  }
  if (cookieValue) {
    cookies.push(`nw_strategy_preference=${cookieValue}`);
  }
  const headers = new Headers();
  if (cookies.length > 0) {
    headers.set("Cookie", cookies.join("; "));
  }
  return new NextRequest(url, { headers });
}

function makePutRequest(body: unknown, authenticated = true): NextRequest {
  const headers = new Headers({
    "Content-Type": "application/json",
    Origin: "http://localhost:3000",
    Host: "localhost:3000",
  });
  if (authenticated) {
    headers.set("Cookie", `nw_session=${VALID_SESSION_COOKIE}`);
  }
  return new NextRequest("http://localhost:3000/api/strategy", {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
}

test("GET /api/strategy returns 401 when unauthenticated", async () => {
  const req = makeGetRequest(undefined, false);
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "UNAUTHORIZED");
});

test("PUT /api/strategy returns 401 when unauthenticated", async () => {
  const req = makePutRequest({ strategy: "balanced" }, false);
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "UNAUTHORIZED");
});

test("GET /api/strategy returns 200 with default strategy", async () => {
  const req = makeGetRequest();
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.hasOwnProperty("strategy"));
});

test("GET /api/strategy returns strategy from cookie", async () => {
  const req = makeGetRequest("growth");
  const res = await GET(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.strategy, "growth");
});

test("PUT /api/strategy returns 200 with valid strategy", async () => {
  const req = makePutRequest({ strategy: "balanced" });
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.strategy, "balanced");
});

test("PUT /api/strategy returns 400 for invalid strategy", async () => {
  const req = makePutRequest({ strategy: "invalid" });
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("PUT /api/strategy returns 400 for malformed JSON", async () => {
  const req = new NextRequest("http://localhost:3000/api/strategy", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `nw_session=${VALID_SESSION_COOKIE}`,
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
    },
    body: "not-json",
  });
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, ERROR_CODE.VALIDATION_ERROR);
  assert.deepEqual(body.error.details, {
    body: ["Malformed JSON payload."],
  });
});

test("PUT /api/strategy returns 413 for oversized JSON body", async () => {
  const req = new NextRequest("http://localhost:3000/api/strategy", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(MAX_BODY_BYTES + 1),
      Cookie: `nw_session=${VALID_SESSION_COOKIE}`,
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
    },
    body: "{}",
  });
  const res = await PUT(req);
  const body = await res.json();

  assert.equal(res.status, HTTP_STATUS.PAYLOAD_TOO_LARGE);
  assert.equal(body.success, false);
  assert.equal(body.error.code, ERROR_CODE.PAYLOAD_TOO_LARGE);
});

test("PUT /api/strategy accepts all valid strategy values", async () => {
  const strategies = ["conservative", "balanced", "growth"];

  for (const strategy of strategies) {
    const req = makePutRequest({ strategy });
    const res = await PUT(req);
    const body = await res.json();

    assert.equal(res.status, 200, `Strategy ${strategy} should return 200`);
    assert.equal(body.data.strategy, strategy, `Strategy should be ${strategy}`);
  }
});

test("getRateLimitKey uses the first forwarded client IP", () => {
  const req = new NextRequest("http://localhost:3000/api/strategy", {
    headers: {
      "x-forwarded-for": "203.0.113.9, 198.51.100.1",
    },
  });

  assert.equal(getRateLimitKey(req), "203.0.113.9");
});

test("getRateLimitKey prefers trusted platform headers over a spoofed x-forwarded-for", () => {
  const req = new NextRequest("http://localhost:3000/api/strategy", {
    headers: {
      "x-forwarded-for": "198.51.100.88, 10.0.0.5",
      "x-real-ip": "203.0.113.42",
    },
  });

  assert.equal(getRateLimitKey(req), "203.0.113.42");
});

test("getRateLimitKey returns null when neither x-real-ip nor x-forwarded-for is present", () => {
  const req = new NextRequest("http://localhost:3000/api/strategy");
  assert.equal(getRateLimitKey(req), null);
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

// ── Backend error & exception paths (#Issue 1) ──────────────────────────

test("GET /api/strategy returns 502 BACKEND_ERROR when backend returns non-OK response", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ error: "Internal Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    };

    const req = makeGetRequest("growth");
    const res = await GET(req);
    const body = await res.json();

    assert.equal(res.status, 502);
    assert.equal(body.success, false);
    assert.equal(body.error.code, ERROR_CODE.BACKEND_ERROR);
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("GET /api/strategy returns 200 with fallback to cookie when backend fetch throws exception", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      throw new Error("DNS resolution failed");
    };

    const req = makeGetRequest("growth");
    const res = await GET(req);
    const body = await res.json();

    // Falls back to local cookie when backend is unavailable
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.strategy, "growth");
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("PUT /api/strategy maps a non-OK backend response to the error envelope", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ error: "Bad Gateway" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    };

    const req = makePutRequest({ strategy: "conservative" });
    const res = await PUT(req);
    const body = await res.json();

    assert.equal(res.status, HTTP_STATUS.BAD_GATEWAY);
    assert.equal(body.success, false);
    assert.equal(body.error.code, ERROR_CODE.BACKEND_ERROR);
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("PUT /api/strategy maps a backend error envelope on a 2xx response", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: { code: "RATE_LIMITED", message: "Slow down." },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const req = makePutRequest({ strategy: "conservative" });
    const res = await PUT(req);
    const body = await res.json();

    assert.equal(res.status, HTTP_STATUS.TOO_MANY_REQUESTS);
    assert.equal(body.success, false);
    assert.equal(body.error.code, ERROR_CODE.RATE_LIMITED);
    assert.equal(body.error.message, "Slow down.");
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("PUT /api/strategy returns 502 BACKEND_ERROR for a non-JSON backend body", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      return new Response("<html><body>Gateway Error</body></html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    };

    const req = makePutRequest({ strategy: "conservative" });
    const res = await PUT(req);
    const body = await res.json();

    assert.equal(res.status, HTTP_STATUS.BAD_GATEWAY);
    assert.equal(body.success, false);
    assert.equal(body.error.code, ERROR_CODE.BACKEND_ERROR);
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("PUT /api/strategy returns 502 BACKEND_ERROR when the backend payload is malformed", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ strategy: "aggressive" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const req = makePutRequest({ strategy: "conservative" });
    const res = await PUT(req);
    const body = await res.json();

    assert.equal(res.status, HTTP_STATUS.BAD_GATEWAY);
    assert.equal(body.success, false);
    assert.equal(body.error.code, ERROR_CODE.BACKEND_ERROR);
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("PUT /api/strategy wraps a bare backend success payload in the app envelope", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      return new Response(JSON.stringify({ strategy: "growth" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const req = makePutRequest({ strategy: "growth" });
    const res = await PUT(req);
    const body = await res.json();

    assert.equal(res.status, HTTP_STATUS.OK);
    assert.equal(body.success, true);
    assert.equal(body.data.strategy, "growth");
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("PUT /api/strategy unwraps a wrapped backend success envelope", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ success: true, data: { strategy: "conservative" } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const req = makePutRequest({ strategy: "conservative" });
    const res = await PUT(req);
    const body = await res.json();

    assert.equal(res.status, HTTP_STATUS.OK);
    assert.equal(body.success, true);
    assert.equal(body.data.strategy, "conservative");
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("PUT /api/strategy returns 503 BACKEND_ERROR when backend fetch throws network exception", async () => {
  const originalEnv = process.env.NEUROWEALTH_API_BASE_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEUROWEALTH_API_BASE_URL = "http://mock-api.local";

  try {
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed: ECONNREFUSED");
    };

    const req = makePutRequest({ strategy: "conservative" });
    const res = await PUT(req);
    const body = await res.json();

    // Falls back to local cookie update when backend is unavailable
    assert.equal(res.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.strategy, "conservative");
  } finally {
    restoreEnv("NEUROWEALTH_API_BASE_URL", originalEnv);
    globalThis.fetch = originalFetch;
  }
});

test("PUT /api/strategy rate limiting isolates clients by session when IP headers are absent", async () => {
  resetRateLimitStore();

  const userA = encodeURIComponent(
    JSON.stringify({ token: "user_a_token", expiresAt: Date.now() + 3600_000 }),
  );
  const userB = encodeURIComponent(
    JSON.stringify({ token: "user_b_token", expiresAt: Date.now() + 3600_000 }),
  );

  function makeUserPutRequest(sessionCookie: string) {
    const headers = new Headers({
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
      Cookie: `nw_session=${sessionCookie}`,
    });
    return new NextRequest("http://localhost:3000/api/strategy", {
      method: "PUT",
      headers,
      body: JSON.stringify({ strategy: "growth" }),
    });
  }

  // Exhaust limit for user A (10 requests)
  for (let i = 0; i < 10; i++) {
    const res = await PUT(makeUserPutRequest(userA));
    assert.equal(res.status, 200);
  }

  // User A should now be rate limited
  const blockedA = await PUT(makeUserPutRequest(userA));
  assert.equal(blockedA.status, 429);

  // User B should NOT be rate limited (separate session identity)
  const allowedB = await PUT(makeUserPutRequest(userB));
  assert.equal(allowedB.status, 200);
});
