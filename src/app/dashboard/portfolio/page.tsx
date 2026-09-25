import { Suspense } from "react";
import { PortfolioDashboard } from "@/components/dashboard/PortfolioDashboard";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portfolio — NeuroWealth" };

export default function PortfolioPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PortfolioDashboard />
    </Suspense>
  );
}
