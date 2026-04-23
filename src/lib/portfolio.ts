export type PortfolioScenario = "live" | "empty" | "loading" | "partial-failure" | "timeout";
export type PortfolioSource = "api" | "demo" | "fallback";
export type ChartTone = "primary" | "accent" | "warning" | "neutral-strong" | "neutral-soft";
export type ActivityKind = "deposit" | "yield" | "rebalance" | "withdrawal";
export type ActivityStatus = "completed" | "scheduled" | "pending";

export interface PortfolioSummary {
  totalBalance: number;
  totalYield: number;
  apy: number;
  strategy: string;
  strategyLabel: string;
  strategyDescription: string;
}

export interface AllocationItem {
  id: string;
  label: string;
  symbol: string;
  amount: number;
  share: number;
  change: number;
  tone: ChartTone;
}

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  occurredAt: string;
  amount: number | null;
  status: ActivityStatus;
}

export interface PortfolioPayload {
  summary: PortfolioSummary;
  allocation: AllocationItem[];
  activity: ActivityItem[];
  updatedAt: string;
  source: PortfolioSource;
  notice: string | null;
}

interface ScenarioOverrides {
  source?: PortfolioSource;
  notice?: string | null;
}

const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  conservative: "Capital-preserving blend of stablecoin lending and idle reserve coverage.",
  balanced: "Yield split across Blend lending, DEX liquidity, and a protective stable reserve.",
  growth: "Higher-volatility mix that leans into incentive programs and active rebalancing.",
};

const DEFAULT_STRATEGY = "balanced";

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function readString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeStrategyLabel(strategy: string): string {
  if (!strategy) {
    return "Balanced";
  }

  return strategy
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((chunk) => titleCase(chunk.toLowerCase()))
    .join(" ");
}

function normalizeTone(tone: unknown, fallback: ChartTone): ChartTone {
  const value = readString(tone).toLowerCase();

  if (
    value === "primary" ||
    value === "accent" ||
    value === "warning" ||
    value === "neutral-strong" ||
    value === "neutral-soft"
  ) {
    return value;
  }

  return fallback;
}

function normalizeStatus(status: unknown): ActivityStatus {
  const value = readString(status).toLowerCase();

  if (value === "scheduled" || value === "pending") {
    return value;
  }

  return "completed";
}

function normalizeKind(kind: unknown): ActivityKind {
  const value = readString(kind).toLowerCase();

  if (
    value === "deposit" ||
    value === "yield" ||
    value === "rebalance" ||
    value === "withdrawal"
  ) {
    return value;
  }

  return "yield";
}

function normalizeAllocationItem(item: unknown, index: number): AllocationItem {
  const record = (item ?? {}) as Record<string, unknown>;

  return {
    id: readString(record.id, `allocation-${index}`),
    label: readString(record.label ?? record.name ?? record.asset, "Unassigned"),
    symbol: readString(record.symbol ?? record.asset, "N/A"),
    amount: readNumber(record.amount ?? record.value),
    share: readNumber(record.share ?? record.percentage ?? record.weight),
    change: readNumber(record.change ?? record.changePercent),
    tone: normalizeTone(record.tone ?? record.chartTone, "neutral-strong"),
  };
}

function normalizeActivityItem(item: unknown, index: number): ActivityItem {
  const record = (item ?? {}) as Record<string, unknown>;

  return {
    id: readString(record.id, `activity-${index}`),
    kind: normalizeKind(record.kind ?? record.type),
    title: readString(record.title ?? record.name, "Portfolio event"),
    detail: readString(record.detail ?? record.description, "Portfolio activity recorded."),
    occurredAt: readString(record.occurredAt ?? record.createdAt, new Date().toISOString()),
    amount: record.amount == null ? null : readNumber(record.amount),
    status: normalizeStatus(record.status),
  };
}

