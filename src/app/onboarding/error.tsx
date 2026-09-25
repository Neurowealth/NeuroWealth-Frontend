"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function OnboardingError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      statusCode={500}
      title="Onboarding unavailable"
      description="We could not load the onboarding flow. Your current progress remains safe, and you can retry the route when ready."
      icon={<AlertTriangle size={32} />}
      primaryAction={{ label: "Back to home", href: "/" }}
      secondaryAction={{ label: "Try again", onClick: reset }}
    />
  );
}
