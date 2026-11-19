import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";

import { isSessionCookieValid, MAX_SESSION_TOKEN_LENGTH } from "./lib/api-auth";
import { middleware } from "../middleware";

function makeCookie(token = "t", expiresOffset = 60_000) {
  const payload = { token, expiresAt: Date.now() + expiresOffset };
  return encodeURIComponent(JSON.stringify(payload));
}

test("isSessionCookieValid returns true for well-formed, unexpired cookie", () => {
  const raw = makeCookie("token", 60_000);
  assert.equal(isSessionCookieValid(raw), true);
});

test("isSessionCookieValid returns false for expired cookie", () => {
  const raw = makeCookie("token", -60_000);
  assert.equal(isSessionCookieValid(raw), false);
});

test("isSessionCookieValid returns false for malformed cookie", () => {
  assert.equal(isSessionCookieValid("not%7Bjson"), false);
  assert.equal(isSessionCookieValid(""), false);
  assert.equal(isSessionCookieValid(undefined), false);
});

test("isSessionCookieValid rejects empty and whitespace-only tokens", () => {
  assert.equal(isSessionCookieValid(makeCookie("")), false);
  assert.equal(isSessionCookieValid(makeCookie("   ")), false);
  assert.equal(isSessionCookieValid(makeCookie("\t\n")), false);
});

test("isSessionCookieValid rejects oversized tokens", () => {
  const oversizedToken = "a".repeat(MAX_SESSION_TOKEN_LENGTH + 1);
  assert.equal(isSessionCookieValid(makeCookie(oversizedToken)), false);
});

test("isSessionCookieValid accepts token at upper length bound", () => {
  const maxToken = "a".repeat(MAX_SESSION_TOKEN_LENGTH);
  assert.equal(isSessionCookieValid(makeCookie(maxToken)), true);
});

test("middleware redirects protected route when token is empty or whitespace-only", () => {
  for (const invalidToken of ["", "   "]) {
    const req = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: `nw_session=${makeCookie(invalidToken)}`,
      },
    });
    const res = middleware(req);
    assert.equal(res.status, 307);
    assert.ok(res.headers.get("location")?.includes("/login"));
  }
});

test("middleware redirects protected route when token is oversized", () => {
  const oversizedToken = "x".repeat(MAX_SESSION_TOKEN_LENGTH + 1);
  const req = new NextRequest("http://localhost:3000/dashboard", {
    headers: {
      cookie: `nw_session=${makeCookie(oversizedToken)}`,
    },
  });
  const res = middleware(req);
  assert.equal(res.status, 307);
  assert.ok(res.headers.get("location")?.includes("/login"));
});
