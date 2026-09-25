"use client";

import { useEffect, useReducer, useRef } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
} from "lucide-react";
import {
  HistoryKind,
  HistoryStatus,
  TransactionHistoryPage,
} from "@/lib/transaction-history";
import { apiRequest } from "@/lib/api-client";
import { formatCurrency, formatTimestamp } from "@/lib/formatters";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FilterState {
  kind: HistoryKind | "all";
  status: HistoryStatus | "all";
  dateFrom: string;
  dateTo: string;
  page: number;
}

type FilterAction =
  | { type: "SET_KIND"; value: HistoryKind | "all" }
  | { type: "SET_STATUS"; value: HistoryStatus | "all" }
  | { type: "SET_DATE_FROM"; value: string }
  | { type: "SET_DATE_TO"; value: string }
  | { type: "SET_PAGE"; value: number }
  | { type: "RESET" };

interface DataState {
  data: TransactionHistoryPage | null;
  loading: boolean;
  error: string | null;
}

type DataAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: TransactionHistoryPage }
  | { type: "FETCH_ERROR"; message: string };

// ─── Reducers ────────────────────────────────────────────────────────────────

const INITIAL_FILTER: FilterState = {
  kind: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
  page: 1,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_KIND":
      return { ...state, kind: action.value, page: 1 };
    case "SET_STATUS":
      return { ...state, status: action.value, page: 1 };
    case "SET_DATE_FROM":
      return { ...state, dateFrom: action.value, page: 1 };
    case "SET_DATE_TO":
      return { ...state, dateTo: action.value, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.value };
    case "RESET":
      return INITIAL_FILTER;
  }
}

const INITIAL_DATA: DataState = { data: null, loading: true, error: null };

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { data: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.message };
  }
}

// ─── Config ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

type HistoryMessages = ReturnType<typeof useI18n>["messages"]["transactions"]["history"];

function kindChips(t: HistoryMessages): { label: string; value: HistoryKind | "all" }[] {
  return [
    { label: t.all, value: "all" },
    { label: t.deposits, value: "deposit" },
    { label: t.withdrawals, value: "withdrawal" },
    { label: t.rebalances, value: "rebalance" },
  ];
}

function statusChips(t: HistoryMessages): { label: string; value: HistoryStatus | "all" }[] {
  return [
    { label: t.all, value: "all" },
    { label: t.statusSuccess, value: "success" },
    { label: t.statusPending, value: "pending" },
    { label: t.statusFailed, value: "failed" },
  ];
}

// Stellar Testnet explorer base URL
const EXPLORER_BASE = "https://stellar.expert/explorer/testnet/tx";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Spec: success #10B981 · pending #F59E0B · failed #EF4444 */
function statusStyles(status: HistoryStatus): string {
  switch (status) {
    case "success":
      return "bg-emerald-500/15 text-emerald-500";
    case "pending":
      return "bg-amber-500/15 text-amber-500";
    case "failed":
      return "bg-red-500/15 text-red-500";
  }
}

function statusLabel(status: HistoryStatus, t: HistoryMessages): string {
  switch (status) {
    case "success":
      return t.statusSuccess;
    case "pending":
      return t.statusPending;
    case "failed":
      return t.statusFailed;
  }
}

function kindIcon(kind: HistoryKind) {
  switch (kind) {
    case "deposit":
      return <ArrowDownCircle size={16} className="text-emerald-400 shrink-0" aria-hidden />;
    case "withdrawal":
      return <ArrowUpCircle size={16} className="text-sky-400 shrink-0" aria-hidden />;
    case "rebalance":
      return <RefreshCw size={16} className="text-amber-400 shrink-0" aria-hidden />;
  }
}

function kindLabel(kind: HistoryKind, t: HistoryMessages): string {
  switch (kind) {
    case "deposit":
      return t.kindDeposit;
    case "withdrawal":
      return t.kindWithdrawal;
    case "rebalance":
      return t.kindRebalance;
  }
}

function formatAmount(amount: number | null, kind: HistoryKind): string {
  if (amount === null) return "—";
  const abs = formatCurrency(Math.abs(amount));
  if (kind === "withdrawal" || amount < 0) return `-${abs}`;
  return `+${abs}`;
}

