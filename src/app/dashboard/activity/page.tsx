import { Suspense } from "react";
import { History } from "lucide-react";
import ActivityLoading from "./loading";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Activity — NeuroWealth" };

const FILTER_TABS = ["All", "Deposits", "Withdrawals", "Yields", "Rebalances"] as const;

// Placeholder — will be populated when Issue 8 (transaction history) is implemented.
function ActivityContent() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Activity</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your full transaction and rebalancing history.
        </p>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filter activity"
      >
        {FILTER_TABS.map((label, i) => (
          <button
            key={label}
            role="tab"
            aria-selected={i === 0}
            className={
              i === 0
                ? "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30"
                : "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-text-muted border border-surface-border hover:text-text-secondary transition-colors"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="card">
        <EmptyState
          icon={History}
          title="No transactions yet"
          description="Your deposits, withdrawals, and rebalances will appear here."
        />
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<ActivityLoading />}>
      <ActivityContent />
    </Suspense>
  );
}
