"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";

export interface TimeValue { hours: number; minutes: number; }

export interface TimePickerProps {
  value?: TimeValue | null;
  onChange?: (time: TimeValue | null) => void;
  step?: 5 | 10 | 15;         // minutes per spec
  use24h?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

function fmt(h: number, m: number, use24h: boolean): string {
  if (use24h) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function buildSlots(step: number, use24h: boolean): { label: string; value: TimeValue }[] {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += step) {
      slots.push({ label: fmt(h, m, use24h), value: { hours: h, minutes: m } });
    }
  }
  return slots;
}

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function TimePicker({ value, onChange, step = 15, use24h = false, placeholder = "Select time", disabled }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-option-${i}`;

  const slots = useMemo(() => buildSlots(step, use24h), [step, use24h]);
  const filtered = useMemo(() =>
    search ? slots.filter(s => s.label.toLowerCase().includes(search.toLowerCase())) : slots,
    [search, slots]
  );
  const formatted = useMemo(() =>
    value ? fmt(value.hours, value.minutes, use24h) : "",
    [value, use24h]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset the active option whenever the picker opens or the filtered list changes
  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }
    const idx = value
      ? filtered.findIndex(s => s.value.hours === value.hours && s.value.minutes === value.minutes)
      : -1;
    setActiveIndex(idx !== -1 ? idx : 0);
  }, [open, value, filtered]);

  // Scroll the active option into view
  useEffect(() => {
    if (open && activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: "center" });
    }
  }, [open, activeIndex]);

  const select = useCallback((tv: TimeValue) => {
    onChange?.(tv);
    setOpen(false);
    setSearch("");
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowDown" && !open) setOpen(true);
  };

  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (filtered.length === 0 ? -1 : Math.min(i + 1, filtered.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (filtered.length === 0 ? -1 : Math.max(i - 1, 0)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[activeIndex];
      if (option) select(option.value);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={value ? `Selected time: ${formatted}` : placeholder}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 36, padding: "0 12px", borderRadius: 8,
          border: `0.5px solid ${open ? "#6366f1" : "#374151"}`,
          background: "transparent", color: value ? "#e5e7eb" : "#6b7280",
          fontSize: 13, fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
          outline: "none", minWidth: 140, opacity: disabled ? 0.5 : 1,
        }}
        onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 2px #6366f1")}
        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <ClockIcon />
        <span style={{ flex: 1, textAlign: "left" }}>{formatted || placeholder}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
          background: "#111827", border: "0.5px solid #374151",
          borderRadius: 10, width: 160, overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}>
          {/* Search/filter */}
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleFilterKeyDown}
              placeholder="Filter..."
              aria-label="Filter times"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              style={{
                width: "100%", height: 30, borderRadius: 6,
                border: "0.5px solid #374151", background: "#1f2937",
                color: "#e5e7eb", fontSize: 12, fontFamily: "inherit",
                padding: "0 8px", outline: "none",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#6366f1")}
              onBlur={e => (e.currentTarget.style.borderColor = "#374151")}
            />
          </div>

          {/* Time slot list — scrollable, 44px touch target */}
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Time slots"
            style={{ listStyle: "none", padding: "4px 4px", margin: 0, maxHeight: 200, overflowY: "auto" }}
          >
            {filtered.length === 0 && (
              <li style={{ padding: "8px 10px", fontSize: 12, color: "#6b7280", textAlign: "center" }}>No results</li>
            )}
            {filtered.map((s, i) => {
              const isSelected = value && s.value.hours === value.hours && s.value.minutes === value.minutes;
              const isActive = i === activeIndex;
              return (
                <li
                  key={i}
                  id={optionId(i)}
                  role="option"
                  aria-selected={!!isSelected}
                  onClick={() => select(s.value)}
                  onMouseEnter={() => setActiveIndex(i)}
                  style={{
                    padding: "0 10px",
                    height: 36,          // ≥36px pointer, approx 44px touch via line-height
                    display: "flex", alignItems: "center",
                    fontSize: 13, cursor: "pointer", borderRadius: 6,
                    background: isSelected ? "#6366f1" : isActive ? "#1f2937" : "transparent",
                    color: isSelected ? "#fff" : "#d1d5db",
                    outline: isActive && !isSelected ? "1px solid #6366f1" : "none",
                    outlineOffset: -1,
                    transition: "background 0.1s",
                  }}
                >
                  {s.label}
                </li>
              );
            })}
          </ul>

          {/* Clear */}
          {value && (
            <div style={{ borderTop: "0.5px solid #1f2937", padding: "6px 8px" }}>
              <button onClick={() => { onChange?.(null); setOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6b7280", fontFamily: "inherit" }}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}