import { cn } from "@/lib/utils";
import styles from "./styles";

interface SkeletonBlockProps {
  className?: string;
}

/** Single shimmer block — compose into larger skeleton patterns */
export default function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(styles.skeleton, className)}
      aria-hidden="true"
      role="presentation"
    />
  );
}
