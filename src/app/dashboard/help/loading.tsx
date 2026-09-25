import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function HelpLoading() {
  return (
    <div
      className="px-6 py-8 space-y-6 animate-fade-in"
      aria-busy="true"
      aria-label="Loading help center"
    >
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton height={20} width="28%" />
        <Skeleton height={14} width="55%" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-slate-700/50 bg-slate-950/35 p-1 w-fit">
        {[80, 120, 130].map((w, i) => (
          <Skeleton key={i} height={36} width={w} radius={8} />
        ))}
      </div>

      {/* Tab panel content — FAQ rows */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="card p-4 space-y-2"
            aria-hidden="true"
          >
            <Skeleton height={16} width="70%" />
            <SkeletonText lines={2} lastLineWidth="45%" />
          </div>
        ))}
      </div>
    </div>
  );
}
