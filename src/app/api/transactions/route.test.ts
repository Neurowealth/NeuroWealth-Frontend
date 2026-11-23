import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "./route";
import { resolveTransactionClientId } from "./client-id";
import { NextRequest } from "next/server";
import { getRateLimitKey, resetRateLimitStore } from "@/lib/rate-limit";
import { ERROR_CODE, HTTP_STATUS, MAX_BODY_BYTES } from "@/lib/api-response";

const VALID_SESSION_COOKIE = encodeURIComponent(
  JSON.stringify({ token: "test_token", expiresAt: Date.now() + 3600 * 1000 }),
);

function makePostRequest(
  body: unknown,
  scenario?: string,
  authenticated = true,
  extraCookies: string[] = [],
): NextRequest {
  const url = scenario
    ? `http://localhost:3000/api/transactions?scenario=${scenario}`
    : "http://localhost:3000/api/transactions";
  const headers = new Headers({
    "Content-Type": "application/json",
    Origin: "http://localhost:3000",
    Host: "localhost:3000",
  });
  const cookies: string[] = [];
  if (authenticated) {
    cookies.push(`nw_session=${VALID_SESSION_COOKIE}`);
  }
  cookies.push(...extraCookies);
  if (cookies.length > 0) {
    headers.set("Cookie", cookies.join("; "));
  }
  return new NextRequest(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const VALID_STELLAR_ADDRESS = "GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G";

const validDeposit = {
  intent: "quote",
  kind: "deposit",
  values: {
    amount: "100",
    walletAddress: VALID_STELLAR_ADDRESS,
    walletConnected: true,
  },
};

const validWithdrawal = {
  intent: "quote",
  kind: "withdrawal",
  values: {
    amount: "50",
    walletAddress: VALID_STELLAR_ADDRESS,
    walletConnected: true,
  },
};

test("POST /api/transactions returns 401 when unauthenticated", async () => {
  const req = makePostRequest(validDeposit, undefined, false);
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "UNAUTHORIZED");
});

test("POST /api/transactions returns 200 for valid deposit quote", async () => {
  const req = makePostRequest(validDeposit);
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.quote.kind, "deposit");
  assert.equal(body.data.quote.amount, 100);
  assert.equal(body.data.quote.fee, 0.06);
  assert.equal(body.data.quote.netAmount, 100);
  assert.equal(body.data.quote.totalDebit, 100.06);
  assert.equal(body.data.quote.walletAddress, VALID_STELLAR_ADDRESS);
  assert.equal(body.data.quote.strategyLabel, "Balanced");
  assert.match(body.data.quote.reference, /^NW-DEP-/);
});

test("POST /api/transactions returns 200 for valid withdrawal quote", async () => {
  const req = makePostRequest(validWithdrawal);
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.quote.kind, "withdrawal");
  assert.equal(body.data.quote.amount, 50);
  assert.equal(body.data.quote.fee, 0.38);
  assert.equal(body.data.quote.netAmount, 49.62);
  assert.equal(body.data.quote.totalDebit, 50);
  assert.equal(body.data.quote.walletAddress, VALID_STELLAR_ADDRESS);
  assert.equal(body.data.quote.strategyLabel, "Balanced");
  assert.match(body.data.quote.reference, /^NW-WDR-/);
});

test("POST /api/transactions returns 200 for submit intent", async () => {
  const req = makePostRequest({ ...validDeposit, intent: "submit" });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.pending.kind, "deposit");
  assert.equal(body.data.pending.nextStatus, "success");
  assert.equal(body.data.pending.failureReason, null);
  assert.equal(body.data.pending.quote.kind, "deposit");
  assert.equal(body.data.pending.quote.amount, 100);
  assert.equal(body.data.pending.quote.fee, 0.06);
  assert.equal(body.data.pending.quote.totalDebit, 100.06);
  assert.match(body.data.pending.reference, /^NW-DEP-/);
  assert.equal(body.data.pending.reference, body.data.pending.quote.reference);
});

