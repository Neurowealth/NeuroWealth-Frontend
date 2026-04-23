import SkeletonStatCard from "./SkeletonStatCard";
import SkeletonAllocationWidget from "./SkeletonAllocationWidget";
import SkeletonActivityRow from "./SkeletonActivityRow";
import SkeletonBlock from "./SkeletonBlock";

/**
 * Full-page skeleton for the dashboard home.
 * Mirrors the real layout: 4 stat cards + allocation widget + activity feed.
 */
export default function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard"
      className="animate-fade-in space-y-6"
    >
      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Quick-action buttons */}
      <div className="flex gap-3">
        <SkeletonBlock className="h-10 w-28 rounded-lg" />
        <SkeletonBlock className="h-10 w-28 rounded-lg" />
      </div>

      {/* Lower widgets: allocation + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonAllocationWidget />

        {/* Recent activity */}
        <div className="card" aria-hidden="true">
          <SkeletonBlock className="h-3.5 w-32 mb-5" />
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonActivityRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