function amountColor(amount: number | null, kind: HistoryKind): string {
  if (amount === null) return "text-slate-500";
  if (kind === "deposit") return "text-emerald-400";
  if (kind === "withdrawal") return "text-red-400";
  return "text-slate-400";
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusTag({ status }: { status: HistoryStatus }) {
  const { messages } = useI18n();
  const t = messages.transactions.history;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles(status)}`}
    >
      {statusLabel(status, t)}
    </span>
  );
}

interface TxHashLinkProps {
  txHash: string | null;
}

function TxHashLink({ txHash }: TxHashLinkProps) {
  if (!txHash) {
    return <span className="text-slate-600 text-xs font-mono">—</span>;
  }
  return (
    <a
      href={`${EXPLORER_BASE}/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 hover:text-sky-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded"
      title={txHash}
    >
      {truncateHash(txHash)}
      <ExternalLink size={10} aria-hidden />
    </a>
  );
}

function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} aria-hidden>
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <span
                className="block h-3.5 rounded bg-white/5 animate-pulse"
                style={{ width: j === 1 ? "70%" : j === 2 ? "50%" : "60%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SkeletonCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/5 bg-white/3 p-4 space-y-3 animate-pulse"
          aria-hidden
        >
          <div className="flex justify-between">
            <span className="h-3 w-24 rounded bg-white/5 block" />
            <span className="h-5 w-16 rounded-full bg-white/5 block" />
          </div>
          <span className="h-4 w-48 rounded bg-white/5 block" />
          <span className="h-3 w-36 rounded bg-white/5 block" />
          <div className="flex justify-between pt-1">
            <span className="h-3 w-28 rounded bg-white/5 block" />
            <span className="h-4 w-20 rounded bg-white/5 block" />
          </div>
        </div>
      ))}
    </>
  );
}

interface EmptyStateProps {
  filtered: boolean;
  onReset: () => void;
}

function EmptyState({ filtered, onReset }: EmptyStateProps) {
  const { messages } = useI18n();
  const t = messages.transactions.history;

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="rounded-full border border-white/10 bg-white/5 p-5">
        <ClipboardList size={28} className="text-slate-500" aria-hidden />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <p className="text-slate-200 font-semibold">
          {filtered ? t.noMatching : t.noHistory}
        </p>
        <p className="text-sm text-slate-500">
          {filtered
            ? t.adjustFilters
            : t.firstDeposit}
        </p>
      </div>
      {filtered ? (
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded"
        >
          {t.clearAllFilters}
        </button>
      ) : (
        <Link href="/dashboard/transactions?kind=deposit">
          <Button variant="primary" size="sm">
            {t.makeDeposit}
          </Button>
        </Link>
      )}
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (n: number) => void;
}

function Pagination({ page, totalPages, total, pageSize, onPage }: PaginationProps) {
  const { messages } = useI18n();
  const t = messages.transactions.history;
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 px-1 pt-4">
      <p className="text-xs text-slate-500">
        {t.showing} <span className="text-slate-300">{start}–{end}</span> {t.of}{" "}
        <span className="text-slate-300">{total}</span>
      </p>
      <div className="flex items-center gap-1" role="navigation" aria-label={t.paginationLabel}>
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label={t.previousPage}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
        >
          <ChevronLeft size={14} aria-hidden />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-label={t.pageN.replace("{n}", String(n))}
            aria-current={n === page ? "page" : undefined}
            className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
              n === page
                ? "bg-sky-500 text-white font-semibold"
                : "border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label={t.nextPage}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
        >
          <ChevronRight size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}

// ─── Filter bar ──────────────────────────────────────────────────────────────

interface FilterBarProps {
  filter: FilterState;
  dispatch: React.Dispatch<FilterAction>;
}

