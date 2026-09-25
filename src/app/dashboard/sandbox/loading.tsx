import { CardSkeleton } from "@/components/ui/Skeleton";

export default function SandboxLoading() {
  return (
    <div className="space-y-6 px-6 py-8" aria-busy="true" aria-label="Loading sandbox">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-white/5" />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CardSkeleton lines={4} showFooter />
        <CardSkeleton lines={3} showFooter />
      </div>
    </div>
  );
}
