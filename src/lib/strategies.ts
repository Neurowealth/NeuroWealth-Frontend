import { STORAGE_KEYS } from "@/lib/storage-keys";

export type StrategyKind = "conservative" | "balanced" | "growth";
export type RiskTier = "low" | "medium" | "high";

export interface StrategyCard {
  kind: StrategyKind;
  title: string;
  apyRange: string;
  apyMin: number;
  apyMax: number;
  riskLabel: string;
  riskTier: RiskTier;
  /** Must be ≤ 140 characters per design spec */
  description: string;
  primaryAction: string;
}

export interface ComparisonRow {
  feature: string;
  conservative: string;
  balanced: string;
  growth: string;
}

export interface StrategyPreference {
  strategy: StrategyKind | null;
}

export interface StrategyUpdatePayload {
  strategy: StrategyKind;
}

// ─── Strategy definitions ─────────────────────────────────────────────────────
// Descriptions are verified ≤ 140 characters each.

export const STRATEGIES: StrategyCard[] = [
  {
    kind: "conservative",
    title: "Conservative",
    apyRange: "4–6%",
    apyMin: 4,
    apyMax: 6,
    riskLabel: "Low risk",
    riskTier: "low",
    // 116 chars
    description:
      "Stablecoin lending and idle reserve coverage. Capital-preserving with predictable yield and minimal drawdown exposure.",
    primaryAction: "Select Conservative",
  },
  {
    kind: "balanced",
    title: "Balanced",
    apyRange: "7–10%",
    apyMin: 7,
    apyMax: 10,
    riskLabel: "Medium risk",
    riskTier: "medium",
    // 121 chars
    description:
      "Yield split across Blend lending, DEX liquidity, and a stable reserve. Best for steady growth with controlled volatility.",
    primaryAction: "Select Balanced",
  },
  {
    kind: "growth",
    title: "Growth",
    apyRange: "11–18%",
    apyMin: 11,
    apyMax: 18,
    riskLabel: "High risk",
    riskTier: "high",
    // 118 chars
    description:
      "Leans into incentive programs, active rebalancing, and higher-volatility positions. Maximum upside with elevated risk.",
    primaryAction: "Select Growth",
  },
];

// ─── Comparison table ─────────────────────────────────────────────────────────

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "APY range",
    conservative: "4–6%",
    balanced: "7–10%",
    growth: "11–18%",
  },
  {
    feature: "Risk level",
    conservative: "Low",
    balanced: "Medium",
    growth: "High",
  },
  {
    feature: "Rebalance",
    conservative: "Monthly",
    balanced: "Weekly",
    growth: "Daily",
  },
  {
    feature: "Liquidity",
    conservative: "Same-day",
    balanced: "Same-day",
    growth: "1–2 days",
  },
  {
    feature: "Max drawdown",
    conservative: "< 5%",
    balanced: "< 15%",
    growth: "< 35%",
  },
  {
    feature: "Ideal horizon",
    conservative: "3+ months",
    balanced: "6+ months",
    growth: "12+ months",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseStrategyKind(value: string | null): StrategyKind | null {
  if (
    value === "conservative" ||
    value === "balanced" ||
    value === "growth"
  ) {
    return value;
  }
  return null;
}

const PREFERENCE_STORAGE_KEY = STORAGE_KEYS.STRATEGY_PREFERENCE;

export function loadStoredPreference(): StrategyKind | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStrategyKind(localStorage.getItem(PREFERENCE_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function saveStoredPreference(kind: StrategyKind): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFERENCE_STORAGE_KEY, kind);
  } catch {
    // storage may be unavailable
  }
}
