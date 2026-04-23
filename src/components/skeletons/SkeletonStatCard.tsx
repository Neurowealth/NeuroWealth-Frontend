import SkeletonBlock from "./SkeletonBlock";

/** Skeleton for a summary stat card (balance, APY, yield, strategy) */
export default function SkeletonStatCard() {
  return (
    <div
      className="card"
      aria-hidden="true"
      role="status"
      aria-label="Loading..."
    >
      <SkeletonBlock className="h-3 w-24 mb-3" />
      <SkeletonBlock className="h-7 w-32 mb-2" />
      <SkeletonBlock className="h-3 w-20" />
    </div>
  );
}
