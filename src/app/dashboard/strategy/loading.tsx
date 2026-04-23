import SkeletonBlock from "@/components/skeletons/SkeletonBlock";

export default function StrategyLoading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading strategy">
      <SkeletonBlock className="h-3.5 w-48 mb-1" />
      <SkeletonBlock className="h-3 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card space-y-3">
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-3 w-full" />
            <SkeletonBlock className="h-3 w-3/4" />
            <SkeletonBlock className="h-6 w-16 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
