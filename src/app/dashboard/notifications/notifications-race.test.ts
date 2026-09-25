import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useAsyncState } from "@/hooks/useAsyncState";

describe("Notifications page scenario rapid switching race condition guard", () => {
  it("ignores stale delayed responses when switching sandbox scenarios rapidly", async () => {
    const { result } = renderHook(() => useAsyncState<string>());

    let resolveSlowScenario!: (value: string) => void;
    const slowScenarioPromise = new Promise<string>((resolve) => {
      resolveSlowScenario = resolve;
    });

    let firstRunPromise!: Promise<void>;
    let secondRunPromise!: Promise<void>;

    // 1. User selects "loading" scenario (slow, delayed response)
    act(() => {
      firstRunPromise = result.current.run(() => slowScenarioPromise);
    });

    assert.equal(result.current.state.status, "loading");

    // 2. User quickly switches to "empty" scenario before slow scenario resolves
    act(() => {
      secondRunPromise = result.current.run(() => Promise.resolve("empty-scenario"));
    });

    // 3. Resolve the second scenario first (or fast path)
    await act(async () => {
      await secondRunPromise;
    });

    assert.equal(result.current.state.status, "success");
    assert.equal(result.current.state.data, "empty-scenario");

    // 4. Now the slow first scenario finally resolves later
    await act(async () => {
      resolveSlowScenario("loading-scenario-data");
      await firstRunPromise;
    });

    // 5. Assert that state did NOT revert to the stale first response
    assert.equal(result.current.state.status, "success");
    assert.equal(result.current.state.data, "empty-scenario");
  });
});
