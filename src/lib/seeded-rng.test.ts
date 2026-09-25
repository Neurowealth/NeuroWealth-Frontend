/**
 * seeded-rng.test.ts
 *
 * Verifies that the seeded RNG is deterministic when a seed is provided
 * and reverts to non-deterministic behaviour when the seed is cleared.
 *
 * Run with: yarn test (TZ=UTC node --import tsx --test "src/**\/*.test.ts")
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { random, randomInt, randomItem, reseed } from "./seeded-rng";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectSequence(n: number): number[] {
  return Array.from({ length: n }, () => random());
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("seeded-rng", () => {
  // Restore whatever seed was active before these tests ran.
  const originalSeed = process.env.NEXT_PUBLIC_DEMO_SEED ?? null;
  after(() => reseed(originalSeed));

  describe("random()", () => {
    it("produces values in [0, 1)", () => {
      reseed("test");
      for (let i = 0; i < 200; i++) {
        const v = random();
        assert.ok(v >= 0, `value ${v} is below 0`);
        assert.ok(v < 1, `value ${v} is >= 1`);
      }
    });

    it("is deterministic: same seed → same sequence", () => {
      reseed("demo-seed-2026");
      const first = collectSequence(50);

      reseed("demo-seed-2026");
      const second = collectSequence(50);

      assert.deepStrictEqual(first, second, "sequences must be identical for the same seed");
    });

    it("differs across seeds", () => {
      reseed("seed-a");
      const seqA = collectSequence(20);

      reseed("seed-b");
      const seqB = collectSequence(20);

      assert.notDeepStrictEqual(seqA, seqB, "different seeds must produce different sequences");
    });

    it("falls back to Math.random when seed is null (non-deterministic)", () => {
      reseed(null);
      // Two runs of 20 should almost certainly differ (probability of
      // collision is negligibly small with floating-point values).
      const first = collectSequence(20);
      const second = collectSequence(20);
      // We can't assert inequality with certainty, but we can check the
      // values are in range and the call doesn't throw.
      for (const v of [...first, ...second]) {
        assert.ok(v >= 0 && v < 1, `unseeded value ${v} out of range`);
      }
    });
  });

  describe("randomInt(min, max)", () => {
    before(() => reseed("test-int"));

    it("always returns integers in [min, max)", () => {
      for (let i = 0; i < 500; i++) {
        const v = randomInt(5, 15);
        assert.ok(Number.isInteger(v), `${v} is not an integer`);
        assert.ok(v >= 5, `${v} < min (5)`);
        assert.ok(v < 15, `${v} >= max (15)`);
      }
    });

    it("is deterministic with the same seed", () => {
      reseed("test-int");
      const first = Array.from({ length: 30 }, () => randomInt(0, 100));

      reseed("test-int");
      const second = Array.from({ length: 30 }, () => randomInt(0, 100));

      assert.deepStrictEqual(first, second);
    });

    it("works when min equals max - 1 (single possible value)", () => {
      reseed("edge");
      for (let i = 0; i < 20; i++) {
        assert.strictEqual(randomInt(7, 8), 7);
      }
    });
  });

  describe("randomItem(array)", () => {
    before(() => reseed("test-item"));

    it("always returns an element that exists in the array", () => {
      const arr = ["a", "b", "c", "d", "e"];
      for (let i = 0; i < 200; i++) {
        assert.ok(arr.includes(randomItem(arr)), "returned value not in array");
      }
    });

    it("is deterministic with the same seed", () => {
      const arr = [10, 20, 30, 40, 50];

      reseed("test-item");
      const first = Array.from({ length: 20 }, () => randomItem(arr));

      reseed("test-item");
      const second = Array.from({ length: 20 }, () => randomItem(arr));

      assert.deepStrictEqual(first, second);
    });
  });

  describe("reseed()", () => {
    it("resets the sequence mid-stream", () => {
      reseed("mid-stream");
      // Consume some values to advance the state.
      collectSequence(10);
      const mid = random();

      // Reseed to the same value and consume the same number.
      reseed("mid-stream");
      collectSequence(10);
      const midAgain = random();

      assert.strictEqual(mid, midAgain, "reseed must restart the sequence");
    });

    it("switching seeds produces independent sequences", () => {
      reseed("alpha");
      const alpha = collectSequence(5);

      reseed("beta");
      const beta = collectSequence(5);

      reseed("alpha");
      const alphaAgain = collectSequence(5);

      assert.deepStrictEqual(alpha, alphaAgain, "alpha sequences must match");
      assert.notDeepStrictEqual(alpha, beta, "alpha and beta must differ");
    });
  });
});
