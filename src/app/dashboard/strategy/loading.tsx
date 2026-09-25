import { Skeleton, SkeletonCircle } from "@/components/ui/Skeleton";

export default function StrategyLoading() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading strategy">
      <Skeleton height={14} width="48%" />
      <Skeleton height={12} width="72%" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ padding: 24, borderRadius: 12, border: "1px solid var(--border)" }}>
            <SkeletonCircle size={40} />
            <Skeleton height={16} width="70%" style={{ marginTop: 12, marginBottom: 12 }} />
            <Skeleton height={12} width="100%" style={{ marginBottom: 8 }} />
            <Skeleton height={12} width="75%" />
            <Skeleton height={24} width={64} radius={6} style={{ marginTop: 16 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
