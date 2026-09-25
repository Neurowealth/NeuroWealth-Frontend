import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { POST } from "./route";
import { NextRequest } from "next/server";
import { getRateLimitKey, resetRateLimitStore } from "@/lib/rate-limit";
import { ERROR_CODE, HTTP_STATUS, MAX_BODY_BYTES } from "@/lib/api-response";

const VALID_SESSION_COOKIE = encodeURIComponent(
  JSON.stringify({ token: "test_token", expiresAt: Date.now() + 3600 * 1000 }),
);

function makePostRequest(body: unknown, scenario?: string, authenticated = true): NextRequest {
  const url = scenario
    ? `http://localhost:3000/api/transactions?scenario=${scenario}`
    : "http://localhost:3000/api/transactions";
  const headers = new Headers({ "Content-Type": "application/json", Origin: "http://localhost:3000" });
  if (authenticated) {
    headers.set("Cookie", `nw_session=${VALID_SESSION_COOKIE}`);
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
  assert.ok(body.data.quote);
});

test("POST /api/transactions returns 200 for valid withdrawal quote", async () => {
  const req = makePostRequest(validWithdrawal);
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.quote);
});

test("POST /api/transactions returns 200 for submit intent", async () => {
  const req = makePostRequest({ ...validDeposit, intent: "submit" });
  const res = await POST(req);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.ok(body.data.pending);
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
  assert.ok(body.data.pending);
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
  const source = readFileSync(new URL("./route.ts", import.meta.url), "utf8");
  assert.match(source, /getRateLimitKey\(request\)/);
  assert.doesNotMatch(
    source,
    /headers\.get\(["']x-forwarded-for["']\)\s*\?\?\s*["']unknown["']/,
  );
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

test.afterEach(() => {
  resetRateLimitStore();
});
