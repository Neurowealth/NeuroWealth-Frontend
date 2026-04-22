"use client";

import { useI18n } from "@/contexts/I18nContext";
import { Button, Card, FormattedValue, InlineBanner } from "@/components/ui";

const samples = [
  {
    label: "Treasury balance",
    description: "Default currency precision with a full-precision tooltip.",
    value: 1245820.443281,
    kind: "currency" as const,
  },
  {
    label: "Net strategy delta",
    description: "Signed values surface positive and negative movement clearly.",
    value: -4821.3498,
    kind: "currency" as const,
    signed: true,
  },
  {
    label: "Live APY",
    description: "Percent values keep 2 to 4 decimals for rate-sensitive widgets.",
    value: 6.4287,
    kind: "percent" as const,
    signed: true,
  },
  {
    label: "Volume snapshot",
    description: "Compact formatting helps overview widgets stay scan-friendly.",
    value: 9450000,
    kind: "compact" as const,
  },
];

export default function FormattingPage() {
  const { locale, setLocale } = useI18n();

  return (
    <main className="space-y-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
          Issue #93
        </p>
        <h1 className="text-3xl font-bold text-slate-50">
          Number and currency formatting helpers
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          Locale-aware mock formatting utilities with compact, currency, number,
          and percent helpers plus full-precision tooltips for finance-heavy UI.
        </p>
      </div>

      <InlineBanner
        variant="info"
        eyebrow="Locale Preview"
        title="Switching locale should not break numeric readability"
      >
        This page lets the team validate formatting behavior before wiring the
        same helpers into dashboard widgets.
      </InlineBanner>

      <Card className="flex flex-wrap items-center gap-3 border-slate-700/50 bg-dark-800/70">
        <span className="text-sm font-medium text-slate-300">Locale preview</span>
        <Button
          onClick={() => setLocale("en")}
          size="sm"
          variant={locale === "en" ? "primary" : "secondary"}
        >
          English
        </Button>
        <Button
          onClick={() => setLocale("fr")}
          size="sm"
          variant={locale === "fr" ? "primary" : "secondary"}
        >
          French
        </Button>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {samples.map((sample) => (
          <Card key={sample.label} className="space-y-3 border-slate-700/50 bg-dark-800/70">
            <div>
              <p className="text-sm text-slate-400">{sample.label}</p>
              <p className="mt-1 text-2xl font-semibold">
                <FormattedValue
                  kind={sample.kind}
                  label={sample.label}
                  signed={sample.signed}
                  value={sample.value}
                />
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-400">{sample.description}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-3 border-slate-700/50 bg-dark-800/70">
        <h2 className="text-lg font-semibold text-slate-100">Helper usage</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Portfolio summary
            </p>
            <p className="mt-2 text-xl font-semibold">
              <FormattedValue kind="currency" label="Portfolio summary total" value={682450.118} />
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Yield widget
            </p>
            <p className="mt-2 text-xl font-semibold">
              <FormattedValue kind="percent" label="Yield widget APY" value={5.7421} />
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Volume card
            </p>
            <p className="mt-2 text-xl font-semibold">
              <FormattedValue kind="compact" label="Volume card total" value={19450000} />
            </p>
          </div>
        </div>
      </Card>
    </main>
  );
}
