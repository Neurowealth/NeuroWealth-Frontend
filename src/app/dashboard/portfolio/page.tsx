import { Suspense } from "react";
import { BarChart2 } from "lucide-react";
import PortfolioLoading from "./loading";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Portfolio — NeuroWealth" };

// Placeholder — will be replaced when Issue 5 (portfolio widgets) is implemented.
function PortfolioContent() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Portfolio</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Detailed breakdown of your holdings and yield performance.
        </p>
      </div>

      {/* Performance chart placeholder */}
      <div className="card">
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          Balance Over Time
        </h2>
        <div className="flex items-center justify-center h-48 rounded-lg bg-surface-elevated">
          <EmptyState
            icon={BarChart2}
            title="Chart coming soon"
            description="Portfolio performance chart will be added in Issue 5."
          />
        </div>
      </div>

      {/* Asset allocation placeholder */}
      <div className="card">
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          Holdings
        </h2>
        <EmptyState
          icon={BarChart2}
          title="No holdings yet"
          description="Connect your wallet and deposit to see your holdings here."
        />
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioLoading />}>
      <PortfolioContent />
    </Suspense>
  );
}
