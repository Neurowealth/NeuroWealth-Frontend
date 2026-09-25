import { Skeleton, ActivityRowSkeleton } from "@/components/ui/Skeleton";

export default function ActivityLoading() {
  return (
    <div className="space-y-4 animate-fade-in" aria-busy="true" aria-label="Loading activity">
      {/* Filter bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={32} width={80} radius={999} />
        ))}
      </div>
      {/* Rows */}
      <div className="card">
        <Skeleton height={14} width="40%" style={{ marginBottom: 20 }} />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ActivityRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
