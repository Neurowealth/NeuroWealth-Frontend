"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function ProfileError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      statusCode={500}
      title="Profile unavailable"
      description="We could not load your profile view. Your saved preferences remain unchanged, and you can try loading this route again."
      icon={<AlertTriangle size={32} />}
      primaryAction={{ label: "Back to dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "Try again", onClick: reset }}
    />
  );
}
