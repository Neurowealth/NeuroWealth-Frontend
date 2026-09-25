"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/formatters";

interface Holding {
  id: string;
  asset: string;
  symbol: string;
  type: "Buy" | "Sell" | "Stake" | "Reward";
  amount: number;
  value: number;
  status: "Completed" | "Pending" | "Failed";
  date: string;
}

const HOLDINGS: Holding[] = [
  { id: "tx-01", asset: "Stellar Lumens", symbol: "XLM", type: "Buy", amount: 12500, value: 1375.0, status: "Completed", date: "2026-06-21" },
  { id: "tx-02", asset: "USD Coin", symbol: "USDC", type: "Stake", amount: 5000, value: 5000.0, status: "Completed", date: "2026-06-20" },
  { id: "tx-03", asset: "Bitcoin", symbol: "BTC", type: "Buy", amount: 0.045, value: 2880.5, status: "Pending", date: "2026-06-20" },
  { id: "tx-04", asset: "Ethereum", symbol: "ETH", type: "Sell", amount: 1.2, value: 4120.0, status: "Completed", date: "2026-06-19" },
  { id: "tx-05", asset: "Stellar Lumens", symbol: "XLM", type: "Reward", amount: 320, value: 35.2, status: "Completed", date: "2026-06-18" },
  { id: "tx-06", asset: "Solana", symbol: "SOL", type: "Buy", amount: 18, value: 2610.0, status: "Failed", date: "2026-06-18" },
  { id: "tx-07", asset: "USD Coin", symbol: "USDC", type: "Sell", amount: 2500, value: 2500.0, status: "Completed", date: "2026-06-17" },
  { id: "tx-08", asset: "Cardano", symbol: "ADA", type: "Buy", amount: 4200, value: 1932.0, status: "Pending", date: "2026-06-16" },
  { id: "tx-09", asset: "Bitcoin", symbol: "BTC", type: "Stake", amount: 0.01, value: 640.0, status: "Completed", date: "2026-06-15" },
  { id: "tx-10", asset: "Ethereum", symbol: "ETH", type: "Reward", amount: 0.08, value: 274.6, status: "Completed", date: "2026-06-14" },
  { id: "tx-11", asset: "Polkadot", symbol: "DOT", type: "Buy", amount: 95, value: 627.0, status: "Failed", date: "2026-06-13" },
  { id: "tx-12", asset: "Solana", symbol: "SOL", type: "Sell", amount: 6, value: 870.0, status: "Completed", date: "2026-06-12" },
];

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const statusStyles: Record<Holding["status"], string> = {
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Failed: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

const columns: DataTableColumn<Holding>[] = [
  {
    key: "asset",
    header: "Asset",
    accessor: (r) => r.asset,
    sortable: true,
    hideable: false,
    render: (r) => (
      <div className="flex flex-col">
        <span className="font-medium text-slate-800 dark:text-slate-100">{r.asset}</span>
        <span className="text-xs text-slate-400">{r.symbol}</span>
      </div>
    ),
  },
  { key: "type", header: "Type", accessor: (r) => r.type, sortable: true, filterable: true },
  {
    key: "amount",
    header: "Amount",
    accessor: (r) => r.amount,
    sortable: true,
    align: "right",
    render: (r) => (
      <span className="tabular-nums">
        {r.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {r.symbol}
      </span>
    ),
  },
  {
    key: "value",
    header: "Value",
    accessor: (r) => r.value,
    sortable: true,
    align: "right",
    render: (r) => <span className="tabular-nums font-medium">{currency(r.value)}</span>,
  },
  {
    key: "status",
    header: "Status",
    accessor: (r) => r.status,
    sortable: true,
    filterable: true,
    render: (r) => (
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[r.status]}`}>
        {r.status}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    accessor: (r) => r.date,
    sortable: true,
    defaultHidden: false,
    render: (r) => formatDate(r.date),
  },
];

export default function TableDemoPage() {
  const [striped, setStriped] = useState(true);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">
          Issue #462 · Page Design
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
          Advanced Data Table
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Sortable columns, global search, per-column filters, a keyboard-accessible
          column-visibility menu, sticky header on desktop, and a responsive card
          layout on mobile. All interaction is local state over a mock dataset.
        </p>
      </header>

      <label className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={striped}
          onChange={(e) => setStriped(e.target.checked)}
          className="h-4 w-4 accent-sky-500"
        />
        Zebra striping
      </label>

      <DataTable
        data={HOLDINGS}
        columns={columns}
        rowKey={(r) => r.id}
        striped={striped}
        searchPlaceholder="Search assets, type, status…"
        caption="Portfolio transactions with sortable, filterable columns"
        initialSort={{ key: "date", direction: "desc" }}
      />
    </main>
  );
}
