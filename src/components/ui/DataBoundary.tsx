"use client";

/**
 * DataBoundary
 *
 * Wraps any data-dependent section and renders the correct UI for each state:
 *   - loading  → skeleton (your existing Skeleton components)
 *   - error    → inline error banner with Retry button  (no infinite skeleton)
 *   - success  → children
 *
 * Usage:
 *   <DataBoundary loading={loading} error={error} onRetry={retry} skeleton={<PortfolioSkeleton />}>
 *     <PortfolioContent data={data!} />
 *   </DataBoundary>
 */

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface DataBoundaryProps {
  loading: boolean;
  error: { message: string } | null;
  onRetry?: () => void;
  /** Skeleton UI shown while loading. Defaults to a generic block. */
  skeleton?: React.ReactNode;
  /** Optional label for the error context (e.g. "portfolio data") */
  label?: string;
  children: React.ReactNode;
}

export function DataBoundary({
  loading,
  error,
  onRetry,
  skeleton,
  label = "data",
  children,
}: DataBoundaryProps) {
  if (loading) {
    return <>{skeleton ?? <GenericSkeleton />}</>;
  }

  if (error) {
    return (
      <InlineErrorBanner
        message={error.message}
        label={label}
        onRetry={onRetry}
      />
    );
  }

  return <>{children}</>;
}

/* ─── Generic fallback skeleton ────────────────────────────────────────────── */

function GenericSkeleton() {
  return (
    <div
      className="animate-pulse space-y-3 p-4"
      aria-busy="true"
      aria-label="Loading…"
    >
      <div className="h-4 w-2/3 rounded bg-slate-700/50" />
      <div className="h-4 w-full rounded bg-slate-700/50" />
      <div className="h-4 w-5/6 rounded bg-slate-700/50" />
    </div>
  );
}

/* ─── Inline error banner ───────────────────────────────────────────────────── */

interface InlineErrorBannerProps {
  message?: string;
  label: string;
  onRetry?: () => void;
}

function InlineErrorBanner({
  message,
  label,
  onRetry,
}: InlineErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-1">
        <p className="font-medium">Failed to load {label}</p>
        {message && <p className="text-red-400/70">{message}</p>}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  );
}
