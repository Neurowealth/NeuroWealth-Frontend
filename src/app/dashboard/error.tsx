"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function DashboardError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      statusCode={500}
      title="Dashboard unavailable"
      description="We are having trouble loading this dashboard view right now. Your funds and wallet connection remain safe."
      icon={<AlertTriangle size={32} />}
      primaryAction={{ label: "Back to dashboard home", href: "/dashboard" }}
      secondaryAction={{ label: "Try again", onClick: reset }}
      ownsLandmark={false}
    />
  );
}
