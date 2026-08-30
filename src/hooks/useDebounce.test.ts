import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  it("returns the initial value after mounting", () => {
    const { result } = renderHook(() => useDebounce("initial", 100));
    assert.equal(result.current, "initial");
  });

  it("debounces value changes and updates after delay", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 100 } }
    );

    assert.equal(result.current, "first");

    act(() => {
      rerender({ value: "second", delay: 100 });
    });

    // Value hasn't updated yet (within debounce delay)
    assert.equal(result.current, "first");

    // Wait for debounce to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    assert.equal(result.current, "second");
  });

  it("resets timer on rapid value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 100 } }
    );

    act(() => {
      rerender({ value: "second", delay: 100 });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Fire another change before first debounce completes
    act(() => {
      rerender({ value: "third", delay: 100 });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 75));
    });

    // Should still be on first value (both timers cleared and restarted)
    assert.equal(result.current, "first");

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Now it should have updated to "third", not "second"
    assert.equal(result.current, "third");
  });

  it("respects changed delay on next update", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 200 } }
    );

    act(() => {
      rerender({ value: "updated", delay: 50 });
    });

    // With new shorter delay, should update faster
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 75));
    });

    assert.equal(result.current, "updated");
  });

  it("clears timer on unmount", async () => {
    const { result, unmount } = renderHook(() => useDebounce("value", 500));

    unmount();

    // Should not throw or cause memory leaks
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  it("works with non-string values", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: number; delay: number }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 100 } }
    );

    assert.equal(result.current, 42);

    act(() => {
      rerender({ value: 99, delay: 100 });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    assert.equal(result.current, 99);
  });
});
