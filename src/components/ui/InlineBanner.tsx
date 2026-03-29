import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

type InlineBannerVariant = "success" | "info" | "warning" | "error";

const bannerStyles: Record<
  InlineBannerVariant,
  {
    container: string;
    icon: typeof CheckCircle2;
    title: string;
    role: "status" | "alert";
  }
> = {
  success: {
    container: "border-emerald-400/30 bg-emerald-500/10 text-emerald-50",
    icon: CheckCircle2,
    title: "Success",
    role: "status",
  },
  info: {
    container: "border-sky-400/30 bg-sky-500/10 text-sky-50",
    icon: Info,
    title: "Information",
    role: "status",
  },
  warning: {
    container: "border-amber-400/30 bg-amber-500/10 text-amber-50",
    icon: AlertTriangle,
    title: "Warning",
    role: "alert",
  },
  error: {
    container: "border-red-400/30 bg-red-500/10 text-red-50",
    icon: AlertCircle,
    title: "Error",
    role: "alert",
  },
};

export function InlineBanner({
  variant = "info",
  eyebrow,
  title,
  children,
  action,
  className = "",
}: {
  variant?: InlineBannerVariant;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const style = bannerStyles[variant];
  const Icon = style.icon;

  return (
    <section
      role={style.role}
      aria-live={style.role === "alert" ? "assertive" : "polite"}
      className={`rounded-2xl border p-4 shadow-card ${style.container} ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-black/15 p-2">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
              {eyebrow ?? style.title}
            </p>
            <h2 className="text-base font-semibold text-white">{title}</h2>
            <div className="text-sm leading-6 text-white/80">{children}</div>
          </div>
        </div>
        {action ? <div className="sm:pl-4">{action}</div> : null}
      </div>
    </section>
  );
}
