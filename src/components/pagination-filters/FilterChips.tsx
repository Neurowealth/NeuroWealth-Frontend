"use client";

import React from "react";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
  group?: string;
}

export interface FilterChipsProps {
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function FilterChips({ options, selected, onChange, className = "" }: FilterChipsProps) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const clearAll = () => onChange([]);
  const hasActive = selected.length > 0;

  return (
    <div
      role="group"
      aria-label="Filter options"
      className={className}
      style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
    >
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            role="checkbox"
            aria-checked={active}
            onClick={() => toggle(opt.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              minHeight: 36,
              padding: "0 10px",
              borderRadius: 20,
              border: `0.5px solid ${active ? "#6366f1" : "#374151"}`,
              background: active ? "rgba(99,102,241,0.12)" : "transparent",
              color: active ? "#a5b4fc" : "#9ca3af",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.12s",
              outline: "none",
              whiteSpace: "nowrap",
            }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #6366f1")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.color = "#e5e7eb"; } }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#9ca3af"; } }}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: active ? "#6366f1" : "#1f2937",
                color: active ? "#fff" : "#9ca3af",
                fontSize: 11,
                fontWeight: 500,
                padding: "0 5px",
                lineHeight: 1,
                transition: "all 0.12s",
              }}
                aria-label={`${opt.count} items`}
              >
                {opt.count > 999 ? "999+" : opt.count}
              </span>
            )}
            {active && (
              <span style={{ display: "inline-flex", alignItems: "center", marginLeft: 1, opacity: 0.7 }}>
                <XIcon />
              </span>
            )}
          </button>
        );
      })}

      {/* Clear all — always visible when filters active */}
      {hasActive && (
        <button
          onClick={clearAll}
          aria-label={`Clear all ${selected.length} active filters`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            minHeight: 36,
            padding: "0 10px",
            borderRadius: 20,
            border: "0.5px solid #374151",
            background: "transparent",
            color: "#6b7280",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
            transition: "all 0.12s",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #6366f1")}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#ef4444"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "#374151"; }}
        >
          Clear all
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 16, height: 16, borderRadius: 8,
            background: "#374151", color: "#9ca3af", fontSize: 10, fontWeight: 500,
          }}>
            {selected.length}
          </span>
        </button>
      )}
    </div>
  );
}