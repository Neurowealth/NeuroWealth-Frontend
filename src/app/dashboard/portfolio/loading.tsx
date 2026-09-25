import { Skeleton, StatCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function PortfolioLoading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading portfolio">
      <div className="space-y-2">
        <Skeleton height={28} width={128} />
        <Skeleton height={14} width="58%" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="card">
        <Skeleton height={16} width="40%" style={{ marginBottom: 20 }} />
        <Skeleton height={192} width="100%" radius={12} />
      </div>

      <div className="card">
        <Skeleton height={16} width="28%" style={{ marginBottom: 20 }} />
        <TableSkeleton rows={4} cols={5} />
      </div>
    </div>
  );
}
