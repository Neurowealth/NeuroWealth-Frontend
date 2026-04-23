"use client";

import { useMemo } from "react";
import { DateRange } from "./DateRangePicker";

export interface DateFilterable {
  date: string | Date;
  [key: string]: unknown;
}

/**
 * useDateFilter — filters any dataset by a DateRange.
 * Pass your full dataset and a range; get back filtered items.
 *
 * @example
 * const { filtered, count } = useDateFilter(transactions, range);
 */
export function useDateFilter<T extends DateFilterable>(
  data: T[],
  range: DateRange
): { filtered: T[]; count: number; hasFilter: boolean } {
  const filtered = useMemo(() => {
    if (!range.start && !range.end) return data;
    return data.filter((item) => {
      const d = item.date instanceof Date ? item.date : new Date(item.date);
      if (isNaN(d.getTime())) return true;
      const t = d.getTime();
      // ✅ Clone before calling .setHours() to avoid mutating the original Date objects
      const startOk =
        !range.start || t >= new Date(range.start).setHours(0, 0, 0, 0);
      const endOk =
        !range.end || t <= new Date(range.end).setHours(23, 59, 59, 999);
      return startOk && endOk;
    });
  }, [data, range.start, range.end]);

  return {
    filtered,
    count: filtered.length,
    hasFilter: !!(range.start || range.end),
  };
}

/**
 * useTimeFilter — filters items by a time-of-day window.
 * Useful for audit logs, transactions with timestamps.
 */
export function useTimeFilter<T extends { time: string }>(
  data: T[],
  from: { hours: number; minutes: number } | null,
  to: { hours: number; minutes: number } | null
): T[] {
  return useMemo(() => {
    if (!from && !to) return data;
    return data.filter((item) => {
      const [h, m] = item.time.split(":").map(Number);
      const mins = h * 60 + m;
      const fromMins = from ? from.hours * 60 + from.minutes : 0;
      const toMins = to ? to.hours * 60 + to.minutes : 1439;
      return mins >= fromMins && mins <= toMins;
    });
  }, [data, from, to]);
}