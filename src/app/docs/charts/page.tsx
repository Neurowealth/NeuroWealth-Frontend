"use client";

import React, { useState } from "react";
import nextDynamic from "next/dynamic";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";

const LineChartWrapper = nextDynamic(
  () => import("@/components/charts/LineChartWrapper").then(m => ({ default: m.LineChartWrapper })),
  { loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded-xl" /> },
);

const AreaChartWrapper = nextDynamic(
  () => import("@/components/charts/AreaChartWrapper").then(m => ({ default: m.AreaChartWrapper })),
  { loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded-xl" /> },
);

const BarChartWrapper = nextDynamic(
  () => import("@/components/charts/BarChartWrapper").then(m => ({ default: m.BarChartWrapper })),
  { loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded-xl" /> },
);

const DonutChartWrapper = nextDynamic(
  () => import("@/components/charts/DonutChartWrapper").then(m => ({ default: m.DonutChartWrapper })),
  { loading: () => <div className="h-64 bg-slate-900 animate-pulse rounded-xl" /> },
);
import {
  portfolioValueData,
  monthlyYieldData,
  assetAllocationData,
  categoricalBarData,
} from "@/lib/mock-chart-data";
import { chartTheme } from "@/lib/chart-theme";

export const dynamic = "force-dynamic";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <div className="border-b border-slate-700/60 pb-3">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative mt-4 rounded-xl border border-slate-700/60 bg-slate-950/60">
      <button
        onClick={handleCopy}
        className="absolute right-3 top-3 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
        aria-label="Copy code snippet"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 pt-10 text-xs leading-relaxed text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ColorSwatch({
  name,
  value,
  usage,
}: {
  name: string;
  value: string;
  usage: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
      <div
        className="mb-3 h-10 rounded-lg"
        style={{ backgroundColor: value }}
        aria-hidden="true"
      />
      <p className="font-mono text-xs text-sky-300">{name}</p>
      <p className="mt-0.5 font-mono text-xs text-emerald-300">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{usage}</p>
    </div>
  );
}

function DoDont({
  doText,
  dontText,
}: {
  doText: string;
  dontText: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
          ✓
        </span>
        <p className="text-sm text-slate-300">{doText}</p>
      </div>
      <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
          ✕
        </span>
        <p className="text-sm text-slate-300">{dontText}</p>
      </div>
    </div>
  );
}

const chartPalette = [
  {
    name: "Primary (Sky)",
    value: chartTheme.colors.primary,
    usage: "Main data series, portfolio growth, primary KPI lines; solid stroke",
  },
  {
    name: "Accent (Orange)",
    value: chartTheme.colors.accent,
    usage: "Secondary series, yield/return bars, comparison lines; dashed stroke",
  },
  {
    name: "Warning (Magenta)",
    value: chartTheme.colors.warning,
    usage: "Third data series, benchmark overlays, neutral metrics; dotted stroke",
  },
  {
    name: "Neutral Strong",
    value: chartTheme.colors["neutral-strong"],
    usage: "Suppressed data, inactive slices, low-emphasis fills; long dash",
  },
];

const navItems = [
  { id: "palette", label: "Palette" },
  { id: "line", label: "Line Chart" },
  { id: "area", label: "Area Chart" },
  { id: "bar", label: "Bar Chart" },
  { id: "donut", label: "Donut Chart" },
  { id: "rules", label: "Do / Don't" },
];

export default function ChartStyleGuidePage() {
  return (
    <main
      id={MAIN_CONTENT_LANDMARK_ID}
      tabIndex={-1}
      className="min-h-screen bg-[linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4 py-12 md:px-8"
    >
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <header>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-sky-400">
            Design System
          </p>
          <h1 className="text-3xl font-bold text-slate-50">
            Chart Style Guide
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-400">
            Reusable chart wrappers and visual standards for consistent data
            visualisation across NeuroWealth. All charts use CVD-safe colour
            palettes and respond to mobile viewports.
          </p>

          {/* Nav */}
          <nav
            aria-label="Chart style guide sections"
            className="mt-6 flex flex-wrap gap-2"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-sky-500/40 hover:text-sky-300"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        {/* Palette */}
        <Section
          id="palette"
          title="Approved Chart Palette"
          description="All charts must use tokens from this palette. The set is CVD-tested for deuteranopia, protanopia, and tritanopia, and meets WCAG AA graphics contrast on dark and light chart backgrounds."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {chartPalette.map((swatch) => (
              <ColorSwatch key={swatch.name} {...swatch} />
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 text-sm text-slate-300">
            <strong className="text-sky-300">Accessibility note:</strong> Never
            rely on colour alone to convey meaning. Pair with labels, patterns,
            or ARIA attributes so the chart is usable for colour-blind users and
            screen-reader users alike.
          </div>
        </Section>

        {/* Line Chart */}
        <Section
          id="line"
          title="Line Chart"
          description="Use LineChartWrapper for continuous time-series data such as portfolio value over months. Dots are hidden by default to reduce noise on dense series."
        >
          <div className="rounded-xl border border-slate-700/60 bg-dark-800/60 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Portfolio Value — 12 Months (mock)
            </p>
            <LineChartWrapper
              data={portfolioValueData}
              dataKey="value"
              xAxisKey="name"
              height={260}
              showGrid
              color={chartTheme.colors.primary}
              formatter={(v: React.ReactNode) => [`$${Number(v).toLocaleString()}`, "Value"]}
            />
          </div>
          <CodeBlock
            code={`import { LineChartWrapper } from "@/components/charts";
import { generatePortfolioValueData } from "@/lib/mock-chart-data";
import { chartTheme } from "@/lib/chart-theme";

<LineChartWrapper
  data={generatePortfolioValueData()}
  dataKey="value"
  xAxisKey="name"
  height={260}
  showGrid
  color={chartTheme.colors.primary}
  formatter={(v) => [\`$\${Number(v).toLocaleString()}\`, "Value"]}
/>`}
          />
          <div className="mt-3 rounded-lg border border-slate-700/40 bg-slate-900/40 p-3 text-xs text-slate-400">
            Axis labels render at minimum <strong className="text-slate-300">12 px</strong> and are readable on mobile. Tooltip surface uses{" "}
            <code className="text-sky-300">#111827</code> background with{" "}
            <code className="text-sky-300">#1F2937</code> border as specified.
          </div>
        </Section>

        {/* Area Chart */}
        <Section
          id="area"
          title="Area Chart"
          description="Use AreaChartWrapper when the volume under the curve matters — e.g. cumulative yield. The fill uses a gradient fade to avoid visual weight competing with the line."
        >
          <div className="rounded-xl border border-slate-700/60 bg-dark-800/60 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Cumulative Portfolio — 12 Months (mock)
            </p>
            <AreaChartWrapper
              data={portfolioValueData}
              dataKey="value"
              xAxisKey="name"
              height={260}
              color={chartTheme.colors.primary}
              formatter={(v: React.ReactNode) => [`$${Number(v).toLocaleString()}`, "Portfolio"]}
            />
          </div>
          <CodeBlock
            code={`import { AreaChartWrapper } from "@/components/charts";
import { generatePortfolioValueData } from "@/lib/mock-chart-data";
import { chartTheme } from "@/lib/chart-theme";

<AreaChartWrapper
  data={generatePortfolioValueData()}
  dataKey="value"
  xAxisKey="name"
  height={260}
  color={chartTheme.colors.primary}
  formatter={(v) => [\`$\${Number(v).toLocaleString()}\`, "Portfolio"]}
/>`}
          />
        </Section>

        {/* Bar Chart */}
        <Section
          id="bar"
          title="Bar Chart"
          description="Use BarChartWrapper for categorical comparisons — monthly yield, deposits vs withdrawals. Bars use accent orange so they are visually distinct from line/area charts on the same page."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-700/60 bg-dark-800/60 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Monthly Yield (mock)
              </p>
              <BarChartWrapper
                data={monthlyYieldData}
                dataKey="value"
                xAxisKey="name"
                height={220}
                color={chartTheme.colors.accent}
                strokeDasharray={chartTheme.patterns.accent}
                formatter={(v: React.ReactNode) => [`$${Number(v).toLocaleString()}`, "Yield"]}
              />
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-dark-800/60 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Transaction Breakdown (mock)
              </p>
              <BarChartWrapper
                data={categoricalBarData}
                dataKey="value"
                xAxisKey="name"
                height={220}
                color={chartTheme.colors.warning}
                strokeDasharray={chartTheme.patterns.warning}
                formatter={(v: React.ReactNode) => [`$${Number(v).toLocaleString()}`, "Amount"]}
              />
            </div>
          </div>
          <CodeBlock
            code={`import { BarChartWrapper } from "@/components/charts";
import { generateMonthlyYieldData } from "@/lib/mock-chart-data";
import { chartTheme } from "@/lib/chart-theme";

<BarChartWrapper
  data={generateMonthlyYieldData()}
  dataKey="value"
  xAxisKey="name"
  height={220}
  color={chartTheme.colors.accent}
  strokeDasharray={chartTheme.patterns.accent}
  formatter={(v) => [\`$\${Number(v).toLocaleString()}\`, "Yield"]}
/>`}
          />
        </Section>

        {/* Donut Chart */}
        <Section
          id="donut"
          title="Donut Chart"
          description="Use DonutChartWrapper for part-to-whole relationships like asset allocation. Each slice maps to an approved palette token; never introduce custom colours outside the chart palette."
        >
          <div className="flex justify-center">
            <div className="w-full max-w-sm rounded-xl border border-slate-700/60 bg-dark-800/60 p-5">
              <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                Asset Allocation (mock)
              </p>
              <DonutChartWrapper
                data={assetAllocationData}
                height={260}
                showLegend
              />
            </div>
          </div>
          <CodeBlock
            code={`import { DonutChartWrapper } from "@/components/charts";
import { generateAssetAllocationData } from "@/lib/mock-chart-data";

<DonutChartWrapper
  data={generateAssetAllocationData()}
  height={260}
  showLegend
/>`}
          />
          <div className="mt-3 rounded-lg border border-slate-700/40 bg-slate-900/40 p-3 text-xs text-slate-400">
            Each donut slice maps a <code className="text-sky-300">tone</code>{" "}
            field to an approved palette colour and a redundant stroke pattern.
            The legend renders below the chart on mobile and to the right on
            desktop automatically.
          </div>
        </Section>

        {/* Do / Don't */}
        <Section
          id="rules"
          title="Do / Don't"
          description="Common mistakes that cause visual inconsistency. Follow these rules to keep charts coherent across pages."
        >
          <div className="space-y-4">
            <DoDont
              doText="Use approved palette tokens (primary, accent, warning, neutral-strong). Colours are tested for CVD distance and chart contrast."
              dontText="Introduce custom hex colours outside the chart palette — this breaks CVD guarantees and visual consistency."
            />
            <DoDont
              doText="Pair colour with a text label, legend entry, and stroke pattern where the wrapper supports it."
              dontText="Use colour as the only differentiator between series. Simulated CVD checks can still miss unlabeled intent."
            />
            <DoDont
              doText="Keep axis labels at least 12 px and use the axis.fill token (#64748b) so labels are readable on dark backgrounds."
              dontText="Reduce axis font size below 12 px or use white text directly on saturated background fills."
            />
            <DoDont
              doText="Use the ChartTooltip component inside each wrapper. It enforces the #111827 surface and #1F2937 border specification."
              dontText="Override tooltip styles inline — this risks breaking the design spec tooltip on updates."
            />
            <DoDont
              doText="Wrap every chart in BaseChart (or use a provided wrapper). It handles ResponsiveContainer, motion prefs, and mobile breakpoints."
              dontText="Render Recharts components directly without BaseChart — you lose mobile sizing, reduced-motion, and consistent margins."
            />
          </div>
        </Section>
      </div>
    </main>
  );
}
