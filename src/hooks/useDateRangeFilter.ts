import { useState, useMemo } from "react";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilteredData {
  id: string;
  date: Date;
  amount: number;
  description: string;
}

/**
 * useDateRangeFilter
 *
 * Mock hook for filtering datasets by selected date range.
 * Use with DateRangePicker component.
 */
export function useDateRangeFilter(data: FilteredData[]) {
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  const filtered = useMemo(() => {
    if (!range.start || !range.end) return data;

    return data.filter((item) => {
      const time = item.date.getTime();
      const startTime = range.start!.getTime();
      const endTime = range.end!.getTime();
      return time >= startTime && time <= endTime;
    });
  }, [data, range]);

  return {
    range,
    setRange,
    filtered,
    count: filtered.length,
  };
}

/**
 * useDateFilter
 *
 * Local-state date filter — returns date/setDate with filtered results.
 */
export { useLocalDateFilter as useDateFilter };

/**
 * useLocalDateFilter
 *
 * Mock hook for filtering by single date selection with local state.
 * Note: This is a local-state variant; use useDateFilter from useDateFilter.ts
 * for range-based filtering without internal state management.
 */
export function useLocalDateFilter(data: FilteredData[]) {
  const [date, setDate] = useState<Date | null>(null);

  const filtered = useMemo(() => {
    if (!date) return data;

    return data.filter((item) => {
      return (
        item.date.getFullYear() === date.getFullYear() &&
        item.date.getMonth() === date.getMonth() &&
        item.date.getDate() === date.getDate()
      );
    });
  }, [data, date]);

  return {
    date,
    setDate,
    filtered,
    count: filtered.length,
  };
}

/**
 * useTimeRangeFilter
 *
 * Mock hook for filtering by time range (hours/minutes).
 */
export interface TimeValue {
  hours: number;
  minutes: number;
}

export function useTimeRangeFilter(data: FilteredData[]) {
  const [startTime, setStartTime] = useState<TimeValue | null>(null);
  const [endTime, setEndTime] = useState<TimeValue | null>(null);

  const filtered = useMemo(() => {
    if (!startTime || !endTime) return data;

    return data.filter((item) => {
      const itemHour = item.date.getHours();
      const itemMin = item.date.getMinutes();
      const itemTotalMin = itemHour * 60 + itemMin;

      const startTotalMin = startTime.hours * 60 + startTime.minutes;
      const endTotalMin = endTime.hours * 60 + endTime.minutes;

      return itemTotalMin >= startTotalMin && itemTotalMin <= endTotalMin;
    });
  }, [data, startTime, endTime]);

  return {
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    filtered,
    count: filtered.length,
  };
}

/**
 * useDateTimeRangeFilter
 *
 * Mock hook for filtering by date AND time range.
 */
export function useDateTimeRangeFilter(data: FilteredData[]) {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [startTime, setStartTime] = useState<TimeValue | null>(null);
  const [endTime, setEndTime] = useState<TimeValue | null>(null);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      // Date range check
      if (dateRange.start || dateRange.end) {
        const itemTime = item.date.getTime();
        if (dateRange.start) {
          const startTime = new Date(dateRange.start);
          startTime.setHours(0, 0, 0, 0);
          if (itemTime < startTime.getTime()) return false;
        }
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (itemTime > endDate.getTime()) return false;
        }
      }

      // Time range check
      if (startTime || endTime) {
        const itemHour = item.date.getHours();
        const itemMin = item.date.getMinutes();
        const itemTotalMin = itemHour * 60 + itemMin;

        if (startTime) {
          const startTotalMin = startTime.hours * 60 + startTime.minutes;
          if (itemTotalMin < startTotalMin) return false;
        }

        if (endTime) {
          const endTotalMin = endTime.hours * 60 + endTime.minutes;
          if (itemTotalMin > endTotalMin) return false;
        }
      }

      return true;
    });
  }, [data, dateRange, startTime, endTime]);

  return {
    dateRange,
    setDateRange,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    filtered,
    count: filtered.length,
  };
}