test("POST /api/transactions propagates explicit strategyLabel on quote and submit", async () => {
  const quoteRes = await POST(
    makePostRequest({ ...validDeposit, strategyLabel: "Conservative" }),
  );
  const quoteBody = await quoteRes.json();

  assert.equal(quoteRes.status, 200);
  assert.equal(quoteBody.data.quote.strategyLabel, "Conservative");

  const submitRes = await POST(
    makePostRequest({
      ...validWithdrawal,
      intent: "submit",
      strategyLabel: "Growth",
    }),
  );
  const submitBody = await submitRes.json();

  assert.equal(submitRes.status, 200);
  assert.equal(submitBody.data.pending.quote.strategyLabel, "Growth");
});

test("POST /api/transactions resolves strategyLabel from nw_strategy_preference cookie when omitted from payload", async () => {
  const quoteRes = await POST(
    makePostRequest(validDeposit, undefined, true, ["nw_strategy_preference=growth"]),
  );
  const quoteBody = await quoteRes.json();

  assert.equal(quoteRes.status, 200);
  assert.equal(quoteBody.data.quote.strategyLabel, "Growth");

  const submitRes = await POST(
    makePostRequest(
      { ...validWithdrawal, intent: "submit" },
      undefined,
      true,
      ["nw_strategy_preference=conservative"],
    ),
  );
  const submitBody = await submitRes.json();

  assert.equal(submitRes.status, 200);
  assert.equal(submitBody.data.pending.quote.strategyLabel, "Conservative");
});

test("POST /api/transactions returns 400 for missing kind", async () => {
  const req = makePostRequest({
    intent: "quote",
    values: { amount: "100", walletAddress: "GABC123", walletConnected: true },
  });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
});

test("POST /api/transactions returns 400 for invalid kind", async () => {
  const req = makePostRequest({
    intent: "quote",
    kind: "invalid",
    values: { amount: "100", walletAddress: "GABC123", walletConnected: true },
  });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test("POST /api/transactions returns 400 for missing values", async () => {
  const req = makePostRequest({ intent: "quote", kind: "deposit" });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test("POST /api/transactions returns 400 for malformed JSON body", async () => {
  const req = new NextRequest("http://localhost:3000/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `nw_session=${VALID_SESSION_COOKIE}`,
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
    },
    body: "not-json",
  });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, ERROR_CODE.VALIDATION_ERROR);
  assert.deepEqual(body.error.details, {
    body: ["Malformed JSON payload."],
  });
});

test("POST /api/transactions returns 413 for oversized JSON body", async () => {
  const req = new NextRequest("http://localhost:3000/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(MAX_BODY_BYTES + 1),
      Cookie: `nw_session=${VALID_SESSION_COOKIE}`,
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
    },
    body: "{}",
  });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, HTTP_STATUS.PAYLOAD_TOO_LARGE);
  assert.equal(body.success, false);
  assert.equal(body.error.code, ERROR_CODE.PAYLOAD_TOO_LARGE);
});

test("POST /api/transactions simulation failure returns failure outcome", async () => {
  const req = makePostRequest({
    ...validDeposit,
    intent: "submit",
    simulation: "failure",
  });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.pending.kind, "deposit");
  assert.equal(body.data.pending.nextStatus, "failure");
  assert.ok(
    typeof body.data.pending.failureReason === "string" &&
      body.data.pending.failureReason.length > 0,
  );
  assert.equal(body.data.pending.quote.amount, 100);
  assert.match(body.data.pending.reference, /^NW-DEP-/);
});

test("POST /api/transactions validates negative amount before backend proxy", async () => {
  const req = makePostRequest({
    intent: "quote",
    kind: "deposit",
    values: {
      amount: "-100",
      walletAddress: VALID_STELLAR_ADDRESS,
      walletConnected: true,
    },
  });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.ok(body.error.details.amount);
});