export function parseScenario(value: string | null): PortfolioScenario {
  if (value === "empty") return "empty";
  if (value === "loading") return "loading";
  if (value === "partial-failure") return "partial-failure";
  if (value === "timeout") return "timeout";
  return "live";
}

export function buildScenarioPayload(
  scenario: PortfolioScenario,
  overrides: ScenarioOverrides = {},
): PortfolioPayload {
  if (scenario === "empty") {
    return {
      summary: {
        totalBalance: 0,
        totalYield: 0,
        apy: 0,
        strategy: "none",
        strategyLabel: "Not selected",
        strategyDescription: "Pick a strategy to start allocating deposits once funds arrive.",
      },
      allocation: [],
      activity: [],
      updatedAt: new Date("2026-03-24T08:10:00.000Z").toISOString(),
      source: overrides.source ?? "demo",
      notice: overrides.notice ?? "Previewing empty-state behavior with no active positions.",
    };
  }

  if (scenario === "loading") {
    return {
      summary: {
        totalBalance: 0,
        totalYield: 0,
        apy: 0,
        strategy: "loading",
        strategyLabel: "Loading...",
        strategyDescription: "Fetching your portfolio data.",
      },
      allocation: [],
      activity: [],
      updatedAt: new Date().toISOString(),
      source: overrides.source ?? "demo",
      notice: overrides.notice ?? "Loading portfolio data...",
    };
  }

  if (scenario === "partial-failure") {
    return {
      summary: {
        totalBalance: 25150.32,
        totalYield: 847.21,
        apy: 5.2,
        strategy: "balanced",
        strategyLabel: "Balanced (Degraded)",
        strategyDescription: "Partial data available - some services may be unavailable.",
      },
      allocation: [
        {
          id: "alloc-usdc-lend",
          label: "Blend USDC lending",
          symbol: "USDC",
          amount: 15120.45,
          share: 60.1,
          change: 1.2,
          tone: "primary",
        },
        {
          id: "alloc-error",
          label: "Data unavailable",
          symbol: "—",
          amount: 0,
          share: 39.9,
          change: 0,
          tone: "neutral-soft",
        },
      ],
      activity: [
        {
          id: "event-yield",
          kind: "yield",
          title: "Yield settled",
          detail: "Daily earnings swept into your core balance.",
          occurredAt: "2026-03-24T07:42:00.000Z",
          amount: 142.38,
          status: "completed",
        },
        {
          id: "event-error",
          kind: "rebalance",
          title: "Rebalance failed",
          detail: "Unable to connect to rebalancing service.",
          occurredAt: "2026-03-24T05:16:00.000Z",
          amount: null,
          status: "pending",
        },
      ],
      updatedAt: new Date("2026-03-24T08:42:00.000Z").toISOString(),
      source: overrides.source ?? "fallback",
      notice: overrides.notice ?? "Partial service degradation - some features may be unavailable.",
    };
  }

  if (scenario === "timeout") {
    return {
      summary: {
        totalBalance: 0,
        totalYield: 0,
        apy: 0,
        strategy: "error",
        strategyLabel: "Connection Timeout",
        strategyDescription: "Unable to reach portfolio service.",
      },
      allocation: [],
      activity: [],
      updatedAt: new Date().toISOString(),
      source: overrides.source ?? "fallback",
      notice: overrides.notice ?? "Request timed out. Please check your connection and try again.",
    };
  }

  // Default to live/success scenario
  return {
    summary: {
      totalBalance: 46320.82,
      totalYield: 2941.16,
      apy: 8.4,
      strategy: DEFAULT_STRATEGY,
      strategyLabel: "Balanced",
      strategyDescription: STRATEGY_DESCRIPTIONS[DEFAULT_STRATEGY],
    },
    allocation: [
      {
        id: "alloc-usdc-lend",
        label: "Blend USDC lending",
        symbol: "USDC",
        amount: 22420.45,
        share: 48.4,
        change: 1.2,
        tone: "primary",
      },
      {
        id: "alloc-dex-lp",
        label: "Stellar DEX LP",
        symbol: "XLM",
        amount: 12860.11,
        share: 27.8,
        change: 2.4,
        tone: "accent",
      },
      {
        id: "alloc-yield-buffer",
        label: "Protected reserve",
        symbol: "USDC",
        amount: 7080.26,
        share: 15.3,
        change: 0.4,
        tone: "warning",
      },
      {
        id: "alloc-rewards",
        label: "Reward accruals",
        symbol: "AQUA",
        amount: 3960,
        share: 8.5,
        change: -0.6,
        tone: "neutral-strong",
      },
    ],
    activity: [
      {
        id: "event-yield",
        kind: "yield",
        title: "Yield settled",
        detail: "Daily earnings swept into your core balance.",
        occurredAt: "2026-03-24T07:42:00.000Z",
        amount: 142.38,
        status: "completed",
      },
      {
        id: "event-rebalance",
        kind: "rebalance",
        title: "Auto-rebalance executed",
        detail: "Capital shifted from reserve into Blend after rate improvement.",
        occurredAt: "2026-03-24T05:16:00.000Z",
        amount: null,
        status: "completed",
      },
      {
        id: "event-deposit",
        kind: "deposit",
        title: "Deposit confirmed",
        detail: "Wallet deposit routed to the Balanced strategy.",
        occurredAt: "2026-03-23T18:22:00.000Z",
        amount: 8500,
        status: "completed",
      },
      {
        id: "event-withdrawal",
        kind: "withdrawal",
        title: "Scheduled withdrawal",
        detail: "Liquidity queued for same-day settlement.",
        occurredAt: "2026-03-23T15:03:00.000Z",
        amount: -1200,
        status: "scheduled",
      },
    ],
    updatedAt: new Date("2026-03-24T08:42:00.000Z").toISOString(),
    source: overrides.source ?? "demo",
    notice:
      overrides.notice ??
      "Using preview data until NEUROWEALTH_API_BASE_URL is configured for the live backend.",
  };
}

