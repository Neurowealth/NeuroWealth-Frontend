import assert from "node:assert/strict";
import test from "node:test";

import {
  currentStepIndex,
  detailsToFieldErrors,
  getTheme,
  sanitizeAmount,
} from "./transaction-utils";

test("getTheme returns dark only when theme=dark", () => {
  assert.equal(getTheme(new URLSearchParams("theme=dark")), "dark");
  assert.equal(getTheme(new URLSearchParams("theme=light")), "light");
  assert.equal(getTheme(new URLSearchParams("")), "light");
});

test("sanitizeAmount strips non-numeric characters except decimal points", () => {
  assert.equal(sanitizeAmount("$1,250.50"), "1250.50");
  assert.equal(sanitizeAmount("abc"), "");
  assert.equal(sanitizeAmount("12.34.56"), "12.34.56");
});

test("detailsToFieldErrors maps top-level and nested values.* keys", () => {
  assert.deepEqual(
    detailsToFieldErrors({
      amount: "Too large",
      "values.walletAddress": "Invalid address",
      walletConnected: ["Reconnect required", "ignored"],
      body: "Malformed payload",
    }),
    {
      amount: "Too large",
      walletAddress: "Invalid address",
      walletConnected: "Reconnect required",
      form: "Malformed payload",
    },
  );
});

test("detailsToFieldErrors returns undefined fields when details are empty", () => {
  assert.deepEqual(detailsToFieldErrors(undefined), {});
  assert.deepEqual(detailsToFieldErrors({}), {
    amount: undefined,
    walletAddress: undefined,
    walletConnected: undefined,
    form: undefined,
  });
});

test("currentStepIndex maps stages to the stepper index", () => {
  assert.equal(currentStepIndex("form"), 0);
  assert.equal(currentStepIndex("error"), 0);
  assert.equal(currentStepIndex("confirm"), 1);
  assert.equal(currentStepIndex("pending"), 2);
  assert.equal(currentStepIndex("success"), 2);
  assert.equal(currentStepIndex("failure"), 2);
});
