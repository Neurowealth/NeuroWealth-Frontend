export type HistoryKind = "deposit" | "withdrawal" | "rebalance";
export type HistoryStatus = "success" | "pending" | "failed";

export interface TransactionHistoryItem {
  id: string;
  kind: HistoryKind;
  title: string;
  detail: string;
  amount: number | null;
  status: HistoryStatus;
  occurredAt: string;
  txHash: string | null;
}

export interface TransactionHistoryFilter {
  kind: HistoryKind | "all";
  status: HistoryStatus | "all";
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
}

export interface TransactionHistoryPage {
  items: TransactionHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 64-char hex Stellar transaction hashes (mock)
const MOCK_TX_HASHES: Record<string, string> = {
  t01: "a1b2c3d4e5f67890123456789012345678901234567890abcdef1234567890ab",
  t02: "b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678",
  t03: "c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef1234",
  t04: "d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890cd",
  t05: "e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcd",
  t06: "f678901234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  t07: "0123456789abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  t08: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  t09: "234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  t10: "34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123",
  t11: "4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
  t12: "567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345",
  t13: "67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
  t14: "7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567",
  t15: "890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
  t16: "90abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789",
};

const HISTORY_TEMPLATES: { kind: HistoryKind; title: string; detail: string }[] = [
  { kind: "deposit", title: "Deposit confirmed", detail: "USDC deposited from Freighter wallet and routed to Balanced strategy." },
  { kind: "rebalance", title: "Auto-rebalance executed", detail: "Capital shifted from reserve into Blend lending after rate improvement." },
  { kind: "withdrawal", title: "Withdrawal confirmed", detail: "Liquidity released and settled to destination wallet." },
  { kind: "deposit", title: "Deposit pending", detail: "Transaction submitted, awaiting Stellar network confirmation." },
  { kind: "withdrawal", title: "Withdrawal failed", detail: "Treasury liquidity changed mid-flight. Please retry with updated amount." },
  { kind: "deposit", title: "Deposit confirmed", detail: "USDC deposited and allocated to Stellar DEX LP position." },
  { kind: "rebalance", title: "Auto-rebalance executed", detail: "Reserve topped up from DEX LP as APY spread narrowed." },
  { kind: "withdrawal", title: "Withdrawal confirmed", detail: "Scheduled withdrawal settled to Freighter destination wallet." },
  { kind: "deposit", title: "Deposit confirmed", detail: "Lump-sum deposit split across Blend lending and DEX liquidity." },
  { kind: "rebalance", title: "Rebalance pending", detail: "Triggered by strategy drift; awaiting on-chain settlement." },
  { kind: "deposit", title: "Deposit confirmed", detail: "Small top-up deposited into protected reserve buffer." },
  { kind: "withdrawal", title: "Withdrawal confirmed", detail: "Emergency liquidity withdrawn after manual request." },
  { kind: "deposit", title: "Deposit failed", detail: "Network fee estimate expired before submission. Refresh and retry." },
  { kind: "rebalance", title: "Auto-rebalance executed", detail: "Monthly strategy review triggered reallocation to growth positions." },
  { kind: "withdrawal", title: "Withdrawal confirmed", detail: "Profit-taking withdrawal cleared same-day." },
  { kind: "deposit", title: "Deposit confirmed", detail: "DCA deposit routed into Blend USDC lending pool." },
  { kind: "rebalance", title: "Auto-rebalance executed", detail: "AQUA rewards reinvested into primary lending position." },
  { kind: "withdrawal", title: "Withdrawal pending", detail: "Queued for same-day settlement; liquidity being freed." },
  { kind: "deposit", title: "Deposit confirmed", detail: "Initial portfolio deposit routed to Balanced strategy." },
  { kind: "withdrawal", title: "Withdrawal confirmed", detail: "Standard withdrawal settled to Stellar destination wallet." },
  { kind: "rebalance", title: "Auto-rebalance executed", detail: "Quarterly rebalance to maintain Balanced strategy drift limits." },
  { kind: "deposit", title: "Deposit failed", detail: "Wallet signature timed out. Funds were not debited — safe to retry." },
];

const TX_HASH_KEYS = ["t01", "t02", "t03", "t04", "t05", "t06", "t07", "t08", "t09", "t10", "t11", "t12", "t13", "t14", "t15", "t16"];

function generateHistoryItems(count: number): TransactionHistoryItem[] {
  const items: TransactionHistoryItem[] = [];
  const amounts = [null, 200, 500, 750, 1200, 1500, 2400, 2500, 3000, 3300, 4200, 5000, 6500, 8500, 8800, 12000, 20000];
  const baseDate = new Date("2026-03-25T00:00:00.000Z");

  for (let i = 0; i < count; i++) {
    const tmpl = HISTORY_TEMPLATES[i % HISTORY_TEMPLATES.length];
    const date = new Date(baseDate.getTime() - i * 4 * 60 * 60 * 1000);
    const rawAmount = amounts[i % amounts.length];
    const amount = tmpl.kind === "withdrawal" ? (rawAmount != null ? -rawAmount : null) : rawAmount;
    const status: HistoryStatus = i % 7 === 2 ? "pending" : i % 11 === 0 ? "failed" : "success";
    const hasTx = status !== "pending" && status !== "failed";
    const txKey = TX_HASH_KEYS[i % TX_HASH_KEYS.length];

    items.push({
      id: `hist-${String(i + 1).padStart(3, "0")}`,
      kind: tmpl.kind,
      title: tmpl.title,
      detail: tmpl.detail,
      amount,
      status,
      occurredAt: date.toISOString(),
      txHash: hasTx ? MOCK_TX_HASHES[txKey] : null,
    });
  }

  return items;
}

export const MOCK_HISTORY_ITEMS: TransactionHistoryItem[] = generateHistoryItems(150);

export function parseHistoryKind(value: string | null): HistoryKind | "all" {
  if (value === "deposit" || value === "withdrawal" || value === "rebalance") {
    return value;
  }
  return "all";
}

export function parseHistoryStatus(value: string | null): HistoryStatus | "all" {
  if (value === "success" || value === "pending" || value === "failed") {
    return value;
  }
  return "all";
}

export function filterAndPaginateHistory(
  filter: TransactionHistoryFilter,
): TransactionHistoryPage {
  let items = MOCK_HISTORY_ITEMS.slice();

  if (filter.kind !== "all") {
    items = items.filter((item) => item.kind === filter.kind);
  }

  if (filter.status !== "all") {
    items = items.filter((item) => item.status === filter.status);
  }

  if (filter.dateFrom) {
    const from = new Date(filter.dateFrom).getTime();
    items = items.filter((item) => new Date(item.occurredAt).getTime() >= from);
  }

  if (filter.dateTo) {
    // include the full dateTo day
    const to = new Date(filter.dateTo);
    to.setDate(to.getDate() + 1);
    items = items.filter((item) => new Date(item.occurredAt).getTime() < to.getTime());
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / filter.pageSize));
  const clampedPage = Math.min(Math.max(1, filter.page), totalPages);
  const start = (clampedPage - 1) * filter.pageSize;
  const pageItems = items.slice(start, start + filter.pageSize);

  return {
    items: pageItems,
    total,
    page: clampedPage,
    pageSize: filter.pageSize,
    totalPages,
  };
}
