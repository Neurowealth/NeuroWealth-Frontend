import { Suspense } from "react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata = { title: "Dashboard — NeuroWealth" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOverview />
    </Suspense>
import { PortfolioDashboard } from "@/components/dashboard/PortfolioDashboard";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<DashboardSkeleton />}>
        <PortfolioDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
