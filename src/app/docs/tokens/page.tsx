const colorTokens = [
  {
    name: "--color-dark-900",
    value: "#020617",
    usage: "Primary app background and deep surfaces",
    sample: "#020617",
    lightText: "#E2E8F0",
  },
  {
    name: "--color-dark-800",
    value: "#0F172A",
    usage: "Secondary panels and elevated dark containers",
    sample: "#0F172A",
    lightText: "#E2E8F0",
  },
  {
    name: "--color-dark-700",
    value: "#1E293B",
    usage: "Card surfaces and subtle dark layer separation",
    sample: "#1E293B",
    lightText: "#E2E8F0",
  },
  {
    name: "--color-brand-400",
    value: "#38BDF8",
    usage: "Brand highlights, links, and key interactive accents",
    sample: "#38BDF8",
    lightText: "#0F172A",
  },
  {
    name: "--positive",
    value: "#10B981",
    usage: "Success states, positive performance, confirmations",
    sample: "#10B981",
    lightText: "#052E2B",
  },
  {
    name: "--negative",
    value: "#EF4444",
    usage: "Error states, destructive actions, validation failures",
    sample: "#EF4444",
    lightText: "#3F0A0A",
  },
  {
    name: "--neutral",
    value: "#94A3B8",
    usage: "Muted text, helper copy, secondary iconography",
    sample: "#94A3B8",
    lightText: "#0F172A",
  },
  {
    name: "--chart-primary",
    value: "#0F766E",
    usage: "Primary series in chart visualizations",
    sample: "#0F766E",
    lightText: "#E2E8F0",
  },
  {
    name: "--chart-accent",
    value: "#38BDF8",
    usage: "Chart highlights and active data points",
    sample: "#38BDF8",
    lightText: "#0F172A",
  },
  {
    name: "--chart-warning",
    value: "#F59E0B",
    usage: "Warning thresholds and caution data overlays",
    sample: "#F59E0B",
    lightText: "#1F1301",
  },
  {
    name: "--skeleton-base",
    value: "rgba(148, 163, 184, 0.10)",
    usage: "Base fill color for loading placeholders",
    sample: "rgba(148, 163, 184, 0.10)",
    lightText: "#0F172A",
  },
  {
    name: "--skeleton-shine",
    value: "rgba(148, 163, 184, 0.24)",
    usage: "Animated shimmer highlight for skeleton states",
    sample: "rgba(148, 163, 184, 0.24)",
    lightText: "#0F172A",
  },
];

const typographyTokens = [
  {
    name: "--font-sans",
    value:
      'Inter, "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
    usage: "Default UI text, forms, labels, and application copy",
  },
  {
    name: "--font-mono",
    value:
      '"IBM Plex Mono", "SFMono-Regular", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    usage: "Numeric metrics, code snippets, and technical values",
  },
  {
    name: "text-xs",
    value: "12px / 16px",
    usage: "Metadata, helper text, tertiary hints",
  },
  {
    name: "text-sm",
    value: "14px / 20px",
    usage: "Body copy in forms, cards, and tables",
  },
  {
    name: "text-base",
    value: "16px / 24px",
    usage: "Default paragraph and readable descriptive text",
  },
  {
    name: "text-lg",
    value: "18px / 28px",
    usage: "Section subheadings and compact feature titles",
  },
  {
    name: "text-2xl",
    value: "24px / 32px",
    usage: "Page-level headings and key summary titles",
  },
];

const spacingTokens = [
  { name: "space-1", value: "4px", usage: "Micro spacing between icons and labels" },
  { name: "space-2", value: "8px", usage: "Tight spacing in compact controls" },
  { name: "space-3", value: "12px", usage: "Field group spacing and inline sections" },
  { name: "space-4", value: "16px", usage: "Default block spacing in cards" },
  { name: "space-5", value: "20px", usage: "Panel internals and section breathing room" },
  { name: "space-6", value: "24px", usage: "Card padding and major section gaps" },
  { name: "space-8", value: "32px", usage: "Page-level vertical rhythm and large gaps" },
];

