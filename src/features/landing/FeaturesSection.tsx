"use client";

import { Card } from "@/components/ui/Card";
import { useI18n } from "@/contexts";

export function FeaturesSection() {
  const { messages } = useI18n();

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      {/* Section header */}
      <div className="mb-14 text-center">
        <span className="inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          {messages.features.badge}
        </span>
        {/* Spec: 30px heading */}
        <h2 className="mt-4 text-3xl font-bold text-slate-50">
          {messages.features.title}
        </h2>
        <p className="mt-3 text-base text-slate-400">
          {messages.features.description}
        </p>
      </div>

      {/* Spec: Card — border #1F2937 (gray-800), shadow, radius 12px */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {messages.features.items.map((f) => (
          <Card key={f.title} className="flex flex-col gap-4">
            {/* Icon badge */}
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl ${f.bg}`}
            >
              {f.icon}
            </div>
            <div>
              <h3 className={`font-semibold ${f.accent}`}>{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                {f.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
