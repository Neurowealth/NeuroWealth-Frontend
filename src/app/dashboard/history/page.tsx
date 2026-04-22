"use client";

import { useMemo, useState } from "react";
import { Settings2, TableProperties } from "lucide-react";
import { AdvancedTable, Button, Card, FormattedValue, InlineBanner } from "@/components/ui";

type HistoryStatus = "Completed" | "Pending" | "Failed";
type HistoryType = "Deposit" | "Withdrawal" | "Yield" | "Rebalance";

interface HistoryRow {
  id: string;
  createdAt: string;
  type: HistoryType;
  asset: string;
  amount: number;
  apy: number;
  status: HistoryStatus;
  owner: string;
}

const HISTORY_ROWS: HistoryRow[] = [
  {
    id: "txn-101",
    createdAt: "Apr 22, 2026",
    type: "Deposit",
    asset: "USDC",
    amount: 18000,
    apy: 6.42,
    status: "Completed",
    owner: "Treasury Ops",
  },
  {
    id: "txn-102",
    createdAt: "Apr 21, 2026",
    type: "Yield",
    asset: "USDC",
    amount: 145.28,
    apy: 4.88,
    status: "Completed",
    owner: "Autopilot",
  },
  {
    id: "txn-103",
    createdAt: "Apr 20, 2026",
    type: "Rebalance",
    asset: "XLM",
    amount: -3200,
    apy: -0.72,
    status: "Pending",
    owner: "Strategy Desk",
  },
  {
    id: "txn-104",
    createdAt: "Apr 19, 2026",
    type: "Withdrawal",
    asset: "USDC",
    amount: -5600,
    apy: 0,
    status: "Failed",
    owner: "Treasury Ops",
  },
  {
    id: "txn-105",
    createdAt: "Apr 18, 2026",
    type: "Deposit",
    asset: "yUSDC",
    amount: 8200,
    apy: 5.31,
    status: "Completed",
    owner: "Liquidity Team",
  },
  {
    id: "txn-106",
    createdAt: "Apr 17, 2026",
    type: "Yield",
    asset: "USDC",
    amount: 88.44,
    apy: 4.13,
    status: "Completed",
    owner: "Autopilot",
  },
];

const statusClasses: Record<HistoryStatus, string> = {
  Completed: "bg-emerald-500/12 text-emerald-200 border-emerald-400/25",
  Pending: "bg-amber-500/12 text-amber-200 border-amber-400/25",
  Failed: "bg-red-500/12 text-red-200 border-red-400/25",
};

export default function HistoryPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<HistoryType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<HistoryStatus | "All">("All");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return HISTORY_ROWS.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [row.id, row.asset, row.owner, row.type, row.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesType = typeFilter === "All" || row.type === typeFilter;
      const matchesStatus = statusFilter === "All" || row.status === statusFilter;

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [query, statusFilter, typeFilter]);

  return (
    <main className="space-y-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
          Issue #86
        </p>
        <h1 className="text-3xl font-bold text-slate-50">
          Advanced transaction table
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          This reusable table supports sorting, filtering, column visibility,
          a sticky desktop header, and a mobile card layout for smaller screens.
        </p>
      </div>

      <InlineBanner
        variant="info"
        eyebrow="Reusable Data Grid"
        title="Column visibility, sorting, and filters stay accessible"
      >
        Use the filter input and column menu to validate the keyboard-friendly
        controls, then shrink the viewport to see the mobile card variant.
      </InlineBanner>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="space-y-4 border-slate-700/50 bg-dark-800/70">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-2 text-sky-300">
              <TableProperties className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Filter controls
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Stack filters with free text search to inspect the component
                behavior under common dashboard usage.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Transaction type</span>
              <select
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2 text-slate-100 outline-none"
                onChange={(event) => setTypeFilter(event.target.value as HistoryType | "All")}
                value={typeFilter}
              >
                <option value="All">All</option>
                <option value="Deposit">Deposit</option>
                <option value="Withdrawal">Withdrawal</option>
                <option value="Yield">Yield</option>
                <option value="Rebalance">Rebalance</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              <span>Status</span>
              <select
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2 text-slate-100 outline-none"
                onChange={(event) => setStatusFilter(event.target.value as HistoryStatus | "All")}
                value={statusFilter}
              >
                <option value="All">All</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </label>
          </div>

          <Button
            className="justify-start"
            onClick={() => {
              setQuery("");
              setTypeFilter("All");
              setStatusFilter("All");
            }}
            variant="secondary"
          >
            <Settings2 className="h-4 w-4" />
            Reset filters
          </Button>
        </Card>

        <Card className="space-y-4 border-slate-700/50 bg-dark-800/70">
          <h2 className="text-lg font-semibold text-slate-100">Coverage</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p>Header height targets the 44px spec with sticky behavior on desktop.</p>
            <p>Rows sit around 56px tall and keep zebra striping theme-consistent.</p>
            <p>Column controls remain usable without a mouse via native details/summary behavior.</p>
          </div>
        </Card>
      </div>

      <AdvancedTable
        columns={[
          {
            key: "createdAt",
            label: "Date",
            accessor: (row) => row.createdAt,
          },
          {
            key: "type",
            label: "Type",
            accessor: (row) => row.type,
          },
          {
            key: "asset",
            label: "Asset",
            accessor: (row) => row.asset,
          },
          {
            key: "amount",
            label: "Amount",
            accessor: (row) => row.amount,
            className: "text-right",
            render: (row) => (
              <div className="text-right">
                <FormattedValue
                  kind="currency"
                  label={`${row.type} amount`}
                  signed
                  value={row.amount}
                />
              </div>
            ),
          },
          {
            key: "apy",
            label: "APY",
            accessor: (row) => row.apy,
            className: "text-right",
            render: (row) => (
              <div className="text-right">
                <FormattedValue kind="percent" label="Effective APY" signed value={row.apy} />
              </div>
            ),
          },
          {
            key: "status",
            label: "Status",
            accessor: (row) => row.status,
            render: (row) => (
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[row.status]}`}
              >
                {row.status}
              </span>
            ),
          },
          {
            key: "owner",
            label: "Owner",
            accessor: (row) => row.owner,
          },
        ]}
        description="Desktop uses a sticky table header while mobile automatically falls back to readable stacked cards."
        emptyState={
          <Card className="border-slate-700/50 bg-dark-800/70 text-sm text-slate-300">
            No rows match the active filters. Adjust the query or reset the filters.
          </Card>
        }
        filterPlaceholder="Search by id, asset, owner, type, or status"
        filterValue={query}
        onFilterChange={setQuery}
        rows={filteredRows}
        title="Portfolio history"
      />
    </main>
  );
}
