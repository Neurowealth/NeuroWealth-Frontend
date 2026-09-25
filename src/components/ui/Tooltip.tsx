"use client";

import { ReactNode, useId, useState } from "react";

interface TooltipProps {
  /** Content revealed on hover/focus. */
  label: ReactNode;
  /** Trigger element. */
  children: ReactNode;
  className?: string;
}

/**
 * Lightweight, accessible tooltip primitive (Issue 470 design-system).
 *
 * - Reveals on hover and keyboard focus.
 * - Trigger is focusable and linked to the bubble via `aria-describedby`.
 * - Dismisses on Escape, per WAI-ARIA tooltip guidance.
 *
 * Used by the formatted-value helpers (Issue 468) to surface full precision.
 */
export function Tooltip({ label, children, className = "" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <span tabIndex={0} aria-describedby={open ? id : undefined} className="outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-sm">
        {children}
      </span>
      <span
        role="tooltip"
        id={id}
        hidden={!open}
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-100 shadow-lg"
      >
        {label}
      </span>
    </span>
  );
}

export default Tooltip;
