// Spec palette: Primary #0EA5E9 (sky-500), Accent #10B981 (emerald-500)
// Page bg #0B1220, Text #F8FAFC, Muted #94A3B8
"use client";

import { HeroActions } from "./HeroActions";
import { useI18n } from "@/contexts";

export function HeroSection() {
  const { messages } = useI18n();

  return (
    <section
      id="overview"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center"
    >
      {/* Background glow — spec primary #0EA5E9 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/8 blur-[140px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="relative max-w-3xl">
        {/* Badge */}
        <span className="mb-6 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-medium tracking-wide text-sky-400">
          {messages.hero.badge}
        </span>

        {/* Headline — spec: 36px / line-height 1.4–1.6 */}
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
          {messages.hero.titleBeforeAccent}{" "}
          <span className="text-sky-400">{messages.hero.titleAccent}</span>{" "}
          {messages.hero.titleAfterAccent}
        </h1>

        {/* Sub — spec: 16px, muted #94A3B8 */}
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          {messages.hero.description}
        </p>

        {/* CTAs: Connect Wallet | Open Dashboard | Learn More */}
        <div className="mt-10">
          <HeroActions />
        </div>

        {/* Stats row — spec: font-mono for numeric text, emerald-500 accent */}
        <div className="mt-16 grid grid-cols-3 gap-6 border-t border-gray-800 pt-10">
          {messages.hero.stats.map((s) => (
            <div key={s.label}>
              {/* Spec: Roboto Mono for numeric displays */}
              <p className="font-mono text-2xl font-bold text-emerald-400">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
