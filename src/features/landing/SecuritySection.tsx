"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/contexts";

interface SecurityFeature {
  icon: ReactNode;
}

const features: SecurityFeature[] = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <polyline points="9 15 11 17 15 13" />
      </svg>
    ),
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export function SecuritySection() {
  const { messages } = useI18n();

  return (
    <section id="security" className="mx-auto max-w-6xl px-6 py-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          {messages.security.badge}
        </span>
        <h2 className="mt-4 text-3xl font-bold text-slate-50">
          {messages.security.title}
        </h2>
        <p className="mt-3 text-base text-slate-400">
          {messages.security.description}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((f, index) => {
          const text = messages.security.items[index];

          return (
            <Card key={text.title} className="flex gap-5">
            {/* Icon */}
            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400">
              {f.icon}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-3">
                <h3 className="font-semibold text-slate-50">{text.title}</h3>
                <span className="font-mono text-xs text-emerald-400">
                  {text.stat} &middot; {text.statLabel}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">{text.desc}</p>
            </div>
          </Card>
          );
        })}
      </div>
    </section>
  );
}
