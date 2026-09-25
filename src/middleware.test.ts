import assert from "node:assert/strict";
import test from "node:test";

import { isSessionCookieValid } from "../middleware";

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
