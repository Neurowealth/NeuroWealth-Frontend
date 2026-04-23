import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

/**
 * Suspense fallback for the /dashboard route.
 * Rendered automatically by Next.js while the page suspends.
 */
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}
