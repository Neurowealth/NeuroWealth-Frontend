/**
 * Superseded debounced checks must settle instead of hanging (#1284).
 */

import assert from "node:assert/strict";
import test from "node:test";

import { createDebouncedAsyncCheck } from "./form-validation";

const args = (value: string) => ({
  value,
  shouldFail: (v: string) => v.includes("taken"),
  message: "taken",
  asyncDelay: 5,
});

const settles = <T>(promise: Promise<T>, ms = 500): Promise<T | "PENDING"> =>
  Promise.race([promise, new Promise<"PENDING">((r) => setTimeout(() => r("PENDING"), ms))]);

test("two rapid checks: the first resolves undefined, the second validates", async () => {
  const check = createDebouncedAsyncCheck(20);

  const first = check(args("taken-a"));
  const second = check(args("taken-b"));

  assert.equal(await settles(first), undefined);
  assert.equal(await settles(second), "taken");
});

test("a single check still validates normally", async () => {
  const check = createDebouncedAsyncCheck(5);

  assert.equal(await settles(check(args("taken"))), "taken");
  assert.equal(await settles(check(args("free"))), undefined);
});

test("a call superseded while its async check is in flight resolves undefined", async () => {
  const check = createDebouncedAsyncCheck(5);

  const first = check({ ...args("taken-a"), asyncDelay: 40 });
  await new Promise((r) => setTimeout(r, 20)); // debounce fired, check running
  const second = check(args("free"));

  assert.equal(await settles(first), undefined); // not the stale "taken"
  assert.equal(await settles(second), undefined);
});

test("cancel() resolves the pending call and stops its timer", async () => {
  const check = createDebouncedAsyncCheck(50);

  const pending = check(args("taken"));
  check.cancel();

  assert.equal(await settles(pending), undefined);
});

test("cancel() with nothing pending is a no-op", () => {
  assert.doesNotThrow(() => createDebouncedAsyncCheck(5).cancel());
});

test("many rapid calls leave none pending", async () => {
  const check = createDebouncedAsyncCheck(10);
  const calls = Array.from({ length: 10 }, (_, i) => check(args(`taken-${i}`)));

  const results = await Promise.all(calls.map((c) => settles(c)));

  assert.equal(results.includes("PENDING"), false);
  assert.deepEqual(results.slice(0, 9), Array(9).fill(undefined));
  assert.equal(results[9], "taken");
});
