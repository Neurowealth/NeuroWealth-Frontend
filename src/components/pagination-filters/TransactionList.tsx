"use client";

import React from "react";
import FilterChips from "./FilterChips";
import Pagination from "./Pagination";
import { useTransactionList, buildFilterOptions, MOCK_TRANSACTIONS } from "./useTransactionList";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  completed: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  pending:   { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
  failed:    { bg: "rgba(239,68,68,0.12)",   color: "#ef4444" },
  cancelled: { bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
};

export default function TransactionList() {
  const { items, totalItems, page, setPage, selectedFilters, setSelectedFilters, itemsPerPage } =
    useTransactionList(8);

  const filterOptions = buildFilterOptions(MOCK_TRANSACTIONS);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#f9fafb", margin: 0 }}>Transactions</h2>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{totalItems} results</span>
      </div>

      {/* Filters */}
      <FilterChips
        options={filterOptions}
        selected={selectedFilters}
        onChange={setSelectedFilters}
      />

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "0.5px solid #21262d" }}>
              {["Date", "Description", "Type", "Amount", "Status"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#6b7280", fontWeight: 400, fontSize: 11, letterSpacing: "0.05em" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: "0.5px solid #161b22" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#161b22")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "10px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{tx.date}</td>
                <td style={{ padding: "10px 12px", color: "#e5e7eb" }}>{tx.description}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: 11, color: "#9ca3af", background: "#1f2937", borderRadius: 4, padding: "2px 7px" }}>
                    {tx.type}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", color: "#e5e7eb", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {tx.amount.toLocaleString()} {tx.currency}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    fontSize: 11, borderRadius: 4, padding: "2px 8px",
                    background: STATUS_COLORS[tx.status]?.bg,
                    color: STATUS_COLORS[tx.status]?.color,
                  }}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#6b7280", fontSize: 13 }}>
            No transactions match the selected filters.
          </div>
        )}
      </div>

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