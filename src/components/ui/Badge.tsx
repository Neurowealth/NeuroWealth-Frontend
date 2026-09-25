import React, { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default:
    "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300",
  success:
    "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
  warning:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  error:
    "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  info:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
};

export function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