function FilterBar({ filter, dispatch }: FilterBarProps) {
  const { messages } = useI18n();
  const t = messages.transactions.history;
  const isFiltered =
    filter.kind !== "all" ||
    filter.status !== "all" ||
    filter.dateFrom !== "" ||
    filter.dateTo !== "";

  return (
    <div className="space-y-3">
      {/* Type chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium mr-1 shrink-0" id="kind-filter-label">
          {t.type}
        </span>
        <div role="group" aria-labelledby="kind-filter-label" className="flex flex-wrap gap-1.5">
          {kindChips(t).map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => dispatch({ type: "SET_KIND", value: chip.value })}
              aria-pressed={filter.kind === chip.value}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
                filter.kind === chip.value
                  ? "bg-sky-500 border-sky-500 text-white"
                  : "border-white/15 text-slate-400 hover:text-white hover:border-white/30 bg-transparent"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium mr-1 shrink-0" id="status-filter-label">
          {t.status}
        </span>
        <div role="group" aria-labelledby="status-filter-label" className="flex flex-wrap gap-1.5">
          {statusChips(t).map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => dispatch({ type: "SET_STATUS", value: chip.value })}
              aria-pressed={filter.status === chip.value}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
                filter.status === chip.value
                  ? "bg-sky-500 border-sky-500 text-white"
                  : "border-white/15 text-slate-400 hover:text-white hover:border-white/30 bg-transparent"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs text-slate-500 font-medium shrink-0">{t.dateRange}</span>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex flex-col gap-0.5">
            <label htmlFor="date-from" className="sr-only">
              {t.fromDate}
            </label>
            <input
              id="date-from"
              type="date"
              value={filter.dateFrom}
              onChange={(e) => dispatch({ type: "SET_DATE_FROM", value: e.target.value })}
              className="h-8 rounded-lg border border-white/15 bg-white/5 px-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              aria-label={t.fromDate}
            />
          </div>
          <span className="text-slate-600 text-xs">{t.to}</span>
          <div className="flex flex-col gap-0.5">
            <label htmlFor="date-to" className="sr-only">
              {t.toDate}
            </label>
            <input
              id="date-to"
              type="date"
              value={filter.dateTo}
              onChange={(e) => dispatch({ type: "SET_DATE_TO", value: e.target.value })}
              className="h-8 rounded-lg border border-white/15 bg-white/5 px-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              aria-label={t.toDate}
            />
          </div>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded"
          >
            {t.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Desktop table ────────────────────────────────────────────────────────────

function DesktopTable({
  data,
  loading,
}: {
  data: TransactionHistoryPage | null;
  loading: boolean;
}) {
  const { messages } = useI18n();
  const t = messages.transactions.history;
  return (
    /* Spec: table with sticky header */
    <div className="hidden md:block overflow-hidden rounded-xl border border-white/8">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-900 border-b border-white/8">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[130px]"
              >
                {t.type}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {t.description}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[160px]"
              >
                {t.date}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]"
              >
                {messages.transactions.shared.amount}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px]"
              >
                {t.status}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-[140px]"
              >
                {t.txHash}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <SkeletonRows count={PAGE_SIZE} />
            ) : data && data.items.length > 0 ? (
              data.items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-white/3 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-slate-300">
                      {kindIcon(item.kind)}
                      <span className="text-xs font-medium">{kindLabel(item.kind, t)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-200 text-sm leading-snug">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.detail}</p>
                  </td>
                  {/* Spec: timestamp in muted monospace */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {formatTimestamp(item.occurredAt)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono text-sm font-semibold ${amountColor(item.amount, item.kind)}`}>
                    {formatAmount(item.amount, item.kind)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusTag status={item.status} />
                  </td>
                  {/* Spec: tx hash in muted monospace */}
                  <td className="px-4 py-3">
                    <TxHashLink txHash={item.txHash} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  {/* empty state rendered outside the table for better layout */}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Mobile card list ─────────────────────────────────────────────────────────

function MobileCards({
  data,
  loading,
}: {
  data: TransactionHistoryPage | null;
  loading: boolean;
}) {
  const { messages } = useI18n();
  const t = messages.transactions.history;
  return (
    /* Spec: card list layout on mobile */
    <div className="flex flex-col gap-3 md:hidden">
      {loading ? (
        <SkeletonCards count={5} />
      ) : data && data.items.length > 0 ? (
        data.items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                {kindIcon(item.kind)}
                {kindLabel(item.kind, t)}
              </span>
              <StatusTag status={item.status} />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-200 leading-snug">{item.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.detail}</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
              {/* Spec: timestamp in muted monospace */}
              <span className="font-mono text-xs text-slate-500">
                {formatTimestamp(item.occurredAt)}
              </span>
              <span
                className={`font-mono text-sm font-semibold ${amountColor(item.amount, item.kind)}`}
              >
                {formatAmount(item.amount, item.kind)}
              </span>
            </div>

            {/* Spec: tx hash in muted monospace */}
            {item.txHash && (
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-xs text-slate-600">{t.tx}</span>
                <TxHashLink txHash={item.txHash} />
              </div>
            )}
          </article>
        ))
      ) : null}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TransactionHistoryProps {
  /** Render without the page <main> wrapper and header when a parent already provides them. */
  embedded?: boolean;
}

export function TransactionHistory({ embedded = false }: TransactionHistoryProps) {
  const { messages } = useI18n();
  const t = messages.transactions.history;
  const [filter, dispatchFilter] = useReducer(filterReducer, INITIAL_FILTER);
  const [dataState, dispatchData] = useReducer(dataReducer, INITIAL_DATA);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    dispatchData({ type: "FETCH_START" });

    const params = new URLSearchParams({
      kind: filter.kind,
      status: filter.status,
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      page: String(filter.page),
      pageSize: String(PAGE_SIZE),
    });

    apiRequest<TransactionHistoryPage>(
      `/api/transaction-history?${params.toString()}`,
      { signal: controller.signal, timeoutMs: 10000 },
    )
      .then((payload) => {
        if (!controller.signal.aborted) {
          dispatchData({ type: "FETCH_SUCCESS", payload });
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : t.loadError;
        dispatchData({ type: "FETCH_ERROR", message });
      });

    return () => controller.abort();
  }, [filter.kind, filter.status, filter.dateFrom, filter.dateTo, filter.page, t.loadError]);

  const { data, loading, error } = dataState;

  const isFiltered =
    filter.kind !== "all" ||
    filter.status !== "all" ||
    filter.dateFrom !== "" ||
    filter.dateTo !== "";

  const isEmpty = !loading && !error && data?.total === 0;

  const Root = embedded ? "div" : "main";
  const rootClassName = embedded ? "" : "min-h-screen bg-dark-900 pt-24 pb-16";

  return (
    <Root className={rootClassName}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {!embedded && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-1">
              {t.eyebrow}
            </p>
            <h1 className="text-2xl font-bold text-slate-100">{t.title}</h1>
            <p className="mt-1.5 text-sm text-slate-500">{t.intro}</p>
          </div>
        )}

        {/* Filter bar */}
        <div className="mb-6 rounded-xl border border-white/8 bg-white/3 p-4">
          <FilterBar filter={filter} dispatch={dispatchFilter} />
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* Loading indicator (accessible) */}
        {loading && (
          <div role="status" aria-label={t.loadingLabel} className="sr-only">
            {t.loadingText}
          </div>
        )}

        {/* Spinning indicator shown near results */}
        {loading && (
          <div className="flex justify-end mb-2" aria-hidden>
            <Loader2 size={14} className="text-slate-600 animate-spin" />
          </div>
        )}

        {/* Desktop table */}
        {!isEmpty && <DesktopTable data={data} loading={loading} />}

        {/* Mobile cards */}
        {!isEmpty && <MobileCards data={data} loading={loading} />}

        {/* Empty state (shared for both breakpoints) */}
        {isEmpty && (
          <EmptyState
            filtered={isFiltered}
            onReset={() => dispatchFilter({ type: "RESET" })}
          />
        )}

        {/* Pagination */}
        {!loading && data && data.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              pageSize={data.pageSize}
              onPage={(n) => dispatchFilter({ type: "SET_PAGE", value: n })}
            />
          </div>
        )}
      </div>
    </Root>
  );
}
