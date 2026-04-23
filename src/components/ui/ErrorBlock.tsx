"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorBlockProps {
  /** Short title, e.g. "Failed to load portfolio" */
  title: string;
  /** Human-readable explanation of what went wrong */
  description: string;
  /** Label for the retry / recovery button */
  actionLabel?: string;
  /** Called when the user clicks the action button */
  onAction?: () => void;
  className?: string;
}

/**
 * Inline error block for async failure states.
 *
 * Spec: includes title, explanation, and action button.
 * Use inside page sections — not as a full-page replacement.
 */
export function ErrorBlock({
  title,
  description,
  actionLabel = "Try again",
  onAction,
  className = "",
}: ErrorBlockProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-400/20 bg-red-500/8 px-6 py-10 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-100">{title}</p>
        <p className="max-w-[380px] text-sm leading-relaxed text-slate-400">{description}</p>
      </div>

      {onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