export function normalizePortfolioPayload(
  payload: unknown,
  source: PortfolioSource,
): PortfolioPayload {
  const record = (payload ?? {}) as Record<string, unknown>;
  const summaryRecord = ((record.summary ?? record.portfolio ?? {}) as Record<string, unknown>);
  const strategy = readString(
    summaryRecord.strategy ?? record.strategy,
    DEFAULT_STRATEGY,
  ).toLowerCase();

  const allocationSource = Array.isArray(record.allocation)
    ? record.allocation
    : Array.isArray(record.positions)
      ? record.positions
      : Array.isArray(record.assets)
        ? record.assets
        : [];

  const activitySource = Array.isArray(record.activity)
    ? record.activity
    : Array.isArray(record.recentActivity)
      ? record.recentActivity
      : Array.isArray(record.transactions)
        ? record.transactions
        : Array.isArray(record.history)
          ? record.history
          : [];

  return {
    summary: {
      totalBalance: readNumber(summaryRecord.totalBalance ?? summaryRecord.balance ?? record.totalBalance),
      totalYield: readNumber(summaryRecord.totalYield ?? summaryRecord.yield ?? record.totalYield),
      apy: readNumber(summaryRecord.apy ?? record.apy),
      strategy,
      strategyLabel: readString(
        summaryRecord.strategyLabel ?? record.strategyLabel,
        normalizeStrategyLabel(strategy),
      ),
      strategyDescription: readString(
        summaryRecord.strategyDescription ?? record.strategyDescription,
        STRATEGY_DESCRIPTIONS[strategy] ?? STRATEGY_DESCRIPTIONS[DEFAULT_STRATEGY],
      ),
    },
    allocation: allocationSource.map((item, index) => normalizeAllocationItem(item, index)),
    activity: activitySource.map((item, index) => normalizeActivityItem(item, index)),
    updatedAt: readString(record.updatedAt, new Date().toISOString()),
    source,
    notice: readOptionalString(record.notice),
  };
}
