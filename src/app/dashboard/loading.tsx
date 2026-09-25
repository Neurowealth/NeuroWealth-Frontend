import { DashboardSkeleton } from "@/components/ui/Skeleton";

/**
 * Suspense fallback for the /dashboard route.
 * Rendered automatically by Next.js while the page suspends.
 */
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
