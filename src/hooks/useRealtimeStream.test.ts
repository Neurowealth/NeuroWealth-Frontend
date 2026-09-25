import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useRealtimeStream } from "./useRealtimeStream";
import { reseed } from "@/lib/seeded-rng";

describe("useRealtimeStream", () => {
  beforeEach(() => {
    reseed("test-seed");
  });

  afterEach(() => {
    reseed(null);
  });

  it("starts in idle state with empty data", () => {
    const { result } = renderHook(() => useRealtimeStream());
    assert.equal(result.current.status, "idle");
    assert.deepEqual(result.current.events, []);
    assert.deepEqual(result.current.delta, { totalBalance: 0, totalYield: 0, apy: 0 });
    assert.equal(result.current.latestEvent, null);
  });

  it("exposes start, stop, and reset methods", () => {
    const { result } = renderHook(() => useRealtimeStream());
    assert.equal(typeof result.current.start, "function");
    assert.equal(typeof result.current.stop, "function");
    assert.equal(typeof result.current.reset, "function");
  });

  it("resets state back to idle", () => {
    const { result } = renderHook(() => useRealtimeStream());
    act(() => {
      result.current.reset();
    });
    assert.equal(result.current.status, "idle");
    assert.deepEqual(result.current.events, []);
    assert.equal(result.current.latestEvent, null);
    assert.deepEqual(result.current.delta, { totalBalance: 0, totalYield: 0, apy: 0 });
  });
});
