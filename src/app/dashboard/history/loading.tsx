import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function HistoryLoading() {
  return (
    <div className="px-6 pt-8 space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading history">
      <div className="space-y-2">
        <Skeleton height={28} width={112} />
        <Skeleton height={14} width="64%" />
      </div>
      <TableSkeleton rows={10} cols={6} />
    </div>
  );
}
