import { cn } from "@/lib/utils";

interface SkeletonBlockProps {
  className?: string;
}

/** Single shimmer block — compose into larger skeleton patterns */
export default function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn("skeleton", className)}
      aria-hidden="true"
      role="presentation"
    />
  );
}
