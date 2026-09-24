import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useStorageSync } from "./useStorageSync";

describe("useStorageSync", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // #857 — key-mismatch: StorageEvent with a different key must not call onChange
  it("ignores StorageEvents whose key does not match the watched key", () => {
    let callCount = 0;
    const onChange = () => {
      callCount += 1;
    };

    renderHook(() => useStorageSync("watched-key", onChange));

    act(() => {
      window.dispatchEvent(
        new window.StorageEvent("storage", {
          key: "unrelated-key",
          newValue: "some-value",
        }),
      );
    });

    assert.strictEqual(callCount, 0, "onChange must NOT be called for a non-matching key");

    // Confirm the hook DOES fire for the correct key (sanity check)
    act(() => {
      window.dispatchEvent(
        new window.StorageEvent("storage", {
          key: "watched-key",
          newValue: "some-value",
        }),
      );
    });

    assert.strictEqual(callCount, 1, "onChange MUST be called for the matching key");
  });

  // #857 — listener re-subscription: when onChange identity changes across renders,
  // the new callback should handle subsequent events (old closure is not held).
  it("re-subscribes the listener when onChange identity changes across renders", () => {
    let firstCallCount = 0;
    let secondCallCount = 0;

    const firstOnChange = () => {
      firstCallCount += 1;
    };
    const secondOnChange = () => {
      secondCallCount += 1;
    };

    const { rerender } = renderHook(
      ({ cb }: { cb: (v: string | null) => void }) =>
        useStorageSync("my-key", cb),
      { initialProps: { cb: firstOnChange } },
    );

    // Fire once with the first callback in place
    act(() => {
      window.dispatchEvent(
        new window.StorageEvent("storage", { key: "my-key", newValue: "v1" }),
      );
    });

    assert.strictEqual(firstCallCount, 1, "firstOnChange should be called once before rerender");
    assert.strictEqual(secondCallCount, 0, "secondOnChange should not be called before rerender");

    // Swap the callback — the hook must re-subscribe with the new identity
    rerender({ cb: secondOnChange });

    act(() => {
      window.dispatchEvent(
        new window.StorageEvent("storage", { key: "my-key", newValue: "v2" }),
      );
    });

    assert.strictEqual(
      firstCallCount,
      1,
      "firstOnChange must NOT be called after rerender (listener was replaced)",
    );
    assert.strictEqual(secondCallCount, 1, "secondOnChange should be called once after rerender");
  });

  // #858 — SSR guard: when window is undefined the hook must be a no-op (no throw, no listener)
  it("does not throw and does not attach a listener when window is undefined (SSR)", () => {
    // Stash the real window object and remove it to simulate an SSR environment
    const realWindow = globalThis.window;
    // @ts-expect-error — intentionally simulating SSR by removing window
    delete globalThis.window;

    let renderError: unknown = null;
    try {
      // The hook must mount without throwing even with no window
      renderHook(() => useStorageSync("ssr-key", () => {}));
    } catch (err) {
      renderError = err;
    } finally {
      // Always restore window before any further assertions so other tests are unaffected
      Object.defineProperty(globalThis, "window", {
        value: realWindow,
        writable: true,
        configurable: true,
      });
    }

    assert.strictEqual(renderError, null, "useStorageSync must not throw when window is undefined");
  });
});
