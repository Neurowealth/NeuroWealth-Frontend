"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export function FieldError({
  id,
  message,
  icon = true,
}: {
  id: string;
  message?: string;
  icon?: boolean;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      className="mt-2 flex items-start gap-2 text-[14px] leading-5 text-[#EF4444]"
    >
      {icon ? <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" /> : null}
      <span>{message}</span>
    </p>
  );
}

export function SectionError({
  title,
  message,
  children,
}: {
  title: string;
  message?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-700/50 bg-slate-950/30 p-5">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
          {title}
        </h2>
        <FieldError id={`${title.toLowerCase().replace(/\s+/g, "-")}-section-error`} message={message} />
      </div>
      {children}
    </section>
  );
}

export function FormErrorSummary({
  title,
  errors,
}: {
  title: string;
  errors: string[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (errors.length > 0) {
      ref.current?.focus();
    }
  }, [errors]);

  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border border-red-500/35 bg-red-500/10 p-4 text-[#EF4444] outline-none"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-red-300">{title}</p>
          <ul className="space-y-1 text-[14px] leading-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
