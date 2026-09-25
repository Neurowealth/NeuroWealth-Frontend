import assert from "node:assert/strict";
import test from "node:test";

import {
  emailFormat,
  getErrorList,
  joinDescribedBy,
  maxLength,
  minLength,
  required,
} from "./form-validation.js";

// --- required ---

test("required returns undefined for a non-empty value", () => {
  assert.equal(required("hello", "Required"), undefined);
});

test("required returns the message for an empty string", () => {
  assert.equal(required("", "Required"), "Required");
});

test("required returns the message for a whitespace-only value", () => {
  assert.equal(required("   ", "Required"), "Required");
});

// --- emailFormat ---

test("emailFormat returns undefined for a valid email", () => {
  assert.equal(emailFormat("user@example.com", "Bad email"), undefined);
});

test("emailFormat returns the message for a missing @ sign", () => {
  assert.equal(emailFormat("notanemail", "Bad email"), "Bad email");
});

test("emailFormat returns the message for a missing TLD", () => {
  assert.equal(emailFormat("user@nodot", "Bad email"), "Bad email");
});

test("emailFormat returns undefined for an empty value (let required handle it)", () => {
  assert.equal(emailFormat("", "Bad email"), undefined);
});

test("emailFormat returns the message for spaces inside the address", () => {
  assert.equal(emailFormat("a b@example.com", "Bad email"), "Bad email");
});

// --- minLength ---

test("minLength returns undefined when value meets the minimum", () => {
  assert.equal(minLength("password1", 8, "Too short"), undefined);
});

test("minLength returns the message when value is too short", () => {
  assert.equal(minLength("pass", 8, "Too short"), "Too short");
});

test("minLength returns undefined for an empty value (let required handle it)", () => {
  assert.equal(minLength("", 8, "Too short"), undefined);
});

// --- maxLength ---

test("maxLength returns undefined when value is within limit", () => {
  assert.equal(maxLength("hello", 10, "Too long"), undefined);
});

test("maxLength returns the message when value exceeds limit", () => {
  assert.equal(maxLength("a".repeat(201), 200, "Too long"), "Too long");
});

test("maxLength returns undefined for a value exactly at the limit", () => {
  assert.equal(maxLength("a".repeat(200), 200, "Too long"), undefined);
});

// --- getErrorList ---

test("getErrorList returns only defined error strings", () => {
  const errors = { name: "Required", email: undefined, password: "Too short" };
  const list = getErrorList(errors);
  assert.deepEqual(list, ["Required", "Too short"]);
});

test("getErrorList returns an empty array when there are no errors", () => {
  assert.deepEqual(getErrorList({}), []);
});

// --- joinDescribedBy ---

test("joinDescribedBy joins defined ids with a space", () => {
  assert.equal(joinDescribedBy("id-a", "id-b"), "id-a id-b");
});

test("joinDescribedBy filters out undefined values", () => {
  assert.equal(joinDescribedBy("id-a", undefined, "id-c"), "id-a id-c");
});

test("joinDescribedBy returns undefined when all ids are undefined", () => {
  assert.equal(joinDescribedBy(undefined, undefined), undefined);
});

test("joinDescribedBy returns the single id when only one is provided", () => {
  assert.equal(joinDescribedBy("error-id"), "error-id");
});
