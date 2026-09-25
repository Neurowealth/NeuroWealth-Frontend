"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { isOnboardingCompleted } from "@/lib/onboarding-state";

export default function OnboardingPage() {
  const router = useRouter();

  // If already completed, send to dashboard (can be bypassed via settings)
  useEffect(() => {
    if (isOnboardingCompleted()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <OnboardingFlow
      onComplete={() => router.replace("/dashboard")}
      onSkip={() => router.replace("/dashboard")}
    />
  );
}
