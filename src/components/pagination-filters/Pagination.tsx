"use client";

import React, { useState, useId } from "react";

export interface PaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showJump?: boolean;
  className?: string;
}

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (current >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

const BTN_BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 36,
  height: 36,
  borderRadius: 8,
  border: "0.5px solid",
  fontSize: 13,
  fontFamily: "inherit",
  cursor: "pointer",
  background: "transparent",
  transition: "background 0.12s, color 0.12s, border-color 0.12s",
  outline: "none",
  padding: "0 8px",
};

export default function Pagination({
  totalItems,
  itemsPerPage = 10,
  currentPage: controlledPage,
  onPageChange,
  showJump = true,
  className = "",
}: PaginationProps) {
  const jumpId = useId();
  const [internalPage, setInternalPage] = useState(1);
  const [jumpVal, setJumpVal] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const current = controlledPage ?? internalPage;

  const go = (page: number) => {
    const p = Math.max(1, Math.min(totalPages, page));
    if (!controlledPage) setInternalPage(p);
    onPageChange?.(p);
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(jumpVal, 10);
    if (!isNaN(n)) { go(n); setJumpVal(""); }
  };

  const pages = getPageNumbers(current, totalPages);
  const start = (current - 1) * itemsPerPage + 1;
  const end = Math.min(current * itemsPerPage, totalItems);

  return (
    <nav aria-label="Pagination" className={className} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      {/* Prev */}
      <button
        onClick={() => go(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
        style={{
          ...BTN_BASE,
          borderColor: current === 1 ? "rgba(55,65,81,0.4)" : "#374151",
          color: current === 1 ? "#4b5563" : "#9ca3af",
          cursor: current === 1 ? "default" : "pointer",
        }}
        onMouseEnter={(e) => { if (current !== 1) { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "#e5e7eb"; } }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = current === 1 ? "#4b5563" : "#9ca3af"; }}
      >
        <ChevronLeft />
      </button>

      {/* Page numbers */}
      <div style={{ display: "flex", gap: 4 }}>
        {pages.map((p, i) => {
          if (p === "ellipsis") {
            return (
              <span key={`ellipsis-${i}`} style={{ ...BTN_BASE, border: "none", color: "#4b5563", minWidth: 28, cursor: "default", fontSize: 12, letterSpacing: 2 }}>
                ···
              </span>
            );
          }
          const isActive = p === current;
          return (
            <button
              key={p}
              onClick={() => go(p)}
              aria-label={`Page ${p}`}
              aria-current={isActive ? "page" : undefined}
              style={{
                ...BTN_BASE,
                minWidth: 36,
                borderColor: isActive ? "#6366f1" : "#374151",
                background: isActive ? "#6366f1" : "transparent",
                color: isActive ? "#fff" : "#9ca3af",
                fontWeight: isActive ? 500 : 400,
                cursor: isActive ? "default" : "pointer",
              }}
              onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "#e5e7eb"; } }}
              onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; } }}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        onClick={() => go(current + 1)}
        disabled={current === totalPages}
        aria-label="Next page"
        style={{
          ...BTN_BASE,
          borderColor: current === totalPages ? "rgba(55,65,81,0.4)" : "#374151",
          color: current === totalPages ? "#4b5563" : "#9ca3af",
          cursor: current === totalPages ? "default" : "pointer",
        }}
        onMouseEnter={(e) => { if (current !== totalPages) { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "#e5e7eb"; } }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = current === totalPages ? "#4b5563" : "#9ca3af"; }}
      >
        <ChevronRight />
      </button>

      {/* Jump */}
      {showJump && totalPages > 5 && (
        <form onSubmit={handleJump} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label htmlFor={jumpId} style={{ fontSize: 12, color: "#6b7280" }}>Go to</label>
          <input
            id={jumpId}
            type="number"
            min={1}
            max={totalPages}
            value={jumpVal}
            onChange={(e) => setJumpVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleJump(e as any); }}
            aria-label="Jump to page"
            style={{
              width: 52, height: 36, borderRadius: 8, border: "0.5px solid #374151",
              background: "transparent", color: "#e5e7eb", fontSize: 13,
              textAlign: "center", fontFamily: "inherit", outline: "none", padding: "0 6px",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
          />
        </form>
      )}

      {/* Count */}
      <span style={{ fontSize: 12, color: "#6b7280", marginLeft: "auto" }}>
        {start}–{end} of {totalItems.toLocaleString()}
      </span>
    </nav>
  );
}