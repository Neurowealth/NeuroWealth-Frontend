"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function HistoryPage() {
  const [showEmpty, setShowEmpty] = useState(true);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="px-6 pt-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold text-slate-100">History</h1>
        </div>
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-slate-100">History</h1>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => { setLoading(false); setShowEmpty(false); }, 1000);
            }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Mock: show data
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={<Clock size={32} />}
            heading="No transaction history"
            body="Once you make your first deposit or withdrawal, your transaction history will appear here."
            ctaLabel="Make a deposit"
            ctaHref="/dashboard"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold text-slate-100">History</h1>
        <button
          onClick={() => setShowEmpty(true)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Mock: show empty
        </button>
      </div>
      <p className="text-slate-400">Transaction history content goes here.</p>
    </div>
  );
}
