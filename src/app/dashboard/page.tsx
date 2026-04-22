import { Suspense } from "react";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata = { title: "Dashboard - NeuroWealth" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardOverview />
    </Suspense>
  );
}
