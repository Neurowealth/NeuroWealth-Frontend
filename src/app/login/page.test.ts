import assert from "node:assert/strict";
import test from "node:test";
import { isValidRedirect } from "./utils";

test("isValidRedirect — accepts valid relative redirect paths", () => {
  assert.equal(isValidRedirect("/dashboard"), true);
  assert.equal(isValidRedirect("/"), true);
  assert.equal(isValidRedirect("/profile?tab=settings"), true);
  assert.equal(isValidRedirect("/settings/security"), true);
});

test("isValidRedirect — rejects protocol-relative redirect values starting with //", () => {
  assert.equal(isValidRedirect("//evil.com"), false);
  assert.equal(isValidRedirect("//"), false);
  assert.equal(isValidRedirect("///evil.com"), false);
  assert.equal(isValidRedirect("//\\evil.com"), false);
});

test("isValidRedirect — rejects leading slash followed by backslash (/\\)", () => {
  assert.equal(isValidRedirect("/\\evil.com"), false);
  assert.equal(isValidRedirect("/\\"), false);
  assert.equal(isValidRedirect("/\\/evil.com"), false);
  assert.equal(isValidRedirect("/\\ "), false);
});

test("isValidRedirect — rejects leading backslash (\\)", () => {
  assert.equal(isValidRedirect("\\evil.com"), false);
  assert.equal(isValidRedirect("\\"), false);
  assert.equal(isValidRedirect("\\\\evil.com"), false);
});

test("isValidRedirect — rejects absolute URLs and javascript: URIs", () => {
  assert.equal(isValidRedirect("http://evil.com"), false);
  assert.equal(isValidRedirect("https://evil.com"), false);
  assert.equal(isValidRedirect("javascript:alert(1)"), false);
  assert.equal(isValidRedirect("data:text/html,evil"), false);
});