test("POST /api/transactions validates oversized amount before backend proxy", async () => {
  const req = makePostRequest({
    intent: "quote",
    kind: "withdrawal",
    values: {
      amount: "999999",
      walletAddress: VALID_STELLAR_ADDRESS,
      walletConnected: true,
    },
  });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.ok(body.error.details.amount);
});

test("POST /api/transactions validates invalid wallet address for withdrawals", async () => {
  const req = makePostRequest({
    intent: "quote",
    kind: "withdrawal",
    values: {
      amount: "100",
      walletAddress: "INVALID-ADDRESS",
      walletConnected: true,
    },
  });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.ok(body.error.details.walletAddress);
});

test("rate-limit key uses getRateLimitKey, not a raw spoofable x-forwarded-for read", () => {
  const spoofedVendorReq = new NextRequest("http://localhost:3000/api/transactions", {
    method: "POST",
    headers: {
      "cf-connecting-ip": "198.51.100.99",
      "true-client-ip": "198.51.100.98",
      "x-client-ip": "198.51.100.97",
    },
  });
  assert.equal(getRateLimitKey(spoofedVendorReq), null);
  assert.equal(resolveTransactionClientId(spoofedVendorReq), null);

  const sessionFallbackReq = new NextRequest("http://localhost:3000/api/transactions", {
    method: "POST",
    headers: {
      "cf-connecting-ip": "198.51.100.99",
      Cookie: `nw_session=${VALID_SESSION_COOKIE}`,
    },
  });
  assert.equal(getRateLimitKey(sessionFallbackReq), null);
  assert.equal(resolveTransactionClientId(sessionFallbackReq), "session:test_token");

  const xffReq = new NextRequest("http://localhost:3000/api/transactions", {
    method: "POST",
    headers: {
      "x-forwarded-for": "198.51.100.88, 10.0.0.5",
      Cookie: `nw_session=${VALID_SESSION_COOKIE}`,
    },
  });
  assert.equal(getRateLimitKey(xffReq), "198.51.100.88");
  assert.equal(resolveTransactionClientId(xffReq), "198.51.100.88");
});

test("rate-limit key prefers trusted headers over a spoofed x-forwarded-for", () => {
  const req = new NextRequest("http://localhost:3000/api/transactions", {
    method: "POST",
    headers: {
      "x-forwarded-for": "198.51.100.88, 10.0.0.5",
      "x-real-ip": "203.0.113.42",
    },
  });

  assert.equal(getRateLimitKey(req), "203.0.113.42");
});

test("POST /api/transactions rate limiting isolates clients by session when IP headers are absent", async () => {
  resetRateLimitStore();

  const userA = encodeURIComponent(
    JSON.stringify({ token: "user_a_token", expiresAt: Date.now() + 3600_000 }),
  );
  const userB = encodeURIComponent(
    JSON.stringify({ token: "user_b_token", expiresAt: Date.now() + 3600_000 }),
  );

  function makeUserPostRequest(sessionCookie: string) {
    const headers = new Headers({
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      Host: "localhost:3000",
      Cookie: `nw_session=${sessionCookie}`,
    });
    return new NextRequest("http://localhost:3000/api/transactions", {
      method: "POST",
      headers,
      body: JSON.stringify(validDeposit),
    });
  }

  // Exhaust limit for user A (20 requests)
  for (let i = 0; i < 20; i++) {
    const res = await POST(makeUserPostRequest(userA));
    assert.equal(res.status, 200);
  }

  // User A should now be rate limited
  const blockedA = await POST(makeUserPostRequest(userA));
  assert.equal(blockedA.status, 429);

  // User B should NOT be rate limited (separate session identity)
  const allowedB = await POST(makeUserPostRequest(userB));
  assert.equal(allowedB.status, 200);
});

test.afterEach(() => {
  resetRateLimitStore();
});