const shadowTokens = [
  {
    name: "--shadow-card",
    value: "0 8px 30px rgba(2, 6, 23, 0.35)",
    usage: "Default card elevation on dark surfaces",
  },
  {
    name: "shadow-sm",
    value: "0 1px 2px rgba(0,0,0,0.05)",
    usage: "Subtle elevation for low-emphasis surfaces",
  },
  {
    name: "shadow-lg",
    value: "0 10px 15px rgba(0,0,0,0.10)",
    usage: "Important overlays and interactive prominence",
  },
  {
    name: "settings-action-elevation",
    value: "0 8px 32px rgba(0,0,0,0.50)",
    usage: "Sticky action bars and high-priority floating controls",
  },
];

const radiusTokens = [
  { name: "--skeleton-radius-default", value: "6px", usage: "Default skeleton primitive rounding" },
  { name: "radius-sm", value: "8px", usage: "Inputs, pills, and compact controls" },
  { name: "radius-md", value: "10px", usage: "Buttons and medium interactive elements" },
  { name: "radius-lg", value: "12px", usage: "Cards, table shells, and panels" },
  { name: "radius-xl", value: "16px", usage: "Modals and elevated overlays" },
  { name: "radius-2xl", value: "20px", usage: "Onboarding cards and hero containers" },
  { name: "radius-3xl", value: "24px", usage: "Large dashboard surfaces and premium containers" },
  { name: "radius-full", value: "9999px", usage: "Badges, chips, and circular controls" },
];

const codeSnippets = {
  color: `// Use semantic token classes for consistency\n<button className="bg-sky-500 hover:bg-sky-400 text-white">Primary Action</button>\n<p className="text-slate-400">Secondary helper text</p>`,
  typography: `// Prefer tokenized typography roles\n<h2 className="text-2xl font-bold text-slate-50">Section Title</h2>\n<p className="text-sm text-slate-400">Supportive context copy</p>`,
  spacing: `// Compose layouts with spacing scale\n<div className="p-6 space-y-4">\n  <h3 className="text-lg">Card heading</h3>\n  <p className="text-sm">Body content</p>\n</div>`,
  surface: `// Keep elevation + radius paired\n<div className="rounded-xl border border-slate-700/40 bg-dark-800 shadow-card p-6">\n  Elevated content\n</div>`,
};

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-2xl border border-slate-700/40 bg-dark-800/70 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-50">{title}</h2>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </div>
      {children}
    </section>
  );
}

