import assert from "node:assert/strict";
import test from "node:test";

import { getPageNumbers } from "./Pagination";

test("getPageNumbers returns every page when total is 7 or fewer, regardless of current page", () => {
  assert.deepEqual(getPageNumbers(1, 1), [1]);
  assert.deepEqual(getPageNumbers(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(getPageNumbers(5, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(getPageNumbers(1, 7), [1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(getPageNumbers(7, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test("getPageNumbers handles the zero-page edge case", () => {
  assert.deepEqual(getPageNumbers(1, 0), []);
});

test("getPageNumbers switches from a flat list to windowed ellipsis once total exceeds 7", () => {
  assert.deepEqual(getPageNumbers(1, 8), [1, 2, 3, 4, 5, "ellipsis", 8]);
  assert.deepEqual(getPageNumbers(8, 8), [1, "ellipsis", 4, 5, 6, 7, 8]);
});

test("getPageNumbers shows a leading window with trailing ellipsis when current page is near the start", () => {
  assert.deepEqual(getPageNumbers(1, 20), [1, 2, 3, 4, 5, "ellipsis", 20]);
  assert.deepEqual(getPageNumbers(4, 20), [1, 2, 3, 4, 5, "ellipsis", 20]);
});

test("getPageNumbers shows a trailing window with leading ellipsis when current page is near the end", () => {
  assert.deepEqual(getPageNumbers(17, 20), [1, "ellipsis", 16, 17, 18, 19, 20]);
  assert.deepEqual(getPageNumbers(20, 20), [1, "ellipsis", 16, 17, 18, 19, 20]);
});

test("getPageNumbers centers a small window around the current page with ellipses on both sides", () => {
  assert.deepEqual(getPageNumbers(10, 20), [1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
  assert.deepEqual(getPageNumbers(5, 9), [1, "ellipsis", 4, 5, 6, "ellipsis", 9]);
});

test("getPageNumbers always includes the first and last page for large page counts", () => {
  for (const current of [1, 4, 5, 10, 16, 17, 20]) {
    const pages = getPageNumbers(current, 20);
    assert.equal(pages[0], 1);
    assert.equal(pages[pages.length - 1], 20);
  }
});

test("getPageNumbers windows correctly for very large totals", () => {
  assert.deepEqual(getPageNumbers(500, 1000), [1, "ellipsis", 499, 500, 501, "ellipsis", 1000]);
  assert.deepEqual(getPageNumbers(1, 1000), [1, 2, 3, 4, 5, "ellipsis", 1000]);
  assert.deepEqual(getPageNumbers(1000, 1000), [1, "ellipsis", 996, 997, 998, 999, 1000]);
});
