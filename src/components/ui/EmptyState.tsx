import { createElement, isValidElement, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

type EmptyStateIcon = LucideIcon | ReactNode;

interface EmptyStateActions {
  ctaLabel?: string;
  ctaHref?: string;
  onAction?: () => void;
}

interface LegacyEmptyStateProps extends EmptyStateActions {
  icon: LucideIcon;
  title: string;
  description?: string;
  heading?: never;
  body?: never;
}

interface ModernEmptyStateProps extends EmptyStateActions {
  icon: ReactNode;
  heading: string;
  body: string;
  title?: never;
  description?: never;
}

export type EmptyStateProps =
  | LegacyEmptyStateProps
  | ModernEmptyStateProps;

function renderIcon(icon: EmptyStateIcon) {
  if (isValidElement(icon)) {
    return icon;
  }

  return createElement(icon as LucideIcon, {
    className: "h-5 w-5 text-text-muted",
    "aria-hidden": "true",
  });
}

export function EmptyState(props: EmptyStateProps) {
  const heading = "heading" in props ? props.heading : props.title;
  const body = "body" in props ? props.body : props.description;
  const isLegacyIcon = !isValidElement(props.icon);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div
        className={
          isLegacyIcon
            ? "mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated"
            : "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400"
        }
      >
        {renderIcon(props.icon)}
      </div>

      <h2
        className={
          isLegacyIcon
            ? "text-sm font-medium text-text-secondary"
            : "mb-2 text-xl font-semibold text-slate-100"
        }
      >
        {heading}
      </h2>

      {body ? (
        <p
          className={
            isLegacyIcon
              ? "mt-1 max-w-xs text-xs text-text-muted"
              : "mb-6 max-w-[420px] text-sm leading-relaxed text-slate-400"
          }
        >
          {body}
        </p>
      ) : null}

      {props.ctaLabel && props.ctaHref ? (
        <a href={props.ctaHref}>
          <Button variant="primary" size="md">
            {props.ctaLabel}
          </Button>
        </a>
      ) : null}

      {props.ctaLabel && props.onAction && !props.ctaHref ? (
        <Button variant="primary" size="md" onClick={props.onAction}>
          {props.ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
