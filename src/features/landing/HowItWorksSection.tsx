"use client";

import { useI18n } from "@/contexts";

export function HowItWorksSection() {
  const { messages } = useI18n();

  return (
    <section id="how-it-works" className="bg-gray-900/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            {messages.howItWorks.badge}
          </span>
          {/* Spec: 30px heading */}
          <h2 className="mt-4 text-3xl font-bold text-slate-50">
            {messages.howItWorks.title}
          </h2>
          <p className="mt-3 text-base text-slate-400">
            {messages.howItWorks.description}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {messages.howItWorks.steps.map((s, i) => (
            <div key={s.n} className="relative flex flex-col gap-4">
              {/* Connector line */}
              {i < messages.howItWorks.steps.length - 1 && (
                <div className="absolute left-10 top-10 hidden h-px w-full bg-linear-to-r from-sky-500/40 to-transparent md:block" />
              )}

              {/* Step badge — spec primary sky-500 */}
              <div className="flex h-13 w-13 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 font-mono text-lg font-bold text-sky-400">
                {s.n}
              </div>

              <div>
                <h3 className="font-semibold text-slate-50">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
