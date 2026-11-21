/**
 * The monthly yield bars and the portfolio series describe the same months,
 * so their values must agree (#1282).
 */

import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { reseed } from "./seeded-rng";
import {
  deriveMonthlyYieldData,
  generateMonthlyYieldData,
  generatePortfolioValueData,
  monthlyYieldData,
  portfolioValueData,
} from "./mock-chart-data";

describe("monthly yield matches portfolio yield", () => {
  const originalSeed = process.env.NEXT_PUBLIC_DEMO_SEED ?? null;
  after(() => reseed(originalSeed));

  it("exported monthlyYieldData agrees with portfolioValueData month by month", () => {
    assert.equal(monthlyYieldData.length, portfolioValueData.length);
    portfolioValueData.forEach((point, i) => {
      assert.equal(monthlyYieldData[i].name, point.name);
      assert.equal(monthlyYieldData[i].value, point.yield);
    });
  });

  it("generateMonthlyYieldData(points) reuses the given series", () => {
    reseed("yield-test");
    const points = generatePortfolioValueData();
    const yields = generateMonthlyYieldData(points);

    points.forEach((point, i) => {
      assert.deepStrictEqual(yields[i], { name: point.name, value: point.yield });
    });
  });

  it("deriveMonthlyYieldData does not consume the shared PRNG", () => {
    reseed("yield-prng");
    const points = generatePortfolioValueData();
    const afterPoints = generatePortfolioValueData();

    reseed("yield-prng");
    generatePortfolioValueData();
    deriveMonthlyYieldData(points);
    assert.deepStrictEqual(generatePortfolioValueData(), afterPoints);
  });
});
