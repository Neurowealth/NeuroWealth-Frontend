"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDisabled(date: Date, min?: Date, max?: Date) {
  if (min && date < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
  if (max && date > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
  return false;
}

function buildGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1).getDay();
  const days: (Date | null)[] = [];
  for (let i = 0; i < first; i++) days.push(null);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length < 42) days.push(null);
  return days;
}

const ChevLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const CalIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

export default function DatePicker({ value, onChange, placeholder = "Select date", minDate, maxDate, disabled }: DatePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState((value ?? today).getFullYear());
  const [viewMonth, setViewMonth] = useState((value ?? today).getMonth());
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const grid = buildGrid(viewYear, viewMonth);
  const formatted = value ? value.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const select = (date: Date) => {
    if (isDisabled(date, minDate, maxDate)) return;
    onChange?.(date);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } return; }
    const activeDays = grid.filter(Boolean) as Date[];
    const cur = focusedIdx ?? 0;
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowRight") setFocusedIdx(Math.min(cur + 1, activeDays.length - 1));
    if (e.key === "ArrowLeft") setFocusedIdx(Math.max(cur - 1, 0));
    if (e.key === "ArrowDown") setFocusedIdx(Math.min(cur + 7, activeDays.length - 1));
    if (e.key === "ArrowUp") setFocusedIdx(Math.max(cur - 7, 0));
    if (e.key === "Enter" && focusedIdx !== null) select(activeDays[focusedIdx]);
    e.preventDefault();
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={value ? `Selected date: ${formatted}` : placeholder}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 36, padding: "0 12px", borderRadius: 8,
          border: `0.5px solid ${open ? "#6366f1" : "#374151"}`,
          background: "transparent", color: value ? "#e5e7eb" : "#6b7280",
          fontSize: 13, fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
          outline: "none", minWidth: 160, transition: "border-color 0.12s",
          opacity: disabled ? 0.5 : 1,
        }}
        onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 2px #6366f1")}
        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <CalIcon />
        <span style={{ flex: 1, textAlign: "left" }}>{formatted || placeholder}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Date picker"
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
            background: "#111827", border: "0.5px solid #374151",
            borderRadius: 10, padding: 12, width: 252,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <button onClick={prevMonth} aria-label="Previous month" style={navBtnStyle}><ChevLeft /></button>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#f9fafb" }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} aria-label="Next month" style={navBtnStyle}><ChevRight /></button>
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#6b7280", padding: "2px 0" }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid — 7×6 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {grid.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const isToday = isSameDay(date, today);
              const isSelected = value ? isSameDay(date, value) : false;
              const dis = isDisabled(date, minDate, maxDate);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(date)}
                  disabled={dis}
                  aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  aria-pressed={isSelected}
                  style={{
                    width: "100%", aspectRatio: "1", borderRadius: 6,
                    border: isToday && !isSelected ? "0.5px solid #6366f1" : "none",
                    background: isSelected ? "#6366f1" : "transparent",
                    color: isSelected ? "#fff" : dis ? "#374151" : isToday ? "#a5b4fc" : "#d1d5db",
                    fontSize: 12, cursor: dis ? "default" : "pointer",
                    fontFamily: "inherit", transition: "background 0.1s",
                    minHeight: 36, // ≥36px per spec
                  }}
                  onMouseEnter={e => { if (!isSelected && !dis) (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div style={{ marginTop: 8, borderTop: "0.5px solid #1f2937", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => { onChange?.(null); setOpen(false); }} style={actionBtnStyle}>Clear</button>
            <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); select(today); }} style={{ ...actionBtnStyle, color: "#a5b4fc" }}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 28, height: 28, borderRadius: 6, padding: 0,
};
const actionBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", fontSize: 12,
  color: "#6b7280", fontFamily: "inherit", padding: "2px 6px", borderRadius: 4,
};