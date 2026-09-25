import React from "react";

interface SandboxBadgeProps {
  scenario: string;
  label?: string;
  className?: string;
}

export function SandboxBadge({ scenario, label = "Sandbox", className = "" }: SandboxBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 ${className}`}
    >
      {label}: {scenario}
    </span>
  );
}
