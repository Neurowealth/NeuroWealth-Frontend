"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Clock,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useAsyncState } from "@/hooks/useAsyncState";
import { mockPortfolioService, mockStrategyService, mockTransactionService } from "@/lib/mock-services";
import { getDefaultTransactionValues } from "@/lib/transactions";
import { ErrorBlock } from "@/components/ui/ErrorBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  AuditTableSkeleton,
  DashboardSkeleton,
  SettingsSectionSkeleton,
  TransactionFormSkeleton,
} from "@/components/ui/Skeleton";
import { Button, Card, InlineBanner } from "@/components/ui";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-4 border-slate-700/50 bg-dark-800/70 p-6">
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      {children}
    </Card>
  );
}

// ─── Portfolio async demo ─────────────────────────────────────────────────────

function PortfolioStateDemo() {
  const { state, run } = useAsyncState<ReturnType<typeof mockPortfolioService.fetchPortfolio> extends Promise<infer T> ? T : never>();

  const load = useCallback(
    (outcome: "success" | "failure" | "auto") =>
      run(() => mockPortfolioService.fetchPortfolio({ outcome })),
    [run],
  );

  return (
    <Section title="Portfolio — loading / error / data">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => load("success")}>
          <RefreshCw className="h-3.5 w-3.5" /> Load success
        </Button>
        <Button size="sm" variant="destructive" onClick={() => load("failure")}>
          Force error
        </Button>
        <Button size="sm" variant="secondary" onClick={() => load("auto")}>
          Random (15% fail)
        </Button>
      </div>

      {state.status === "loading" && <DashboardSkeleton />}

      {state.status === "error" && (
        <ErrorBlock
          title="Failed to load portfolio"
          description={state.error ?? "An unexpected error occurred."}
          onAction={() => load("auto")}
        />
      )}

      {state.status === "success" && state.data && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300">
          ✓ Loaded — balance{" "}
          <span className="font-mono font-semibold">
            ${state.data.summary.totalBalance.toLocaleString()}
          </span>{" "}
          · APY {state.data.summary.apy}% · {state.data.allocation.length} positions
        </div>
      )}

      {state.status === "idle" && (
        <p className="text-sm text-slate-500">Click a button above to trigger a state.</p>
      )}
    </Section>
  );
}

// ─── Strategy async demo ──────────────────────────────────────────────────────

function StrategyStateDemo() {
  const fetchState = useAsyncState<Awaited<ReturnType<typeof mockStrategyService.fetchStrategies>>>();
  const selectState = useAsyncState<void>();

  const loadStrategies = useCallback(
    (outcome: "success" | "failure" | "auto") =>
      fetchState.run(() => mockStrategyService.fetchStrategies({ outcome })),
    [fetchState],
  );

  const selectStrategy = useCallback(
    (outcome: "success" | "failure") =>
      selectState.run(() => mockStrategyService.selectStrategy("balanced", { outcome })),
    [selectState],
  );

  return (
    <Section title="Strategy — loading / empty / error">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => loadStrategies("success")}>
          <RefreshCw className="h-3.5 w-3.5" /> Load strategies
        </Button>
        <Button size="sm" variant="destructive" onClick={() => loadStrategies("failure")}>
          Force fetch error
        </Button>
      </div>

      {fetchState.state.status === "loading" && <SettingsSectionSkeleton rows={3} />}

      {fetchState.state.status === "error" && (
        <ErrorBlock
          title="Could not load strategies"
          description={fetchState.state.error ?? "Strategy list unavailable."}
          onAction={() => loadStrategies("auto")}
        />
      )}

      {fetchState.state.status === "success" && fetchState.state.data && (
        <div className="space-y-2">
          {fetchState.state.data.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-950/35 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">{s.label}</p>
                <p className="text-xs text-slate-400">{s.apyRange} APY · {s.riskLabel} risk</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => selectStrategy("success")}>
                Select
              </Button>
            </div>
          ))}
        </div>
      )}

      {fetchState.state.status === "idle" && (
        <EmptyState
          icon={<BarChart3 size={28} />}
          heading="No strategies loaded"
          body="Click 'Load strategies' to fetch available investment strategies."
          ctaLabel="Load strategies"
          onAction={() => loadStrategies("success")}
        />
      )}

      {selectState.state.status === "loading" && (
        <p className="text-xs text-slate-400">Applying strategy change…</p>
      )}
      {selectState.state.status === "success" && (
        <p className="text-xs text-emerald-400">✓ Strategy updated successfully.</p>
      )}
      {selectState.state.status === "error" && (
        <ErrorBlock
          title="Strategy change failed"
          description={selectState.state.error ?? "Could not apply strategy."}
          onAction={() => selectStrategy("success")}
        />
      )}
    </Section>
  );
}

// ─── Transaction async demo ───────────────────────────────────────────────────

