import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useRealtimeStream, generateEvent, resetRealtimeStreamSequence } from "./useRealtimeStream";
import { reseed } from "@/lib/seeded-rng";

describe("useRealtimeStream", () => {
  beforeEach(() => {
    reseed("test-seed");
    resetRealtimeStreamSequence();
  });

  afterEach(() => {
    reseed(null);
    resetRealtimeStreamSequence();
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

  it("generates deterministic event IDs, timestamps, and payloads for the same seed", () => {
    reseed("deterministic-seed");
    resetRealtimeStreamSequence();
    const run1 = [generateEvent(), generateEvent(), generateEvent()];

    reseed("deterministic-seed");
    resetRealtimeStreamSequence();
    const run2 = [generateEvent(), generateEvent(), generateEvent()];

    assert.equal(run1.length, run2.length);
    for (let i = 0; i < run1.length; i++) {
      assert.equal(run1[i].id, run2[i].id);
      assert.equal(run1[i].timestamp, run2[i].timestamp);
      assert.equal(run1[i].kind, run2[i].kind);
      assert.equal(run1[i].amountDelta, run2[i].amountDelta);
      assert.equal(run1[i].yieldDelta, run2[i].yieldDelta);
      assert.equal(run1[i].apyDelta, run2[i].apyDelta);
    }
  });

  it("supports injected clock for timestamps and IDs", () => {
    resetRealtimeStreamSequence();
    const fixedTime = "2026-06-15T12:00:00.000Z";
    const fixedMs = new Date(fixedTime).getTime();
    const clock = () => fixedTime;

    const event1 = generateEvent(undefined, clock);
    assert.equal(event1.timestamp, fixedTime);
    assert.equal(event1.id, `rt-${fixedMs}-1`);

    const event2 = generateEvent(undefined, clock);
    assert.equal(event2.timestamp, fixedTime);
    assert.equal(event2.id, `rt-${fixedMs}-2`);
  });

  it("reset() resets the sequence counter and state", () => {
    reseed("reset-seed");
    resetRealtimeStreamSequence();

    const initialEvent = generateEvent();
    assert.ok(initialEvent.id.endsWith("-1"));

    const secondEvent = generateEvent();
    assert.ok(secondEvent.id.endsWith("-2"));

    const { result } = renderHook(() => useRealtimeStream());
    act(() => {
      result.current.reset();
    });

    const afterResetEvent = generateEvent();
    assert.ok(afterResetEvent.id.endsWith("-1"));
  });
});
