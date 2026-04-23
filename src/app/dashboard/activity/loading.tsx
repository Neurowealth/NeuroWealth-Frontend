import SkeletonBlock from "@/components/skeletons/SkeletonBlock";
import SkeletonActivityRow from "@/components/skeletons/SkeletonActivityRow";

export default function ActivityLoading() {
  return (
    <div className="space-y-4 animate-fade-in" aria-busy="true" aria-label="Loading activity">
      {/* Filter bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {/* Rows */}
      <div className="card">
        <SkeletonBlock className="h-3.5 w-40 mb-5" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <SkeletonActivityRow key={i} />
        ))}
      </div>
    </div>
  );
}
