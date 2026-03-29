"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/contexts";

export function StrategiesSection() {
  const { messages } = useI18n();

  return (
    <section id="strategies" className="mx-auto max-w-6xl px-6 py-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          {messages.strategies.badge}
        </span>
        <h2 className="mt-4 text-3xl font-bold text-slate-50">
          {messages.strategies.title}
        </h2>
        <p className="mt-3 text-base text-slate-400">
          {messages.strategies.description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:items-start">
        {messages.strategies.items.map((s) => (
          <Card
            key={s.name}
            glow={s.featured}
            className={`flex flex-col gap-5 border ${s.border} ${
              s.featured ? "md:-mt-3 md:pb-9 md:pt-9" : ""
            }`}
          >
            {s.featured && (
              <span className="self-start rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-medium text-emerald-400">
                {messages.strategies.mostPopular}
              </span>
            )}

            <div>
              <h3 className={`text-xl font-bold ${s.accentText}`}>{s.name}</h3>
              {/* Spec: font-mono for numeric APY */}
              <p className="mt-1 font-mono text-3xl font-bold text-slate-50">
                {s.apy}
              </p>
              <p className="text-xs text-slate-500">{messages.strategies.apyRiskLabel.replace("{{risk}}", s.risk)}</p>
            </div>

            <p className="flex-1 text-sm leading-relaxed text-slate-400">
              {s.desc}
            </p>

            <Button variant={s.btnVariant} className="w-full">
              {messages.strategies.selectPrefix} {s.name}
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
