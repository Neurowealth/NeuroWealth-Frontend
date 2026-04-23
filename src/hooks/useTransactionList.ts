"use client";

import { useState, useMemo } from "react";

export type TxStatus = "completed" | "pending" | "failed" | "cancelled";
export type TxType = "transfer" | "deposit" | "withdrawal" | "swap";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: TxStatus;
  type: TxType;
  wallet: string;
}

// Seeded mock data
const STATUSES: TxStatus[] = ["completed", "pending", "failed", "cancelled"];
const TYPES: TxType[] = ["transfer", "deposit", "withdrawal", "swap"];
const WALLETS = ["MetaMask", "Coinbase", "Ledger", "Trust"];
const DESCS = [
  "ETH transfer to vault", "USDC deposit", "BTC withdrawal", "SOL swap",
  "NFT purchase", "Gas fee refund", "Staking reward", "Bridge transfer",
  "DEX swap", "Cold storage transfer", "Yield harvest", "Liquidity add",
];

function seed(n: number) {
  let x = Math.sin(n) * 10000;
  return x - Math.floor(x);
}

export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 87 }, (_, i) => ({
  id: `tx-${i + 1}`,
  date: new Date(2024, Math.floor(seed(i * 3) * 12), Math.floor(seed(i * 7) * 28) + 1).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  description: DESCS[Math.floor(seed(i * 11) * DESCS.length)],
  amount: parseFloat((seed(i * 17) * 9800 + 10).toFixed(2)),
  currency: ["ETH", "USDC", "BTC", "SOL"][Math.floor(seed(i * 13) * 4)],
  status: STATUSES[Math.floor(seed(i * 5) * 4)],
  type: TYPES[Math.floor(seed(i * 9) * 4)],
  wallet: WALLETS[Math.floor(seed(i * 7) * 4)],
}));

// Filter options with counts
export function buildFilterOptions(data: Transaction[]) {
  const countBy = <T extends string>(key: keyof Transaction) => {
    const map: Record<string, number> = {};
    data.forEach((tx) => { const v = tx[key] as string; map[v] = (map[v] ?? 0) + 1; });
    return map;
  };
  const statusCounts = countBy("status");
  const typeCounts = countBy("type");

  return [
    ...STATUSES.map((s) => ({ id: `status:${s}`, label: s, count: statusCounts[s] ?? 0, group: "status" })),
    ...TYPES.map((t) => ({ id: `type:${t}`, label: t, count: typeCounts[t] ?? 0, group: "type" })),
  ];
}

export function useTransactionList(itemsPerPage = 8) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (selectedFilters.length === 0) return MOCK_TRANSACTIONS;
    return MOCK_TRANSACTIONS.filter((tx) => {
      const statusFilters = selectedFilters.filter((f) => f.startsWith("status:")).map((f) => f.replace("status:", ""));
      const typeFilters = selectedFilters.filter((f) => f.startsWith("type:")).map((f) => f.replace("type:", ""));
      const statusOk = statusFilters.length === 0 || statusFilters.includes(tx.status);
      const typeOk = typeFilters.length === 0 || typeFilters.includes(tx.type);
      return statusOk && typeOk;
    });
  }, [selectedFilters]);

  const paged = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page, itemsPerPage]);

  const handleFilterChange = (next: string[]) => {
    setSelectedFilters(next);
    setPage(1); // reset to page 1 on filter change
  };

  return {
    items: paged,
    totalItems: filtered.length,
    page,
    setPage,
    selectedFilters,
    setSelectedFilters: handleFilterChange,
    itemsPerPage,
  };
}