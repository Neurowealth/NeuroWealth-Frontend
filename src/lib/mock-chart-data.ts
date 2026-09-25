/**
 * @module mock-chart-data
 *
 * Chart seed data for docs pages and demo screens.
 *
 * Every generator reads from the shared PRNG in seeded-rng.ts.
 * Call reseed(DEFAULT_SEED) before invoking these functions to get
 * deterministic output for screenshots and visual regression tests.
 *
 * Usage
 * ─────
 *   import { portfolioValueData, assetAllocationData } from "@/lib/mock-chart-data";
 *   // or call the functions for fresh data after a reseed():
 *   import { generatePortfolioValueData } from "@/lib/mock-chart-data";
 */

import { randomInt } from "./seeded-rng";
import type { ChartTone } from "./portfolio";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Base datum for single-series charts: a label and a numeric value. */
export interface ChartDatum {
  name: string;
  value: number;
}

/** Portfolio value at a point in time, plus the yield earned that period. */
export interface PortfolioValuePoint extends ChartDatum {
  /** Yield earned during the period, in the portfolio's base currency. */
  yield: number;
}

/** A slice of the asset-allocation donut, themed by tone. */
export interface AssetAllocationSlice extends ChartDatum {
  tone?: ChartTone;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Generators ───────────────────────────────────────────────────────────────
// Each function reads from the shared PRNG so calling reseed() before
// invocation produces deterministic output.

/** Generate portfolio-value-over-time data (line / area chart). */
export function generatePortfolioValueData(): PortfolioValuePoint[] {
  return months.map((month, i) => {
    const baseValue = 10000 + (i * 450);
    const noise = randomInt(-300, 300);
    return {
      name: month,
      value: baseValue + noise,
      yield: randomInt(80, 450),
    };
  });
}

/** Generate monthly-yield data (bar chart). */
export function generateMonthlyYieldData(): ChartDatum[] {
  return generatePortfolioValueData().map((p) => ({
    name: p.name,
    value: p.yield,
  }));
}

/** Generate asset-allocation slices (donut chart). */
export function generateAssetAllocationData(): AssetAllocationSlice[] {
  const raw = [
    { name: "USDC", value: randomInt(35, 50), tone: "primary" as ChartTone },
    { name: "USDT", value: randomInt(20, 30), tone: "accent" as ChartTone },
    { name: "XLM", value: randomInt(15, 25), tone: "warning" as ChartTone },
    { name: "Other", value: randomInt(5, 15), tone: "neutral-strong" as ChartTone },
  ];
  const total = raw.reduce((s, d) => s + d.value, 0);
  const normal = raw.map((d) => ({ ...d, value: Math.round((d.value * 100) / total) }));
  const last = normal.length - 1;
  const normTotal = normal.reduce((s, d) => s + d.value, 0);
  normal[last] = { ...normal[last], value: normal[last].value + (100 - normTotal) };
  return normal;
}

/** Generate categorical bar data (transaction breakdown). */
export function generateCategoricalBarData(): ChartDatum[] {
  return [
    { name: "Deposits", value: randomInt(12000, 18000) },
    { name: "Withdrawals", value: randomInt(2000, 5000) },
    { name: "Yield", value: randomInt(2000, 3500) },
    { name: "Fees", value: randomInt(100, 300) },
  ];
}

// ─── Default instances ────────────────────────────────────────────────────────
// Generated once at import time using the current seed. For screenshots
// or tests that need fresh data, call the generator functions directly
// after reseed().

export const portfolioValueData: PortfolioValuePoint[] = generatePortfolioValueData();
export const monthlyYieldData: ChartDatum[] = generateMonthlyYieldData();
export const assetAllocationData: AssetAllocationSlice[] = generateAssetAllocationData();
export const categoricalBarData: ChartDatum[] = generateCategoricalBarData();
