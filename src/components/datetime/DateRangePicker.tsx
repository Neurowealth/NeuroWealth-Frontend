"use client";

import React, { useState, useRef, useEffect } from "react";

export interface DateRange { start: Date | null; end: Date | null; }

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function inRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = d.getTime();
  return t > start.getTime() && t < end.getTime();
}

function buildGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1).getDay();
  const days: (Date | null)[] = [];
  for (let i = 0; i < first; i++) days.push(null);
  const dim = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= dim; d++) days.push(new Date(year, month, d));
  while (days.length < 42) days.push(null);
  return days;
}

const ChevLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const CalIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

function CalendarMonth({
  year, month, range, hovered, onSelect, onHover,
}: {
  year: number; month: number;
  range: DateRange; hovered: Date | null;
  onSelect: (d: Date) => void;
  onHover: (d: Date | null) => void;
}) {
  const grid = buildGrid(year, month);
  const today = new Date();
  const effectiveEnd = range.start && !range.end && hovered ? hovered : range.end;

  return (
    <div style={{ minWidth: 220 }}>
      <div style={{ textAlign: "center", fontSize: 13, fontWeight: 500, color: "#f9fafb", marginBottom: 8 }}>
        {MONTHS_FULL[month]} {year}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#6b7280", padding: "2px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
        {grid.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const isStart = range.start ? sameDay(date, range.start) : false;
          const isEnd = effectiveEnd ? sameDay(date, effectiveEnd) : false;
          const inR = inRange(date, range.start, effectiveEnd);
          const isToday = sameDay(date, today);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(date)}
              onMouseEnter={() => onHover(date)}
              onMouseLeave={() => onHover(null)}
              aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              aria-pressed={isStart || isEnd}
              style={{
                width: "100%", aspectRatio: "1", minHeight: 36,
                border: isToday && !isStart && !isEnd ? "0.5px solid #6366f1" : "none",
                // Start: solid accent; End: distinct teal; Range: subtle fill
                background: isStart
                  ? "#6366f1"
                  : isEnd
                    ? "#0f6e56"
                    : inR
                      ? "rgba(99,102,241,0.12)"
                      : "transparent",
                color: isStart || isEnd ? "#fff" : inR ? "#a5b4fc" : isToday ? "#a5b4fc" : "#d1d5db",
                fontWeight: isStart || isEnd ? 500 : 400,
                borderRadius: isStart ? "6px 0 0 6px" : isEnd ? "0 6px 6px 0" : inR ? 0 : 6,
                fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                transition: "background 0.08s",
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePicker({ value, onChange, minDate, maxDate, placeholder = "Select date range", disabled }: DateRangePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>(value ?? { start: null, end: null });
  const [hovered, setHovered] = useState<Date | null>(null);
  const [leftYear, setLeftYear] = useState(today.getFullYear());
  const [leftMonth, setLeftMonth] = useState(today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (date: Date) => {
    if (!range.start || (range.start && range.end)) {
      const next = { start: date, end: null };
      setRange(next);
    } else {
      const next = date < range.start
        ? { start: date, end: range.start }
        : { start: range.start, end: date };
      setRange(next);
      onChange?.(next);
      setOpen(false);
    }
  };

  const prevMonth = () => { if (leftMonth === 0) { setLeftMonth(11); setLeftYear(y => y - 1); } else setLeftMonth(m => m - 1); };
  const nextMonth = () => { if (leftMonth === 11) { setLeftMonth(0); setLeftYear(y => y + 1); } else setLeftMonth(m => m + 1); };

  const fmtDate = (d: Date | null) => d ? `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : "";
  const label = range.start
    ? range.end ? `${fmtDate(range.start)} – ${fmtDate(range.end)}` : `${fmtDate(range.start)} – …`
    : "";

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label || placeholder}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          height: 36, padding: "0 12px", borderRadius: 8,
          border: `0.5px solid ${open ? "#6366f1" : "#374151"}`,
          background: "transparent", color: label ? "#e5e7eb" : "#6b7280",
          fontSize: 13, fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
          outline: "none", minWidth: 240, opacity: disabled ? 0.5 : 1,
        }}
        onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 2px #6366f1")}
        onBlur={e => (e.currentTarget.style.boxShadow = "none")}
      >
        <CalIcon />
        <span style={{ flex: 1, textAlign: "left", fontSize: label && range.end ? 12 : 13 }}>{label || placeholder}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Date range picker"
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
            background: "#111827", border: "0.5px solid #374151",
            borderRadius: 12, padding: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          {/* Nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={prevMonth} aria-label="Previous month" style={navStyle}><ChevLeft /></button>
            <button onClick={nextMonth} aria-label="Next month" style={navStyle}><ChevRight /></button>
          </div>

          {/* Dual calendar */}
          <div style={{ display: "flex", gap: 20 }}>
            <CalendarMonth year={leftYear} month={leftMonth} range={range} hovered={hovered} onSelect={select} onHover={setHovered} />
            <div style={{ width: "0.5px", background: "#1f2937", alignSelf: "stretch" }} />
            <CalendarMonth year={rightYear} month={rightMonth} range={range} hovered={hovered} onSelect={select} onHover={setHovered} />
          </div>

          {/* Legend */}
          <div style={{ marginTop: 12, display: "flex", gap: 16, alignItems: "center", borderTop: "0.5px solid #1f2937", paddingTop: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9ca3af" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#6366f1", display: "inline-block" }} />Start
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9ca3af" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#0f6e56", display: "inline-block" }} />End
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9ca3af" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(99,102,241,0.2)", display: "inline-block" }} />Range
            </span>
            <button
              onClick={() => { const r = { start: null, end: null }; setRange(r); onChange?.(r); }}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6b7280", fontFamily: "inherit" }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const navStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 28, height: 28, borderRadius: 6, padding: 0,
};