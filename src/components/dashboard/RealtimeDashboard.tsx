"use client";

/**
 * RealtimeDashboard — Issue #433
 *
 * Wraps PortfolioDashboard with a simulated realtime event stream.
 * Applies live deltas to the portfolio summary and fires toast
 * notifications for major events.
 *
 * Exposes start / stop / reset controls for demo and testing.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Square,
  RotateCcw,
  Radio,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/notifications/ToastProvider";
import { useI18n } from "@/contexts/I18nContext";
import { AppMessages } from "@/lib/i18n/messages";

import {
  useRealtimeStream,
  type StreamEvent,
  type StreamEventKind,
  type StreamStatus,
} from "@/hooks/useRealtimeStream";
import { PortfolioDashboard } from "./PortfolioDashboard";
import { formatCurrency, formatSignedCurrency } from "@/lib/formatters";

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusDot(status: StreamStatus) {
  if (status === "running") return "bg-emerald-400 animate-pulse";
  if (status === "stopped") return "bg-amber-400";
  return "bg-slate-600";
}

function statusLabel(status: StreamStatus, t: AppMessages["dashboard"]["realtime"]) {
  if (status === "running") return t.status.live;
  if (status === "stopped") return t.status.paused;
  return t.status.idle;
}

function kindIcon(kind: StreamEventKind) {
  switch (kind) {
    case "deposit":
      return <ArrowDownCircle size={13} className="text-emerald-400 shrink-0" aria-hidden />;
    case "withdrawal":
      return <ArrowUpCircle size={13} className="text-sky-400 shrink-0" aria-hidden />;
    case "rebalance":
      return <RefreshCw size={13} className="text-amber-400 shrink-0" aria-hidden />;
  }
}

// ── Event log panel ───────────────────────────────────────────────────────────

function EventLog({ events, t }: { events: StreamEvent[], t: AppMessages["dashboard"]["realtime"] }) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-slate-500 py-3 text-center">{t.noEvents}</p>
    );
  }

  return (
    <ol
      aria-label="Realtime event log"
      className="space-y-1.5 max-h-48 overflow-y-auto pr-1"
    >
      {events.map((ev) => (
        <li
          key={ev.id}
          className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/2 px-3 py-2 text-xs"
        >
          {kindIcon(ev.kind)}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-200 truncate">{ev.title}</p>
            <p className="text-slate-500 truncate">{ev.description}</p>
          </div>
          <time
            className="shrink-0 font-mono text-slate-600 text-[10px] mt-0.5"
            dateTime={ev.timestamp}
          >
            {new Date(ev.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </time>
        </li>
      ))}
    </ol>
  );
}

// ── Delta badge ───────────────────────────────────────────────────────────────

function DeltaBadge({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span
        className={`text-sm font-bold text-slate-200 ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function RealtimeDashboard() {
  const { messages } = useI18n();
  const t = messages.dashboard.realtime;
  const { pushToast } = useToast();
  const [eventCount, setEventCount] = useState<number>(0);

  const handleEvent = useCallback(
    (event: StreamEvent) => {
      setEventCount((n: number) => n + 1);
      pushToast({
        title: event.title,
        description: event.description,
        variant: event.toastVariant,
        duration: 5000,
      });
    },
    [pushToast],
  );

  const { status, delta, events, start, stop, reset } = useRealtimeStream(handleEvent);

  const deltaBalanceStr =
    delta.totalBalance === 0
      ? "—"
      : formatSignedCurrency(delta.totalBalance);
  const deltaYieldStr =
    delta.totalYield === 0
      ? "—"
      : (delta.totalYield >= 0 ? "+" : "") + formatCurrency(delta.totalYield);
  const deltaApyStr =
    delta.apy === 0
      ? "—"
      : (delta.apy >= 0 ? "+" : "") + delta.apy.toFixed(2) + "%";

  return (
    <div className="space-y-6">
      {/* ── Realtime controls banner ── */}
      <section
        aria-label="Realtime stream controls"
        className="rounded-xl border border-white/10 bg-slate-900/80 p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Left: title + status */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sky-400">
              <Radio size={16} aria-hidden />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-100">{t.simulatedStream}</span>
                <span
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-300"
                  aria-label={`Stream status: ${statusLabel(status, t)}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusDot(status)}`}
                    aria-hidden
                  />
                  {statusLabel(status, t)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{t.firesEvery}</p>
            </div>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2" role="group" aria-label="Stream controls">
            <button
              type="button"
              onClick={start}
              disabled={status === "running"}
              aria-label="{t.start} stream"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <Play size={12} aria-hidden />
              Start
            </button>
            <button
              type="button"
              onClick={stop}
              disabled={status !== "running"}
              aria-label="{t.stop} stream"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <Square size={12} aria-hidden />
              Stop
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="{t.reset} stream"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <RotateCcw size={12} aria-hidden />
              Reset
            </button>
          </div>
        </div>

        {/* Cumulative deltas */}
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-white/5 bg-white/3 p-3 sm:grid-cols-4">
          <DeltaBadge label={t.eventsFired} value={String(eventCount)} />
          <DeltaBadge label={t.deltaBalance} value={deltaBalanceStr} mono />
          <DeltaBadge label={t.deltaYield} value={deltaYieldStr} mono />
          <DeltaBadge label={t.deltaApy} value={deltaApyStr} mono />
        </div>

        {/* Event log */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.eventLog}</p>
          <EventLog events={events} t={t} />
        </div>
      </section>

      {/* ── Portfolio widgets (existing component) ── */}
      <PortfolioDashboard />
    </div>
  );
}
