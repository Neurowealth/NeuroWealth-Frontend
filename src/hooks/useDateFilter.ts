"use client";

import { useMemo } from "react";
import type { DateFilterable, DateRange } from "@/types";

export function filterByDateRange<T extends DateFilterable>(
  data: readonly T[],
  range: DateRange,
): T[] {
  if (!range.start && !range.end) return [...data];

  return data.filter((item) => {
    const dateValue = item.date instanceof Date ? item.date : new Date(item.date);
    if (isNaN(dateValue.getTime())) return true;

    const timestamp = dateValue.getTime();
    const startOk =
      !range.start || timestamp >= new Date(range.start).setHours(0, 0, 0, 0);
    const endOk =
      !range.end || timestamp <= new Date(range.end).setHours(23, 59, 59, 999);

    return startOk && endOk;
  });
}

export function filterByTimeRange<T extends { time: string }>(
  data: readonly T[],
  from: { hours: number; minutes: number } | null,
  to: { hours: number; minutes: number } | null,
): T[] {
  if (!from && !to) return [...data];

  return data.filter((item) => {
    const [hours, minutes] = item.time.split(":").map(Number);
    const itemMinutes = hours * 60 + minutes;
    const fromMinutes = from ? from.hours * 60 + from.minutes : 0;
    const toMinutes = to ? to.hours * 60 + to.minutes : 1439;

    return itemMinutes >= fromMinutes && itemMinutes <= toMinutes;
  });
}

/**
 * useDateFilter — filters any dataset by a DateRange.
 * Pass your full dataset and a range; get back filtered items.
 *
 * @example
 * const { filtered, count } = useDateFilter(transactions, range);
 */
export function useDateFilter<T extends DateFilterable>(
  data: readonly T[],
  range: DateRange
): { filtered: T[]; count: number; hasFilter: boolean } {
  const { start, end } = range;
  const filtered = useMemo(
    () => filterByDateRange(data, { start, end }),
    [data, start, end],
  );

  return {
    filtered,
    count: filtered.length,
    hasFilter: !!(start || end),
  };
}

/**
 * useTimeFilter — filters items by a time-of-day window.
 * Useful for audit logs, transactions with timestamps.
 */
export function useTimeFilter<T extends { time: string }>(
  data: readonly T[],
  from: { hours: number; minutes: number } | null,
  to: { hours: number; minutes: number } | null
): T[] {
  return useMemo(() => filterByTimeRange(data, from, to), [data, from, to]);
}
