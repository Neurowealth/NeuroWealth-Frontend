"use client";

import { TransactionHistory } from "@/components/transactions/TransactionHistory";
import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useSandbox } from "@/contexts/SandboxContext";
import { SandboxBadge } from "@/components/ui/SandboxBadge";

export default function HistoryPage() {
  const { getCurrentScenario, isSandboxMode } = useSandbox();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scenario = getCurrentScenario("history");

  useEffect(() => {
    if (scenario === "loading") {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    } else if (scenario === "timeout") {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setError("Request timed out. Please try again.");
      }, 5000);
      return () => clearTimeout(timer);
    } else if (scenario === "partial-failure") {
      setError("Some transaction data could not be loaded. Showing partial results.");
    } else {
      setLoading(false);
      setError(null);
    }
  }, [scenario]);

  return (
    <div className={`px-6 pt-8${scenario === "empty" ? " min-h-[60vh] flex flex-col" : ""}`}>
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold text-slate-100">History</h1>
        {isSandboxMode && <SandboxBadge scenario={scenario} />}
      </div>

      {loading && <TableSkeleton rows={6} cols={5} />}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-red-600 shrink-0" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error loading history</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && scenario === "empty" && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<Clock size={32} />}
            heading="No transaction history"
            body="Once you make your first deposit or withdrawal, your transaction history will appear here."
            ctaLabel="Make a deposit"
            ctaHref="/dashboard"
          />
        </div>
      )}

      {/*
        The full deposits / withdrawals / rebalancing timeline with filters,
        pagination, status tags, and tx-hash explorer links (Issue 472).
      */}
      {!loading && !error && scenario !== "empty" && <TransactionHistory embedded />}
    </div>
  );
}
