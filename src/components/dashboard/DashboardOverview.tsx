"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart2,
  Clock,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { PortfolioSummary, Transaction } from "@/types";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

// ── Placeholder / mock data ───────────────────────────────────────────────────
// Replace with real API calls (Issue 10) once the backend is wired.

const MOCK_SUMMARY: PortfolioSummary | null = null; // set to null for empty state demo
const MOCK_TRANSACTIONS: Transaction[] = [];

// ── Helper formatters ─────────────────────────────────────────────────────────

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

function formatPct(n: number) {
  return `${n.toFixed(2)}%`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  accent?: string;
}

function StatCard({ label, value, subtext, icon: Icon, accent = "text-primary" }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-surface-elevated"
          )}
          aria-hidden="true"
        >
          <Icon className={cn("w-4 h-4", accent)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {subtext && <p className="mt-1 text-xs text-text-secondary">{subtext}</p>}
    </div>
  );
}

// ── Transaction row ───────────────────────────────────────────────────────────

const TX_ICONS: Record<string, React.ElementType> = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  rebalance: TrendingUp,
  yield: Percent,
};

const TX_COLORS: Record<string, string> = {
  deposit: "text-success",
  withdrawal: "text-error",
  rebalance: "text-primary",
  yield: "text-warning",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-success/10 text-success",
  failed: "bg-error/10 text-error",
};

function TransactionRow({ tx }: { tx: Transaction }) {
  const Icon = TX_ICONS[tx.type] ?? Clock;
  const iconColor = TX_COLORS[tx.type] ?? "text-text-secondary";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-surface-border last:border-0">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          "bg-surface-elevated"
        )}
        aria-hidden="true"
      >
        <Icon className={cn("w-4 h-4", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary capitalize">
          {tx.description ?? tx.type}
        </p>
        <p className="text-xs text-text-muted">
          {new Date(tx.timestamp).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-sm font-semibold",
            tx.type === "deposit" || tx.type === "yield"
              ? "text-success"
              : "text-text-primary"
          )}
        >
          {tx.type === "withdrawal" ? "-" : "+"}
          {formatUsd(tx.amount)}
        </p>
        <span
          className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded-full",
            STATUS_BADGE[tx.status]
          )}
        >
          {tx.status}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardOverview() {
  const [summary] = useState<PortfolioSummary | null>(MOCK_SUMMARY);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  const strategyLabels: Record<string, string> = {
    conservative: "Conservative",
    balanced: "Balanced",
    growth: "Growth",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Stat cards ── */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Portfolio summary
        </h2>
        {summary ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total Balance"
              value={formatUsd(summary.totalBalance)}
              subtext="USDC across all strategies"
              icon={Wallet}
              accent="text-primary"
            />
            <StatCard
              label="Total Yield Earned"
              value={formatUsd(summary.totalYield)}
              subtext="All time"
              icon={TrendingUp}
              accent="text-success"
            />
            <StatCard
              label="Current APY"
              value={formatPct(summary.currentApy)}
              subtext="7-day average"
              icon={Percent}
              accent="text-warning"
            />
            <StatCard
              label="Active Strategy"
              value={strategyLabels[summary.strategy] ?? "—"}
              subtext="Tap to change strategy"
              icon={BarChart2}
              accent="text-info"
            />
          </div>
        ) : (
          // Empty state for stats
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {(
              [
                { label: "Total Balance", value: "$0.00", icon: Wallet },
                { label: "Total Yield Earned", value: "$0.00", icon: TrendingUp },
                { label: "Current APY", value: "—", icon: Percent },
                { label: "Active Strategy", value: "None", icon: BarChart2 },
              ] as const
            ).map(({ label, value, icon }) => (
              <StatCard
                key={label}
                label={label}
                value={value}
                subtext="No funds deposited yet"
                icon={icon}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Quick actions ── */}
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="sr-only">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary flex items-center gap-2 text-sm" disabled>
            <ArrowDownLeft className="w-4 h-4" aria-hidden="true" />
            Deposit
          </button>
          <button
            className="btn-ghost flex items-center gap-2 text-sm border border-surface-border"
            disabled
          >
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            Withdraw
          </button>
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Connect your Freighter wallet to deposit funds. (Issue 9)
        </p>
      </section>

      {/* ── Lower widgets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Asset allocation placeholder */}
        <section
          aria-labelledby="allocation-heading"
          className="card"
        >
          <h2 id="allocation-heading" className="text-sm font-semibold text-text-primary mb-4">
            Asset Allocation
          </h2>
          {summary ? (
            <div className="space-y-3">
              {/* Placeholder bars — real chart in Issue 5 */}
              {[
                { label: "Blend — Lending", pct: 60, color: "bg-primary" },
                { label: "Stellar DEX — LP", pct: 30, color: "bg-success" },
                { label: "Reserve", pct: 10, color: "bg-warning" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">{label}</span>
                    <span className="text-text-primary font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", color)}
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={label}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BarChart2}
              title="No allocation data"
              description="Deposit funds to see your asset allocation."
            />
          )}
        </section>

        {/* Recent activity */}
        <section
          aria-labelledby="activity-heading"
          className="card"
        >
          <h2 id="activity-heading" className="text-sm font-semibold text-text-primary mb-4">
            Recent Activity
          </h2>
          {transactions.length > 0 ? (
            <div>
              {transactions.slice(0, 5).map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No activity yet"
              description="Your transactions will appear here."
            />
          )}
        </section>
      </div>
    </div>
  );
}