function TransactionStateDemo() {
  const quoteState = useAsyncState<Awaited<ReturnType<typeof mockTransactionService.getQuote>>>();
  const submitState = useAsyncState<Awaited<ReturnType<typeof mockTransactionService.submit>>>();

  const valuesWithAmount = useMemo(
    () => ({ ...getDefaultTransactionValues("deposit"), amount: "500" }),
    [],
  );

  const getQuote = useCallback(
    (outcome: "success" | "failure") =>
      quoteState.run(() => mockTransactionService.getQuote("deposit", valuesWithAmount, { outcome })),
    [quoteState, valuesWithAmount],
  );

  const submit = useCallback(
    (outcome: "success" | "failure") =>
      submitState.run(() => mockTransactionService.submit("deposit", valuesWithAmount, { outcome })),
    [submitState, valuesWithAmount],
  );

  return (
    <Section title="Transaction — loading / success / failure">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => getQuote("success")}>
          <RefreshCw className="h-3.5 w-3.5" /> Get quote
        </Button>
        <Button size="sm" variant="destructive" onClick={() => getQuote("failure")}>
          Force quote error
        </Button>
        <Button size="sm" onClick={() => submit("success")}>
          Submit (success)
        </Button>
        <Button size="sm" variant="destructive" onClick={() => submit("failure")}>
          Submit (failure)
        </Button>
      </div>

      {(quoteState.state.status === "loading" || submitState.state.status === "loading") && (
        <TransactionFormSkeleton />
      )}

      {quoteState.state.status === "error" && (
        <ErrorBlock
          title="Quote request failed"
          description={quoteState.state.error ?? "Could not fetch quote."}
          onAction={() => getQuote("success")}
        />
      )}

      {quoteState.state.status === "success" && quoteState.state.data && (
        <div className="rounded-xl border border-sky-400/20 bg-sky-500/8 px-4 py-3 text-sm text-sky-300">
          Quote: <span className="font-mono font-semibold">{quoteState.state.data.quote.reference}</span>
          {" · "}net {quoteState.state.data.quote.netAmount} USDC · fee {quoteState.state.data.quote.fee} USDC
        </div>
      )}

      {submitState.state.status === "error" && (
        <ErrorBlock
          title="Submission failed"
          description={submitState.state.error ?? "Transaction could not be submitted."}
          onAction={() => submit("success")}
        />
      )}

      {submitState.state.status === "success" && submitState.state.data && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-300">
          Pending: <span className="font-mono font-semibold">{submitState.state.data.pending.reference}</span>
          {" · "}{submitState.state.data.pending.statusLabel}
        </div>
      )}

      {quoteState.state.status === "idle" && submitState.state.status === "idle" && (
        <EmptyState
          icon={<Wallet size={28} />}
          heading="No transaction in progress"
          body="Use the buttons above to simulate quote and submission flows."
        />
      )}
    </Section>
  );
}

// ─── Audit async demo ─────────────────────────────────────────────────────────

function AuditStateDemo() {
  const [shown, setShown] = useState<"loading" | "empty" | "error" | "idle">("idle");

  useEffect(() => {
    if (shown === "loading") {
      const t = setTimeout(() => setShown("idle"), 1400);
      return () => clearTimeout(t);
    }
  }, [shown]);

  return (
    <Section title="Audit trail — loading / empty states">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setShown("loading")}>
          <RefreshCw className="h-3.5 w-3.5" /> Show loading
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShown("empty")}>
          Show empty
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShown("idle")}>
          Reset
        </Button>
      </div>

      {shown === "loading" && <AuditTableSkeleton rows={5} />}

      {shown === "empty" && (
        <EmptyState
          icon={<ShieldCheck size={28} />}
          heading="No audit events yet"
          body="Audit events are recorded when deposits, withdrawals, or strategy changes occur."
          ctaLabel="Go to dashboard"
          ctaHref="/dashboard"
        />
      )}

      {shown === "idle" && (
        <p className="text-sm text-slate-500">Click a button above to preview a state.</p>
      )}
    </Section>
  );
}

// ─── History async demo ───────────────────────────────────────────────────────

function HistoryStateDemo() {
  const [shown, setShown] = useState<"loading" | "empty" | "error" | "idle">("idle");

  useEffect(() => {
    if (shown === "loading") {
      const t = setTimeout(() => setShown("idle"), 1200);
      return () => clearTimeout(t);
    }
  }, [shown]);

  return (
    <Section title="Transaction history — loading / empty / error">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setShown("loading")}>
          <RefreshCw className="h-3.5 w-3.5" /> Show loading
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShown("empty")}>
          Show empty
        </Button>
        <Button size="sm" variant="destructive" onClick={() => setShown("error")}>
          Show error
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShown("idle")}>
          Reset
        </Button>
      </div>

      {shown === "loading" && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-800/60" />
          ))}
        </div>
      )}

      {shown === "empty" && (
        <EmptyState
          icon={<Clock size={28} />}
          heading="No transaction history"
          body="Once you make your first deposit or withdrawal, your transaction history will appear here."
          ctaLabel="Make a deposit"
          ctaHref="/dashboard/transactions"
        />
      )}

      {shown === "error" && (
        <ErrorBlock
          title="Failed to load history"
          description="Transaction history could not be retrieved. Check your connection and retry."
          onAction={() => setShown("loading")}
        />
      )}

      {shown === "idle" && (
        <p className="text-sm text-slate-500">Click a button above to preview a state.</p>
      )}
    </Section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AsyncStatesPage() {
  return (
    <main className="space-y-6 px-6 py-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
          Issues #38 &amp; #48
        </p>
        <h1 className="text-3xl font-bold text-slate-50">
          Mock service layer &amp; async state system
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          Typed mock services for auth, portfolio, strategy, and transactions with simulated
          latency and failure rates. Each section below demonstrates loading skeletons, empty
          states with CTAs, and error blocks with retry actions.
        </p>
      </div>

      <InlineBanner
        variant="info"
        eyebrow="Adapter contract"
        title="Mock services implement typed interfaces — swap for real adapters without touching call-sites"
      >
        <code className="text-xs">mockPortfolioService</code>,{" "}
        <code className="text-xs">mockStrategyService</code>,{" "}
        <code className="text-xs">mockTransactionService</code>, and{" "}
        <code className="text-xs">mockAuthService</code> all satisfy their respective service
        interfaces. The <code className="text-xs">useAsyncState</code> hook standardises
        loading / success / error across every page.
      </InlineBanner>

      <PortfolioStateDemo />
      <StrategyStateDemo />
      <TransactionStateDemo />
      <HistoryStateDemo />
      <AuditStateDemo />
    </main>
  );
}
