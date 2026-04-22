import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface CompactEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

interface RichEmptyStateProps {
  icon: ReactNode;
  heading: string;
  body: string;
  ctaLabel?: string;
  onAction?: () => void;
  ctaHref?: string;
}

export default function CompactEmptyState({
  icon: Icon,
  title,
  description,
}: CompactEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
        <Icon className="h-5 w-5 text-text-muted" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs text-text-muted">{description}</p>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  heading,
  body,
  ctaLabel,
  onAction,
  ctaHref,
}: RichEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
        {icon}
      </div>

      <h2 className="mb-2 text-xl font-semibold text-slate-100">{heading}</h2>

      <p className="mb-6 max-w-[420px] text-sm leading-relaxed text-slate-400">
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
