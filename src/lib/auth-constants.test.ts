import assert from "node:assert/strict";
import test from "node:test";

import { isProtectedPath, isAuthOnlyPath } from "./auth-constants";

test("isProtectedPath returns true for protected prefixes", () => {
  assert.equal(isProtectedPath("/dashboard"), true);
  assert.equal(isProtectedPath("/dashboard/stats"), true);
  assert.equal(isProtectedPath("/profile"), true);
  assert.equal(isProtectedPath("/settings/account"), true);
});

test("isProtectedPath returns false for public paths", () => {
  assert.equal(isProtectedPath("/"), false);
  assert.equal(isProtectedPath("/login"), false);
  assert.equal(isProtectedPath("/about"), false);
});

test("isAuthOnlyPath matches auth-only routes", () => {
  assert.equal(isAuthOnlyPath("/login"), true);
  assert.equal(isAuthOnlyPath("/signup"), true);
});

test("isAuthOnlyPath does not match arbitrary paths", () => {
  assert.equal(isAuthOnlyPath("/dashboard"), false);
  assert.equal(isAuthOnlyPath("/profile/edit"), false);
});
