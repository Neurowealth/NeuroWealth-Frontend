import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useStorageSync } from "./useStorageSync";

// #1041 — inline-arrow callbacks must not tear down and re-attach the window
// storage listener on every render.

describe("useStorageSync", () => {
  const originalAdd = window.addEventListener;
  const originalRemove = window.removeEventListener;

  afterEach(() => {
    window.addEventListener = originalAdd;
    window.removeEventListener = originalRemove;
  });

  function countStorageListeners() {
    const counts = { added: 0, removed: 0 };
    window.addEventListener = function (this: Window, type: string, ...rest: unknown[]) {
      if (type === "storage") counts.added += 1;
      return (originalAdd as (...args: unknown[]) => void).call(this, type, ...rest);
    } as typeof window.addEventListener;
    window.removeEventListener = function (this: Window, type: string, ...rest: unknown[]) {
      if (type === "storage") counts.removed += 1;
      return (originalRemove as (...args: unknown[]) => void).call(this, type, ...rest);
    } as typeof window.removeEventListener;
    return counts;
  }

  it("keeps a single listener across re-renders with a new inline callback", () => {
    const counts = countStorageListeners();
    const { rerender, unmount } = renderHook(({ tick }) => useStorageSync("k", () => void tick), {
      initialProps: { tick: 0 },
    });

    rerender({ tick: 1 });
    rerender({ tick: 2 });
    rerender({ tick: 3 });

    assert.equal(counts.added, 1);
    assert.equal(counts.removed, 0);

    unmount();
    assert.equal(counts.removed, 1);
  });

  it("invokes the latest callback passed on the most recent render", () => {
    const calls: string[] = [];
    const { rerender, unmount } = renderHook(
      ({ label }) => useStorageSync("k", (value) => calls.push(`${label}:${value}`)),
      { initialProps: { label: "first" } },
    );

    rerender({ label: "second" });

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "k", newValue: "v" }));
    });

    assert.deepEqual(calls, ["second:v"]);
    unmount();
  });

  it("ignores events for other keys", () => {
    const calls: Array<string | null> = [];
    const { unmount } = renderHook(() => useStorageSync("k", (value) => calls.push(value)));

    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "other", newValue: "v" }));
    });

    assert.deepEqual(calls, []);
    unmount();
  });
});
