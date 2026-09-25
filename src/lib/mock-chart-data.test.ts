/**
 * mock-chart-data.test.ts
 *
 * Verifies that chart generators are deterministic with the same seed
 * and that reseed() produces a different sequence.
 *
 * Run with: yarn test (TZ=UTC node --import tsx --test "src/**\/*.test.ts")
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { reseed } from "./seeded-rng";
import {
  generatePortfolioValueData,
  generateMonthlyYieldData,
  generateAssetAllocationData,
  generateCategoricalBarData,
} from "./mock-chart-data";

describe("mock-chart-data", () => {
  const originalSeed = process.env.NEXT_PUBLIC_DEMO_SEED ?? null;
  after(() => reseed(originalSeed));

  describe("generatePortfolioValueData()", () => {
    it("returns 12 monthly points", () => {
      reseed("chart-test");
      const data = generatePortfolioValueData();
      assert.strictEqual(data.length, 12);
    });

    it("is deterministic: same seed → same data", () => {
      reseed("chart-test");
      const first = generatePortfolioValueData();

      reseed("chart-test");
      const second = generatePortfolioValueData();

      assert.deepStrictEqual(first, second);
    });

    it("differs across seeds", () => {
      reseed("seed-a");
      const a = generatePortfolioValueData();

      reseed("seed-b");
      const b = generatePortfolioValueData();

      assert.notDeepStrictEqual(a, b);
    });
  });

  describe("generateAssetAllocationData()", () => {
    it("returns 4 slices", () => {
      reseed("chart-test");
      const data = generateAssetAllocationData();
      assert.strictEqual(data.length, 4);
    });

    it("is deterministic: same seed → same data", () => {
      reseed("alloc-test");
      const first = generateAssetAllocationData();

      reseed("alloc-test");
      const second = generateAssetAllocationData();

      assert.deepStrictEqual(first, second);
    });

    it("normalized: values always sum to 100", () => {
      for (const seed of ["sum-a", "sum-b", "sum-c", "sum-d"]) {
        reseed(seed);
        const data = generateAssetAllocationData();
        const total = data.reduce((s, d) => s + d.value, 0);
        assert.strictEqual(total, 100, `allocation must sum to 100 for seed ${seed}`);
      }
    });
  });

  describe("generateMonthlyYieldData()", () => {
    it("is deterministic with the same seed", () => {
      reseed("yield-test");
      const first = generateMonthlyYieldData();

      reseed("yield-test");
      const second = generateMonthlyYieldData();

      assert.deepStrictEqual(first, second);
    });
  });

  describe("generateCategoricalBarData()", () => {
    it("returns 4 categories", () => {
      reseed("chart-test");
      const data = generateCategoricalBarData();
      assert.strictEqual(data.length, 4);
    });

    it("is deterministic with the same seed", () => {
      reseed("cat-test");
      const first = generateCategoricalBarData();

      reseed("cat-test");
      const second = generateCategoricalBarData();

      assert.deepStrictEqual(first, second);
    });
  });

  describe("cross-module determinism", () => {
    it("chart data is reproducible with DEFAULT_SEED", async () => {
      const { DEFAULT_SEED } = await import("./seeded-rng");
      reseed(DEFAULT_SEED);
      const first = generatePortfolioValueData();
      const firstAlloc = generateAssetAllocationData();

      reseed(DEFAULT_SEED);
      const second = generatePortfolioValueData();
      const secondAlloc = generateAssetAllocationData();

      assert.deepStrictEqual(first, second, "portfolio data must match with DEFAULT_SEED");
      assert.deepStrictEqual(firstAlloc, secondAlloc, "allocation data must match with DEFAULT_SEED");
    });
  });
});