function TokenTable({
  rows,
}: {
  rows: Array<{ name: string; value: string; usage: string }>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-left" style={{ minWidth: 720 }}>
        <thead className="bg-slate-900/70">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">Token</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">Value</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">Usage Context</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-slate-700/50">
              <td className="px-4 py-3 font-mono text-xs text-sky-300">{row.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-emerald-300">{row.value}</td>
              <td className="px-4 py-3 text-sm text-slate-200">{row.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DoDont({
  doTitle,
  doBody,
  dontTitle,
  dontBody,
}: {
  doTitle: string;
  doBody: string;
  dontTitle: string;
  dontBody: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <p className="text-sm font-semibold text-emerald-300">✅ Do: {doTitle}</p>
        <p className="mt-1 text-sm text-emerald-100/90">{doBody}</p>
      </div>
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-sm font-semibold text-red-300">❌ Don&apos;t: {dontTitle}</p>
        <p className="mt-1 text-sm text-red-100/90">{dontBody}</p>
      </div>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-950/80">
      <p className="border-b border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
        {title}
      </p>
      <pre className="overflow-x-auto p-4 text-xs text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function LightDarkPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-300 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Light Surface Example</p>
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Portfolio summary</p>
          <p className="mt-1 text-sm text-slate-600">Use dark text on light backgrounds for readable contrast.</p>
          <button className="mt-3 rounded-md bg-sky-500 px-3 py-2 text-xs font-semibold text-white">Primary Action</button>
        </div>
      </div>
      <div className="rounded-xl border border-slate-700 bg-dark-900 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dark Surface Example</p>
        <div className="mt-3 rounded-lg border border-slate-700 bg-dark-800 p-4 shadow-card">
          <p className="text-sm font-semibold text-slate-50">Portfolio summary</p>
          <p className="mt-1 text-sm text-slate-300">Use light text and semantic accents on dark backgrounds.</p>
          <button className="mt-3 rounded-md bg-sky-500 px-3 py-2 text-xs font-semibold text-white">Primary Action</button>
        </div>
      </div>
    </div>
  );
}

export default function DesignTokensDocsPage() {
  return (
    <main className="min-h-screen bg-dark-900 px-4 py-8 text-slate-100 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="rounded-2xl border border-slate-700/40 bg-dark-800/70 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Design System</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-50 md:text-4xl">Token Documentation</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
            Canonical tokens for colors, typography, spacing, shadows, and radii. Every token lists name, value, and intended usage to keep implementation consistent across features.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["colors", "Colors"],
              ["typography", "Typography"],
              ["spacing", "Spacing"],
              ["shadows", "Shadows"],
              ["radii", "Radii"],
              ["misuse", "Do / Don’t"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
              >
                {label}
              </a>
            ))}
          </div>
        </header>

        <Section
          id="colors"
          title="Color Tokens"
          description="Semantic color tokens and where they should be used. Includes accessibility guidance and light/dark examples."
        >
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {colorTokens.map((token) => (
              <article key={token.name} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4">
                <div
                  className="h-12 w-full rounded-lg border border-slate-600/40"
                  style={{ background: token.sample }}
                  aria-label={`${token.name} swatch`}
                />
                <p className="mt-3 font-mono text-xs text-sky-300">{token.name}</p>
                <p className="mt-1 font-mono text-xs text-emerald-300">{token.value}</p>
                <p className="mt-2 text-xs text-slate-300">{token.usage}</p>
              </article>
            ))}
          </div>

          <TokenTable rows={colorTokens.map(({ name, value, usage }) => ({ name, value, usage }))} />

          <div className="mt-6">
            <LightDarkPreview />
          </div>

          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-300">Accessibility Notes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100/90">
              <li>Maintain at least 4.5:1 contrast for regular text and 3:1 for large text.</li>
              <li>Never use color alone to communicate state; pair with iconography or text labels.</li>
              <li>Reserve `--positive` and `--negative` for semantic meaning, not decorative accents.</li>
            </ul>
          </div>

          <div className="mt-6">
            <CodeBlock title="Color Usage Snippet" code={codeSnippets.color} />
          </div>
        </Section>

        <Section
          id="typography"
          title="Typography Tokens"
          description="Font families and size roles for readable hierarchy in UI and product copy."
        >
          <TokenTable rows={typographyTokens} />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
              <p className="font-mono text-xs text-slate-400">Sans Preview (`--font-sans`)</p>
              <p className="mt-2 text-2xl font-bold text-slate-50">Dashboard Overview</p>
              <p className="mt-2 text-sm text-slate-300">Readable UI text with clear information hierarchy.</p>
            </div>
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
              <p className="font-mono text-xs text-slate-400">Mono Preview (`--font-mono`)</p>
              <p className="mt-2 font-mono text-2xl font-bold text-emerald-300">+8.42% APY</p>
              <p className="mt-2 font-mono text-sm text-slate-300">Used for technical and numeric values.</p>
            </div>
          </div>

          <div className="mt-6">
            <CodeBlock title="Typography Usage Snippet" code={codeSnippets.typography} />
          </div>
        </Section>

        <Section
          id="spacing"
          title="Spacing Tokens"
          description="Spacing scale to keep layout rhythm consistent across cards, sections, and controls."
        >
          <TokenTable rows={spacingTokens} />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
              <p className="text-sm font-semibold text-slate-200">Visual Spacing Scale</p>
              <div className="mt-4 space-y-3">
                {spacingTokens.map((token) => (
                  <div key={token.name} className="flex items-center gap-3">
                    <div className="font-mono text-xs text-sky-300" style={{ minWidth: 70 }}>{token.name}</div>
                    <div className="h-3 rounded bg-sky-500/70" style={{ width: token.value }} />
                    <div className="font-mono text-xs text-slate-300">{token.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <CodeBlock title="Spacing Usage Snippet" code={codeSnippets.spacing} />
          </div>
        </Section>

        <Section
          id="shadows"
          title="Shadow Tokens"
          description="Elevation tokens for depth hierarchy. Pair with radii and borders for cleaner surfaces."
        >
          <TokenTable rows={shadowTokens} />

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-dark-800 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-100">Subtle</p>
              <p className="mt-1 text-xs text-slate-300">Low emphasis content containers.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-dark-800 p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <p className="text-sm font-semibold text-slate-100">Card</p>
              <p className="mt-1 text-xs text-slate-300">Standard dashboard card elevation.</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-dark-800 p-5" style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)" }}>
              <p className="text-sm font-semibold text-slate-100">Floating Action</p>
              <p className="mt-1 text-xs text-slate-300">Sticky and high-priority action surfaces.</p>
            </div>
          </div>

          <div className="mt-6">
            <CodeBlock title="Elevation Usage Snippet" code={codeSnippets.surface} />
          </div>
        </Section>

        <Section
          id="radii"
          title="Radius Tokens"
          description="Corner-radius scale for consistency from small controls to large containers."
        >
          <TokenTable rows={radiusTokens} />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {radiusTokens.map((token) => (
              <div key={token.name} className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
                <div
                  className="h-14 border border-slate-500/50 bg-dark-700"
                  style={{ borderRadius: token.value === "radius-full" ? "9999px" : token.value }}
                />
                <p className="mt-3 font-mono text-xs text-sky-300">{token.name}</p>
                <p className="mt-1 font-mono text-xs text-emerald-300">{token.value}</p>
                <p className="mt-2 text-xs text-slate-300">{token.usage}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="misuse"
          title="Common Do / Don’t Patterns"
          description="Common implementation mistakes and correct usage patterns to prevent design drift."
        >
          <div className="space-y-4">
            <DoDont
              doTitle="Use semantic state colors"
              doBody="Use `--positive`/`--negative` only for success and failure states so meaning stays consistent for users."
              dontTitle="Use success red/green interchangeably"
              dontBody="Avoid arbitrary color swaps that break user expectations and increase cognitive load."
            />
            <DoDont
              doTitle="Use readable contrast on all surfaces"
              doBody="Pair light text with dark surfaces and dark text with light surfaces; validate with contrast checks."
              dontTitle="Place low-contrast text on tinted panels"
              dontBody="Muted text over low-opacity backgrounds can fail WCAG and become unreadable under glare."
            />
            <DoDont
              doTitle="Reuse spacing and radius scale"
              doBody="Stick to documented values (4, 8, 12, 16, 20, 24, 32) and radius scale for predictable rhythm."
              dontTitle="Hard-code random pixel values"
              dontBody="Avoid one-off values like 13px/19px that create inconsistent alignments and brittle UI."
            />
            <DoDont
              doTitle="Pair elevation with hierarchy"
              doBody="Reserve stronger shadows for overlays and floating controls to preserve depth meaning."
              dontTitle="Apply heavy shadows everywhere"
              dontBody="Overusing strong shadows flattens hierarchy and makes important elements harder to identify."
            />
          </div>
        </Section>
      </div>
    </main>
  );
}
