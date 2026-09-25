"use client";

import { useEffect, useState } from "react";
import { isOnboardingCompleted, saveOnboardingState } from "@/lib/onboarding-state";
import OnboardingFlow from "./OnboardingFlow";

interface OnboardingGateProps {
  children: React.ReactNode;
}

/**
 * Wraps any page and shows the onboarding flow for first-time users.
 * Once completed or skipped, renders children normally.
 * State is persisted in localStorage so it survives page reloads.
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  // null = not yet checked (SSR-safe), true/false = checked
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    setShowOnboarding(!isOnboardingCompleted());
  }, []);

  // Don't render anything until we've checked localStorage (avoids flash)
  if (showOnboarding === null) return null;

  if (showOnboarding) {
    const handleDone = () => {
      saveOnboardingState({ completed: true, lastStep: 2, timestamp: Date.now() });
      setShowOnboarding(false);
    };
    return <OnboardingFlow onComplete={handleDone} onSkip={handleDone} />;
  }

  return <>{children}</>;
}
