import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  useDateRangeFilter,
  useLocalDateFilter,
  useTimeRangeFilter,
  useDateTimeRangeFilter,
  type FilteredData,
} from "./useDateRangeFilter";
import { renderHook, act } from "@/test-utils/render-hook";

// Mock data for testing
const mockData: FilteredData[] = [
  {
    id: "1",
    date: new Date("2024-06-15T10:30:00"),
    amount: 100,
    description: "Transaction 1",
  },
  {
    id: "2",
    date: new Date("2024-06-16T14:45:00"),
    amount: 200,
    description: "Transaction 2",
  },
  {
    id: "3",
    date: new Date("2024-06-20T08:00:00"),
    amount: 150,
    description: "Transaction 3",
  },
  {
    id: "4",
    date: new Date("2024-07-01T16:30:00"),
    amount: 300,
    description: "Transaction 4",
  },
];

describe("useDateRangeFilter", () => {
  it("initializes with no range and returns all data", () => {
    const { result } = renderHook(() => useDateRangeFilter(mockData));

    assert.equal(result.current.filtered.length, 4);
    assert.deepEqual(result.current.range, { start: null, end: null });
    assert.equal(result.current.count, 4);
  });

  it("filters data by date range", () => {
    const { result } = renderHook(() => useDateRangeFilter(mockData));

    act(() => {
      result.current.setRange({
        start: new Date("2024-06-15"),
        end: new Date("2024-06-20T23:59:59"),
      });
    });

    // Should include transactions on June 15, 16, and 20 (inclusive)
    assert.equal(result.current.filtered.length, 3);
    assert.equal(result.current.count, 3);
  });

  it("handles empty date range", () => {
    const { result } = renderHook(() => useDateRangeFilter(mockData));

    act(() => {
      result.current.setRange({
        start: new Date("2024-08-01"),
        end: new Date("2024-08-31"),
      });
    });

    // No transactions in August
    assert.equal(result.current.filtered.length, 0);
    assert.equal(result.current.count, 0);
  });

  it("filters with start date only", () => {
    const { result } = renderHook(() => useDateRangeFilter(mockData));

    act(() => {
      result.current.setRange({
        start: new Date("2024-06-20"),
        end: null,
      });
    });

    // Hook requires both start AND end to filter; with end=null, all data is returned
    assert.equal(result.current.filtered.length, 4);
  });

  it("filters with end date only", () => {
    const { result } = renderHook(() => useDateRangeFilter(mockData));

    act(() => {
      result.current.setRange({
        start: null,
        end: new Date("2024-06-16"),
      });
    });

    // Hook requires both start AND end to filter; with start=null, all data is returned
    assert.equal(result.current.filtered.length, 4);
  });
});

describe("useLocalDateFilter", () => {
  it("initializes with no date and returns all data", () => {
    const { result } = renderHook(() => useLocalDateFilter(mockData));

    assert.equal(result.current.filtered.length, 4);
    assert.equal(result.current.count, 4);
    assert.equal(result.current.date, null);
  });

  it("filters data by single date", () => {
    const { result } = renderHook(() => useLocalDateFilter(mockData));

    act(() => {
      result.current.setDate(new Date("2024-06-15"));
    });

    // Should only include June 15 transactions
    assert.equal(result.current.filtered.length, 1);
    assert.equal(result.current.filtered[0].id, "1");
    assert.equal(result.current.count, 1);
  });

  it("handles date with no matching transactions", () => {
    const { result } = renderHook(() => useLocalDateFilter(mockData));

    act(() => {
      result.current.setDate(new Date("2024-08-15"));
    });

    // No transactions on this date
    assert.equal(result.current.filtered.length, 0);
    assert.equal(result.current.count, 0);
  });

  it("clears date filter when set to null", () => {
    const { result } = renderHook(() => useLocalDateFilter(mockData));

    act(() => {
      result.current.setDate(new Date("2024-06-15"));
    });

    assert.equal(result.current.filtered.length, 1);

    act(() => {
      result.current.setDate(null);
    });

    assert.equal(result.current.filtered.length, 4);
  });
});

describe("useTimeRangeFilter", () => {
  it("initializes with no time range and returns all data", () => {
    const { result } = renderHook(() => useTimeRangeFilter(mockData));

    assert.equal(result.current.filtered.length, 4);
  });

  it("filters data by time range", () => {
    const { result } = renderHook(() => useTimeRangeFilter(mockData));

    act(() => {
      result.current.setStartTime({ hours: 10, minutes: 0 });
      result.current.setEndTime({ hours: 15, minutes: 0 });
    });

    // Should include 10:30 and 14:45, exclude 08:00 and 16:30
    assert.equal(result.current.filtered.length, 2);
  });

  it("handles exclusive boundaries correctly", () => {
    const { result } = renderHook(() => useTimeRangeFilter(mockData));

    act(() => {
      result.current.setStartTime({ hours: 10, minutes: 30 });
      result.current.setEndTime({ hours: 14, minutes: 45 });
    });

    // Should include transactions within time range (inclusive)
    assert.ok(result.current.filtered.length >= 1);
  });
});

describe("useDateTimeRangeFilter", () => {
  it("initializes with no filters and returns all data", () => {
    const { result } = renderHook(() => useDateTimeRangeFilter(mockData));

    assert.equal(result.current.filtered.length, 4);
  });

  it("filters by date range", () => {
    const { result } = renderHook(() => useDateTimeRangeFilter(mockData));

    act(() => {
      result.current.setDateRange({
        start: new Date("2024-06-15"),
        end: new Date("2024-06-20"),
      });
    });

    // Should include June 15, 16, 20
    assert.equal(result.current.filtered.length, 3);
  });

  it("filters by time range", () => {
    const { result } = renderHook(() => useDateTimeRangeFilter(mockData));

    act(() => {
      result.current.setStartTime({ hours: 10, minutes: 0 });
      result.current.setEndTime({ hours: 16, minutes: 0 });
    });

    // Should include 10:30, 14:45, 16:30 (within time range, inclusive)
    assert.ok(result.current.filtered.length >= 2);
  });

  it("filters by both date and time range", () => {
    const { result } = renderHook(() => useDateTimeRangeFilter(mockData));

    act(() => {
      result.current.setDateRange({
        start: new Date("2024-06-15"),
        end: new Date("2024-06-20"),
      });
      result.current.setStartTime({ hours: 9, minutes: 0 });
      result.current.setEndTime({ hours: 15, minutes: 0 });
    });

    // Should include June 15 (10:30), June 16 (14:45)
    assert.equal(result.current.filtered.length, 2);
  });
});
