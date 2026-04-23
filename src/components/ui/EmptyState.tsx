import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-text-muted" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-text-muted max-w-xs">{description}</p>
"use client";

import { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: ReactNode;
  heading: string;
  body: string;
  ctaLabel?: string;
  onAction?: () => void;
  ctaHref?: string;
}

/**
 * Reusable empty-state pattern for pages with no data.
 *
 * Spec: icon 24–48px, heading + body + CTA hierarchy, body max-width 420px.
 */
export function EmptyState({
  icon,
  heading,
  body,
  ctaLabel,
  onAction,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 mb-6">
        {icon}
      </div>

      <h2 className="text-xl font-semibold text-slate-100 mb-2">{heading}</h2>

      <p className="text-sm text-slate-400 max-w-[420px] leading-relaxed mb-6">
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
