"use client";

import React, { useMemo } from "react";
import FilterChips from "./FilterChips";
import Pagination from "./Pagination";
import { useTransactionList, buildFilterOptions, MOCK_TRANSACTIONS, type Transaction } from "../../hooks/useTransactionList";
import { formatNumber } from "@/lib/formatters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  completed: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  pending:   { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  failed:    { bg: "rgba(239,68,68,0.12)",   color: "#ef4444" },
  cancelled: { bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
};

const COLUMNS: DataTableColumn<Transaction>[] = [
  { key: "date", header: "Date", accessor: (tx) => tx.date },
  { key: "description", header: "Description", accessor: (tx) => tx.description },
  {
    key: "type",
    header: "Type",
    accessor: (tx) => tx.type,
    render: (tx) => (
      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {tx.type}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    accessor: (tx) => tx.amount,
    align: "right",
    render: (tx) => (
      <span className="tabular-nums">
        {formatNumber(tx.amount)} {tx.currency}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    accessor: (tx) => tx.status,
    render: (tx) => (
      <span
        className="rounded px-2 py-0.5 text-[11px]"
        style={{
          background: STATUS_COLORS[tx.status]?.bg,
          color: STATUS_COLORS[tx.status]?.color,
        }}
      >
        {tx.status}
      </span>
    ),
  },
];

export default function TransactionList() {
  const { items, totalItems, page, setPage, selectedFilters, setSelectedFilters, itemsPerPage } =
    useTransactionList(8);

  const filterOptions = useMemo(() => buildFilterOptions(MOCK_TRANSACTIONS), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header — light/dark text pairing matches DataTable cell text below */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="m-0 text-base font-medium text-slate-700 dark:text-slate-200">
          Transactions
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {totalItems} results
        </span>
      </div>

      {/* Filters */}
      <FilterChips
        options={filterOptions}
        selected={selectedFilters}
        onChange={setSelectedFilters}
      />

      {/* Table */}
      <DataTable
        data={items}
        columns={COLUMNS}
        rowKey={(tx) => tx.id}
        searchable={false}
        caption={`Transaction history, ${totalItems} results`}
        emptyMessage="No transactions match the selected filters."
      />

      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        showJump
      />
    </div>
  );
}