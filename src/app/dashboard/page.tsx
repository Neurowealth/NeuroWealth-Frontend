import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PortfolioDashboard } from "@/components/dashboard/PortfolioDashboard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export const metadata = { title: "Dashboard - NeuroWealth" };

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<DashboardSkeleton />}>
        <PortfolioDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
