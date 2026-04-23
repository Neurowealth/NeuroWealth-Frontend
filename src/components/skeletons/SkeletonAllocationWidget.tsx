import SkeletonBlock from "./SkeletonBlock";

/** Skeleton for the asset allocation widget */
export default function SkeletonAllocationWidget() {
  return (
    <div className="card" aria-hidden="true" role="status" aria-label="Loading...">
      {/* Title */}
      <SkeletonBlock className="h-3.5 w-40 mb-5" />

      {/* Donut chart placeholder */}
      <div className="flex items-center gap-6 mb-5">
        <SkeletonBlock className="w-24 h-24 rounded-full shrink-0" />
        <div className="flex-1 space-y-2.5">
          {[56, 40, 68].map((w) => (
            <div key={w} className="flex items-center gap-2">
              <SkeletonBlock className="w-2.5 h-2.5 rounded-full shrink-0" />
              <SkeletonBlock className={`h-2.5 w-${w}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Bar rows */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-2.5">
          <div className="flex justify-between mb-1">
            <SkeletonBlock className="h-2.5 w-20" />
            <SkeletonBlock className="h-2.5 w-10" />
          </div>
          <SkeletonBlock className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
