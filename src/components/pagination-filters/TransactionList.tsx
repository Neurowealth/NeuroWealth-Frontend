"use client";

import React, { useMemo } from "react";
import FilterChips from "./FilterChips";
import Pagination from "./Pagination";
import { useTransactionList, buildFilterOptions, MOCK_TRANSACTIONS, type Transaction } from "../../hooks/useTransactionList";
import { formatNumber } from "@/lib/formatters";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/contexts/I18nContext";

// Map transaction statuses onto the shared Badge variants (success/warning/error; neutral default).
const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "default"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  cancelled: "default",
};

type ColumnHeaders = ReturnType<typeof useI18n>["messages"]["transactions"]["list"]["columns"];

function buildColumns(headers: ColumnHeaders): DataTableColumn<Transaction>[] {
  return [
    { key: "date", header: headers.date, accessor: (tx) => tx.date },
    { key: "description", header: headers.description, accessor: (tx) => tx.description },
    {
      key: "type",
      header: headers.type,
      accessor: (tx) => tx.type,
      render: (tx) => (
        <Badge variant="default" size="sm">
          {tx.type}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: headers.amount,
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
      header: headers.status,
      accessor: (tx) => tx.status,
      render: (tx) => (
        <Badge variant={STATUS_VARIANT[tx.status] ?? "default"} size="sm">
          {tx.status}
        </Badge>
      ),
    },
  ];
}

export default function TransactionList() {
  const { items, totalItems, page, setPage, selectedFilters, setSelectedFilters, itemsPerPage } =
    useTransactionList(8);

  const { messages } = useI18n();
  const t = messages.transactions.list;

  const filterOptions = useMemo(() => buildFilterOptions(MOCK_TRANSACTIONS), []);
  const columns = useMemo(() => buildColumns(t.columns), [t.columns]);
  const resultsCount = t.resultsCount.replace("{count}", String(totalItems));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header — light/dark text pairing matches DataTable cell text below */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="m-0 text-base font-medium text-slate-700 dark:text-slate-200">
          {t.heading}
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {resultsCount}
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
        columns={columns}
        rowKey={(tx) => tx.id}
        searchable={false}
        caption={t.caption.replace("{count}", String(totalItems))}
        emptyMessage={t.empty}
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