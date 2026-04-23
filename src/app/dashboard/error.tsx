"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for all /dashboard/* routes.
 * Next.js App Router renders this component when a route segment throws.
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // In production, report to your error-monitoring service here.
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-error" aria-hidden="true" />
      </div>

      <h2 className="text-lg font-semibold text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-text-secondary max-w-sm mb-6">
        {error.message || "An unexpected error occurred in the dashboard."}
        {error.digest && (
          <span className="block mt-1 text-xs text-text-muted font-mono">
            ID: {error.digest}
          </span>
        )}
      </p>

      <button
        onClick={reset}
        className="btn-primary flex items-center gap-2 text-sm"
        aria-label="Try again"
      >
        <RefreshCw className="w-4 h-4" aria-hidden="true" />
        Try again
      </button>
    </div>
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
      title="Dashboard error"
      description="Something went wrong loading the dashboard. Your funds are safe. Try refreshing or come back in a moment."
      icon={<AlertTriangle size={32} />}
      primaryAction={{ label: "Try again", href: "#" }}
      secondaryAction={{ label: "Back to home", href: "/", onClick: reset }}
    />
  );
}
