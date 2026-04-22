"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
        <AlertTriangle className="h-7 w-7 text-error" aria-hidden="true" />
      </div>

      <h2 className="mb-2 text-lg font-semibold text-text-primary">
        Something went wrong
      </h2>
      <p className="mb-6 max-w-sm text-sm text-text-secondary">
        {error.message || "An unexpected error occurred in the dashboard."}
        {error.digest && (
          <span className="mt-1 block font-mono text-xs text-text-muted">
            ID: {error.digest}
          </span>
        )}
      </p>

      <button
        onClick={reset}
        className="btn-primary flex items-center gap-2 text-sm"
        aria-label="Try again"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}
