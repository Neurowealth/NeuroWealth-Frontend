"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, AlertTriangle, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useSandbox } from "@/contexts/SandboxContext";

export default function HistoryPage() {
  const searchParams = useSearchParams();
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

  if (loading) {
    return (
      <div className="px-6 pt-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold text-slate-100">History</h1>
          {isSandboxMode && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Sandbox: {scenario}
            </span>
          )}
        </div>
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-8">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold text-slate-100">History</h1>
          {isSandboxMode && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Sandbox: {scenario}
            </span>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="text-red-600" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error loading history</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (scenario === "empty") {
    return (
      <div className="min-h-[60vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-slate-100">History</h1>
          {isSandboxMode && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Sandbox: {scenario}
            </span>
          )}
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
        {isSandboxMode && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Sandbox: {scenario}
          </span>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Deposit</p>
                <p className="text-sm text-gray-500">Mar 23, 2026 • 2:30 PM</p>
              </div>
              <span className="text-green-600 font-medium">+$1,000.00</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium text-gray-900">Yield Payment</p>
                <p className="text-sm text-gray-500">Mar 22, 2026 • 11:45 AM</p>
              </div>
              <span className="text-green-600 font-medium">+$12.50</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Rebalance</p>
                <p className="text-sm text-gray-500">Mar 21, 2026 • 9:15 AM</p>
              </div>
              <span className="text-gray-600 font-medium">Reallocation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
