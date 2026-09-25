"use client";

import React, { useMemo } from "react";
import FilterChips from "./FilterChips";
import Pagination from "./Pagination";
import { useTransactionList, buildFilterOptions, MOCK_TRANSACTIONS, type Transaction } from "../../hooks/useTransactionList";
import { formatNumber } from "@/lib/formatters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";

// Map transaction statuses onto the shared Badge variants (success/warning/error; neutral default).
const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "default"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  cancelled: "default",
};

const COLUMNS: DataTableColumn<Transaction>[] = [
  { key: "date", header: "Date", accessor: (tx) => tx.date },
  { key: "description", header: "Description", accessor: (tx) => tx.description },
  {
    key: "type",
    header: "Type",
    accessor: (tx) => tx.type,
    render: (tx) => (
      <Badge variant="default" size="sm">
        {tx.type}
      </Badge>
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
      <Badge variant={STATUS_VARIANT[tx.status] ?? "default"} size="sm">
        {tx.status}
      </Badge>
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