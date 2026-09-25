import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useAsyncState } from "./useAsyncState";
import { ServiceError } from "@/lib/mock-services";

describe("useAsyncState reducer", () => {
  it("starts idle with no data or error", () => {
    const { result } = renderHook(() => useAsyncState<number>());
    assert.equal(result.current.state.status, "idle");
    assert.equal(result.current.state.data, null);
    assert.equal(result.current.state.error, null);
  });

  it("transitions to loading and clears any prior error", async () => {
    const { result } = renderHook(() => useAsyncState<number>());

    let resolveFn!: (v: number) => void;
    const pending = new Promise<number>((resolve) => {
      resolveFn = resolve;
    });

    let runPromise!: Promise<unknown>;
    act(() => {
      runPromise = result.current.run(() => pending);
    });

    assert.equal(result.current.state.status, "loading");

    await act(async () => {
      resolveFn(1);
      await runPromise;
    });
  });

  it("transitions to success with the resolved payload", async () => {
    const { result } = renderHook(() => useAsyncState<number>());

    await act(async () => {
      await result.current.run(() => Promise.resolve(42));
    });

    assert.equal(result.current.state.status, "success");
    assert.equal(result.current.state.data, 42);
    assert.equal(result.current.state.error, null);
  });

  it("transitions to error and preserves prior data on RESET only", async () => {
    const { result } = renderHook(() => useAsyncState<number>());

    await act(async () => {
      await result.current.run(() =>
        Promise.reject(new ServiceError("NETWORK_ERROR", "boom", true)),
      );
    });

    assert.equal(result.current.state.status, "error");
    assert.equal(result.current.state.data, null);
    assert.equal(result.current.state.error?.message, "boom");
  });

  it("resets to idle with no data or error", async () => {
    const { result } = renderHook(() => useAsyncState<number>());

    await act(async () => {
      await result.current.run(() => Promise.resolve(1));
    });
    act(() => {
      result.current.reset();
    });

    assert.deepEqual(result.current.state, { status: "idle", data: null, error: null });
  });

  it("ignores response from superseded run calls", async () => {
    const { result } = renderHook(() => useAsyncState<string>());

    let resolveFirst!: (v: string) => void;
    const firstPromise = new Promise<string>((resolve) => {
      resolveFirst = resolve;
    });

    let run1!: Promise<void>;
    let run2!: Promise<void>;

    act(() => {
      run1 = result.current.run(() => firstPromise);
      run2 = result.current.run(() => Promise.resolve("second"));
    });

    await act(async () => {
      resolveFirst("first");
      await run1;
      await run2;
    });

    assert.equal(result.current.state.status, "success");
    assert.equal(result.current.state.data, "second");
  });
});

describe("useAsyncState error classification in run()", () => {
  it("maps a ServiceError to its code, message, and retryable flag", async () => {
    const { result } = renderHook(() => useAsyncState<number>());

    await act(async () => {
      await result.current.run(() =>
        Promise.reject(new ServiceError("RATE_LIMITED", "slow down", false)),
      );
    });

    assert.deepEqual(result.current.state.error, {
      message: "slow down",
      code: "RATE_LIMITED",
      retryable: false,
    });
  });

  it("maps a plain Error to UNKNOWN with retryable true", async () => {
    const { result } = renderHook(() => useAsyncState<number>());

    await act(async () => {
      await result.current.run(() => Promise.reject(new Error("plain failure")));
    });

    assert.deepEqual(result.current.state.error, {
      message: "plain failure",
      code: "UNKNOWN",
      retryable: true,
    });
  });

  it("maps a non-Error thrown value to a generic message with retryable true", async () => {
    const { result } = renderHook(() => useAsyncState<number>());

    await act(async () => {
      await result.current.run(() => Promise.reject("stringy failure"));
    });

    assert.deepEqual(result.current.state.error, {
      message: "An unexpected error occurred.",
      code: "UNKNOWN",
      retryable: true,
    });
  });

  it("ignores stale results from older runs", async () => {
    const { result } = renderHook(() => useAsyncState<number>());

    let resolveFirst!: (value: number) => void;
    let resolveSecond!: (value: number) => void;

    const first = new Promise<number>((resolve) => {
      resolveFirst = resolve;
    });
    const second = new Promise<number>((resolve) => {
      resolveSecond = resolve;
    });

    act(() => {
      void result.current.run(() => first);
      void result.current.run(() => second);
    });

    await act(async () => {
      resolveSecond(200);
      await second;
    });

    assert.equal(result.current.state.status, "success");
    assert.equal(result.current.state.data, 200);

    await act(async () => {
      resolveFirst(100);
      await first;
    });

    assert.equal(result.current.state.data, 200);
  });
});
