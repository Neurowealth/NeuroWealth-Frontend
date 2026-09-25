"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";

/** Compact inline empty state (Lucide icon component). */
interface EmptyStateCompactProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyStateCompact({
  icon: Icon,
  title,
  description,
}: EmptyStateCompactProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated mb-3">
        <Icon className="h-5 w-5 text-text-muted" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-text-muted">{description}</p>
      )}
    </div>
  );
}

/** Full-page style empty state with optional CTA. */
interface EmptyStateProps {
  icon: ReactNode;
  heading: string;
  body: string;
  ctaLabel?: string;
  onAction?: () => void;
  ctaHref?: string;
}

export function EmptyState({
  icon,
  heading,
  body,
  ctaLabel,
  onAction,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated text-text-muted">
        {icon}
      </div>

      <h2 className="mb-2 text-xl font-semibold text-text-primary">{heading}</h2>

      <p className="mb-6 max-w-[420px] text-sm leading-relaxed text-text-secondary">
        {body}
      </p>

      {ctaLabel && ctaHref && (
        <a href={ctaHref}>
          <Button variant="primary" size="md">
            {ctaLabel}
          </Button>
        </a>
      )}

      {ctaLabel && onAction && !ctaHref && (
        <Button variant="primary" size="md" onClick={onAction}>
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
