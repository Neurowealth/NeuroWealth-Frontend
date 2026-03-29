import { ButtonHTMLAttributes } from "react";

// Spec: primary filled (#0EA5E9 = sky-500), secondary outline, radius 8px (rounded-lg)
type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-sky-500 hover:bg-sky-400 text-white font-semibold shadow-lg shadow-sky-500/20",
  secondary:
    "border border-sky-500/60 text-sky-400 hover:bg-sky-500/10 font-medium",
  ghost:
    "text-slate-400 hover:text-slate-100 hover:bg-white/5 dark:text-slate-400 dark:hover:text-white",
  destructive:
    "bg-red-500 hover:bg-red-400 text-white font-semibold shadow-lg shadow-red-500/20",
};

// Spec: radius 8px = rounded-lg for all sizes
const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3.5 text-base rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 text-center whitespace-normal leading-snug transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
