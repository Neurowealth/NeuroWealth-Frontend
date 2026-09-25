import type { Metadata } from "next";
import { Suspense } from "react";
import { RealtimeDashboard } from "@/components/dashboard/RealtimeDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your NeuroWealth portfolio overview — track yields, strategies, and transaction history.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <Suspense fallback={<DashboardSkeleton />}>
          <RealtimeDashboard />
        </Suspense>
      </OnboardingGate>
    </ProtectedRoute>
  );
}
