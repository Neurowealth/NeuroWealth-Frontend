// ── Auth ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  address: string; // Stellar wallet address (truncated display)
  displayName?: string;
  avatarInitials?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export type StrategyType = "conservative" | "balanced" | "growth";

export interface PortfolioSummary {
  totalBalance: number;
  totalYield: number;
  currentApy: number;
  strategy: StrategyType;
  lastUpdated: number;
}

export interface AssetAllocation {
  protocol: string;
  amount: number;
  percentage: number;
  apy: number;
}

// ── Transactions ──────────────────────────────────────────────────────────────

export type TransactionType = "deposit" | "withdrawal" | "rebalance" | "yield";
export type TransactionStatus = "pending" | "confirmed" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  txHash?: string;
  timestamp: number;
  description?: string;
}

// ── Strategy ──────────────────────────────────────────────────────────────────

export interface Strategy {
  id: StrategyType;
  name: string;
  description: string;
  apyRange: [number, number]; // [min, max] APY %
  riskLevel: "low" | "medium" | "high";
}

// ── UI State ──────────────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface PageState<T> {
  data: T | null;
  state: LoadingState;
  error?: string;
}
