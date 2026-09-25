import { HTMLAttributes } from "react";

// Spec: 1px border (--color-surface-border / #1F2937), shadow var(--shadow-card), radius 12px (rounded-xl)
// Token map: bg-gray-900 → bg-surface (#111827), border-gray-800 → border-surface-border (#1F2937)
type CardVariant = "default" | "elevated" | "outlined";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  variant?: CardVariant;
}

const cardVariants: Record<CardVariant, string> = {
  default:  "border border-surface-border bg-surface",
  elevated: "border border-surface-elevated bg-surface shadow-md",
  outlined: "border-2 border-surface-border bg-transparent",
};

export function Card({
  glow = false,
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl shadow-card p-6 ${cardVariants[variant]} ${
        glow ? "shadow-sky-500/10 border-sky-500/30 shadow-lg" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
