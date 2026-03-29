"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/contexts";

export function CtaSection() {
  const { messages } = useI18n();

  return (
    <section className="relative overflow-hidden py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-100 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/6 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <span className="inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
          {messages.cta.badge}
        </span>

        {/* Spec: 36px heading */}
        <h2 className="mt-5 text-4xl font-bold leading-tight text-slate-50 md:text-5xl">
          {messages.cta.title}
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-400">
          {messages.cta.description}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {/* CTA: Connect Wallet (primary) */}
          <Link href="#overview">
            <Button size="lg">{messages.cta.connectWallet}</Button>
          </Link>

          {/* CTA: Open Dashboard (secondary) */}
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              {messages.cta.openDashboard}
            </Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          {messages.cta.trust.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
