import SkeletonBlock from "./SkeletonBlock";

/** Skeleton for a single activity/transaction row */
export default function SkeletonActivityRow() {
  return (
    <div
      className="flex items-center gap-3 py-3 border-b border-surface-border last:border-0"
      aria-hidden="true"
    >
      <SkeletonBlock className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="h-3 w-36" />
        <SkeletonBlock className="h-2.5 w-24" />
      </div>
      <SkeletonBlock className="h-3 w-16 shrink-0" />
    </div>
  );
}
