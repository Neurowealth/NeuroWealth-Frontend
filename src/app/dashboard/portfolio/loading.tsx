import SkeletonBlock from "@/components/skeletons/SkeletonBlock";
import SkeletonStatCard from "@/components/skeletons/SkeletonStatCard";
import SkeletonAllocationWidget from "@/components/skeletons/SkeletonAllocationWidget";

export default function PortfolioLoading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading portfolio">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <SkeletonStatCard key={i} />)}
      </div>
      {/* Chart placeholder */}
      <div className="card">
        <SkeletonBlock className="h-3.5 w-36 mb-5" />
        <SkeletonBlock className="h-48 w-full rounded-lg" />
      </div>
      {/* Allocation */}
      <SkeletonAllocationWidget />
    </div>
  );
}
