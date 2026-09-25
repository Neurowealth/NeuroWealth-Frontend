"use client";

/**
 * useRealtimeStream — Issue #433
 *
 * Simulates a server-sent event stream for deposits, withdrawals, and
 * rebalancing events. Updates the portfolio summary live and emits toast
 * notifications for major events.
 *
 * Design:
 *  - Events fire at a random interval between MIN_INTERVAL_MS and MAX_INTERVAL_MS
 *  - Each event has a kind, a delta applied to the portfolio summary, and a
 *    toast payload consumed by the caller
 *  - start() / stop() / reset() are exposed for demo/test controls
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { random as seededRandom } from "@/lib/seeded-rng";
import { formatNumber } from "@/lib/formatters";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StreamEventKind = "deposit" | "withdrawal" | "rebalance";
export type StreamStatus = "idle" | "running" | "stopped";

export interface StreamEvent {
  id: string;
  kind: StreamEventKind;
  title: string;
  description: string;
  amountDelta: number;   // change applied to totalBalance
  yieldDelta: number;    // change applied to totalYield
  apyDelta: number;      // change applied to apy
  timestamp: string;
  toastVariant: "success" | "info" | "warning";
}

export interface PortfolioDelta {
  totalBalance: number;
  totalYield: number;
  apy: number;
}

export interface RealtimeStreamHandle {
  /** Whether the stream is currently emitting events. */
  status: StreamStatus;
  /** Cumulative deltas applied since stream started (or last reset). */
  delta: PortfolioDelta;
  /** All events emitted in the current session. */
  events: StreamEvent[];
  /** Most recently emitted event (null before first event). */
  latestEvent: StreamEvent | null;
  /** Start emitting events. No-op if already running. */
  start: () => void;
  /** Pause the stream. */
  stop: () => void;
  /** Stop + clear deltas and event log. */
  reset: () => void;
}

// ── Config ────────────────────────────────────────────────────────────────────

const MIN_INTERVAL_MS = 4000;
const MAX_INTERVAL_MS = 9000;

function randInterval(): number {
  return MIN_INTERVAL_MS + Math.floor(seededRandom() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS));
}

// ── Event generators ──────────────────────────────────────────────────────────

let _seq = 0;
function nextId() {
  _seq += 1;
  return `rt-${Date.now()}-${_seq}`;
}

function makeDeposit(): StreamEvent {
  const amount = Math.round(100 + seededRandom() * 4900);
  return {
    id: nextId(),
    kind: "deposit",
    title: "Deposit received",
    description: `+$${formatNumber(amount)} USDC deposited and routed to active strategy.`,
    amountDelta: amount,
    yieldDelta: +(amount * 0.0002).toFixed(2),
    apyDelta: +(seededRandom() * 0.08).toFixed(2),
    timestamp: new Date().toISOString(),
    toastVariant: "success",
  };
}

function makeWithdrawal(): StreamEvent {
  const amount = Math.round(50 + seededRandom() * 1500);
  return {
    id: nextId(),
    kind: "withdrawal",
    title: "Withdrawal processed",
    description: `-$${formatNumber(amount)} liquidity released to destination wallet.`,
    amountDelta: -amount,
    yieldDelta: 0,
    apyDelta: -(seededRandom() * 0.04),
    timestamp: new Date().toISOString(),
    toastVariant: "info",
  };
}

function makeRebalance(): StreamEvent {
  const apyGain = +(seededRandom() * 0.15).toFixed(2);
  return {
    id: nextId(),
    kind: "rebalance",
    title: "Auto-rebalance executed",
    description: `Strategy drift corrected. APY improved by ${apyGain.toFixed(2)}%.`,
    amountDelta: 0,
    yieldDelta: +(seededRandom() * 12).toFixed(2),
    apyDelta: apyGain,
    timestamp: new Date().toISOString(),
    toastVariant: "info",
  };
}

const EVENT_GENERATORS: Array<() => StreamEvent> = [
  makeDeposit,
  makeDeposit,   // weighted 2× — deposits are more common in demo
  makeWithdrawal,
  makeRebalance,
  makeRebalance, // weighted 2× for rebalances
];

function generateEvent(): StreamEvent {
  const generator = EVENT_GENERATORS[Math.floor(seededRandom() * EVENT_GENERATORS.length)];
  return generator();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const ZERO_DELTA: PortfolioDelta = { totalBalance: 0, totalYield: 0, apy: 0 };

export function useRealtimeStream(
  onEvent?: (event: StreamEvent) => void,
): RealtimeStreamHandle {
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [delta, setDelta] = useState<PortfolioDelta>(ZERO_DELTA);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<StreamEvent | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<StreamStatus>("idle");
  const onEventRef = useRef(onEvent);

  // Keep ref in sync so the timer closure always calls the latest callback
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const scheduleNext = useCallback(() => {
    if (statusRef.current !== "running") return;

    timerRef.current = setTimeout(() => {
      if (statusRef.current !== "running") return;

      const event = generateEvent();

      setDelta((prev: PortfolioDelta) => ({
        totalBalance: +(prev.totalBalance + event.amountDelta).toFixed(2),
        totalYield: +(prev.totalYield + event.yieldDelta).toFixed(2),
        apy: +(prev.apy + event.apyDelta).toFixed(2),
      }));
      setEvents((prev: StreamEvent[]) => [event, ...prev].slice(0, 50));
      setLatestEvent(event);

      onEventRef.current?.(event);

      scheduleNext();
    }, randInterval());
  }, []);

  const start = useCallback(() => {
    if (statusRef.current === "running") return;
    statusRef.current = "running";
    setStatus("running");
    scheduleNext();
  }, [scheduleNext]);

  const stop = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    statusRef.current = "stopped";
    setStatus("stopped");
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    statusRef.current = "idle";
    setStatus("idle");
    setDelta(ZERO_DELTA);
    setEvents([]);
    setLatestEvent(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { status, delta, events, latestEvent, start, stop, reset };
}
