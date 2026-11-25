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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type StreamEventKind = "deposit" | "withdrawal" | "rebalance";
export type StreamStatus = "idle" | "running" | "stopped";

export interface RealtimeStreamMessages {
  depositTitle?: string;
  depositDesc?: string;
  withdrawalTitle?: string;
  withdrawalDesc?: string;
  rebalanceTitle?: string;
  rebalanceDesc?: string;
}

export interface RealtimeStreamOptions {
  onEvent?: (event: StreamEvent) => void;
  messages?: RealtimeStreamMessages;
  /** Injected clock for deterministic testing or demo runs. */
  clock?: () => Date | number | string;
}

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

const BASE_STREAM_TIME_MS = 1767225600000; // 2026-01-01T00:00:00.000Z
let _seq = 0;
let _virtualTime = BASE_STREAM_TIME_MS;

export function resetRealtimeStreamSequence(val = 0, baseTime = BASE_STREAM_TIME_MS): void {
  _seq = val;
  _virtualTime = baseTime;
}

function nextEventMeta(clock?: () => Date | number | string): { id: string; timestamp: string } {
  _seq += 1;
  if (clock) {
    const raw = clock();
    const date = typeof raw === "object" ? raw : new Date(raw);
    return {
      id: `rt-${date.getTime()}-${_seq}`,
      timestamp: date.toISOString(),
    };
  }

  _virtualTime += randInterval();
  return {
    id: `rt-${_virtualTime}-${_seq}`,
    timestamp: new Date(_virtualTime).toISOString(),
  };
}

function makeDeposit(
  messages?: RealtimeStreamMessages,
  clock?: () => Date | number | string,
): StreamEvent {
  const amount = Math.round(100 + seededRandom() * 4900);
  const formattedAmount = formatCurrency(amount);
  const title = messages?.depositTitle ?? "Deposit received";
  const descTemplate = messages?.depositDesc ?? "+{{amount}} USDC deposited and routed to active strategy.";
  const description = descTemplate.replace("{{amount}}", formattedAmount);
  const { id, timestamp } = nextEventMeta(clock);

  return {
    id,
    kind: "deposit",
    title,
    description,
    amountDelta: amount,
    yieldDelta: +(amount * 0.0002).toFixed(2),
    apyDelta: +(seededRandom() * 0.08).toFixed(2),
    timestamp,
    toastVariant: "success",
  };
}

function makeWithdrawal(
  messages?: RealtimeStreamMessages,
  clock?: () => Date | number | string,
): StreamEvent {
  const amount = Math.round(50 + seededRandom() * 1500);
  const formattedAmount = formatCurrency(amount);
  const title = messages?.withdrawalTitle ?? "Withdrawal processed";
  const descTemplate = messages?.withdrawalDesc ?? "-{{amount}} liquidity released to destination wallet.";
  const description = descTemplate.replace("{{amount}}", formattedAmount);
  const { id, timestamp } = nextEventMeta(clock);

  return {
    id,
    kind: "withdrawal",
    title,
    description,
    amountDelta: -amount,
    yieldDelta: 0,
    apyDelta: -(seededRandom() * 0.04),
    timestamp,
    toastVariant: "info",
  };
}

function makeRebalance(
  messages?: RealtimeStreamMessages,
  clock?: () => Date | number | string,
): StreamEvent {
  const apyGain = +(seededRandom() * 0.15).toFixed(2);
  const title = messages?.rebalanceTitle ?? "Auto-rebalance executed";
  const descTemplate = messages?.rebalanceDesc ?? "Strategy drift corrected. APY improved by {{apyGain}}%.";
  const description = descTemplate.replace("{{apyGain}}", apyGain.toFixed(2));
  const { id, timestamp } = nextEventMeta(clock);

  return {
    id,
    kind: "rebalance",
    title,
    description,
    amountDelta: 0,
    yieldDelta: +(seededRandom() * 12).toFixed(2),
    apyDelta: apyGain,
    timestamp,
    toastVariant: "info",
  };
}

const EVENT_GENERATORS: Array<
  (messages?: RealtimeStreamMessages, clock?: () => Date | number | string) => StreamEvent
> = [
  makeDeposit,
  makeDeposit,   // weighted 2× — deposits are more common in demo
  makeWithdrawal,
  makeRebalance,
  makeRebalance, // weighted 2× for rebalances
];

export function generateEvent(
  messages?: RealtimeStreamMessages,
  clock?: () => Date | number | string,
): StreamEvent {
  const generator = EVENT_GENERATORS[Math.floor(seededRandom() * EVENT_GENERATORS.length)];
  return generator(messages, clock);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const ZERO_DELTA: PortfolioDelta = { totalBalance: 0, totalYield: 0, apy: 0 };

export function useRealtimeStream(
  onEventOrOptions?: ((event: StreamEvent) => void) | RealtimeStreamOptions,
  maybeOptions?: RealtimeStreamOptions,
): RealtimeStreamHandle {
  const resolvedOnEvent =
    typeof onEventOrOptions === "function"
      ? onEventOrOptions
      : onEventOrOptions?.onEvent;
  const options =
    typeof onEventOrOptions === "object" ? onEventOrOptions : maybeOptions;

  const [status, setStatus] = useState<StreamStatus>("idle");
  const [delta, setDelta] = useState<PortfolioDelta>(ZERO_DELTA);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<StreamEvent | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusRef = useRef<StreamStatus>("idle");
  const onEventRef = useRef(resolvedOnEvent);
  const messagesRef = useRef(options?.messages);
  const clockRef = useRef(options?.clock);

  // Keep ref in sync so the timer closure always calls the latest callback
  useEffect(() => {
    onEventRef.current = resolvedOnEvent;
  }, [resolvedOnEvent]);

  useEffect(() => {
    messagesRef.current = options?.messages;
  }, [options?.messages]);

  useEffect(() => {
    clockRef.current = options?.clock;
  }, [options?.clock]);

  const scheduleNext = useCallback(() => {
    if (statusRef.current !== "running") return;

    timerRef.current = setTimeout(() => {
      if (statusRef.current !== "running") return;

      const event = generateEvent(messagesRef.current, clockRef.current);

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
    resetRealtimeStreamSequence();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { status, delta, events, latestEvent, start, stop, reset };
}
