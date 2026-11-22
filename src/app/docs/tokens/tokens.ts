export interface ColorToken {
  name: string;
  value: string;
  usage: string;
  sample: string;
  lightText: string;
}

export interface TokenEntry {
  name: string;
  value: string;
  usage: string;
}

export const colorTokens: ColorToken[] = [
  {
    name: "--color-dark-900",
    value: "#0b1220",
    usage: "Primary app background and deep surfaces",
    sample: "#0b1220",
    lightText: "#E2E8F0",
  },
  {
    name: "--color-dark-800",
    value: "#0f172a",
    usage: "Secondary panels and elevated dark containers",
    sample: "#0f172a",
    lightText: "#E2E8F0",
  },
  {
    name: "--color-dark-700",
    value: "#1e293b",
    usage: "Card surfaces and subtle dark layer separation",
    sample: "#1e293b",
    lightText: "#E2E8F0",
  },
  {
    name: "--color-brand-400",
    value: "#38bdf8",
    usage: "Brand highlights, links, and key interactive accents",
    sample: "#38bdf8",
    lightText: "#0F172A",
  },
  {
    name: "--positive",
    value: "#10b981",
    usage: "Success states, positive performance, confirmations",
    sample: "#10b981",
    lightText: "#052E2B",
  },
  {
    name: "--negative",
    value: "#ef4444",
    usage: "Error states, destructive actions, validation failures",
    sample: "#ef4444",
    lightText: "#3F0A0A",
  },
  {
    name: "--neutral",
    value: "#94a3b8",
    usage: "Muted text, helper copy, secondary iconography",
    sample: "#94a3b8",
    lightText: "#0F172A",
  },
  {
    name: "--chart-primary",
    value: "#0284c7",
    usage: "Primary series in chart visualizations",
    sample: "#0284c7",
    lightText: "#E2E8F0",
  },
  {
    name: "--chart-accent",
    value: "#d55e00",
    usage: "Chart highlights and active data points",
    sample: "#d55e00",
    lightText: "#E2E8F0",
  },
  {
    name: "--chart-warning",
    value: "#cc79a7",
    usage: "Warning thresholds and caution data overlays",
    sample: "#cc79a7",
    lightText: "#1F1301",
  },
  {
    name: "--skeleton-base",
    value: "rgba(30, 41, 59, 0.85)",
    usage: "Base fill color for loading placeholders",
    sample: "rgba(30, 41, 59, 0.85)",
    lightText: "#E2E8F0",
  },
  {
    name: "--skeleton-shine",
    value: "rgba(71, 85, 105, 0.55)",
    usage: "Animated shimmer highlight for skeleton states",
    sample: "rgba(71, 85, 105, 0.55)",
    lightText: "#E2E8F0",
  },
];

export const typographyTokens: TokenEntry[] = [
  {
    name: "--font-sans",
    value:
      'Inter, "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
    usage: "Default UI text, forms, labels, and application copy",
  },
  {
    name: "--font-mono",
    value:
      '"Roboto Mono", "IBM Plex Mono", "SFMono-Regular", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
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

export const spacingTokens: TokenEntry[] = [
  { name: "space-1", value: "4px", usage: "Micro spacing between icons and labels" },
  { name: "space-2", value: "8px", usage: "Tight spacing in compact controls" },
  { name: "space-3", value: "12px", usage: "Field group spacing and inline sections" },
  { name: "space-4", value: "16px", usage: "Default block spacing in cards" },
  { name: "space-5", value: "20px", usage: "Panel internals and section breathing room" },
  { name: "space-6", value: "24px", usage: "Card padding and major section gaps" },
  { name: "space-8", value: "32px", usage: "Page-level vertical rhythm and large gaps" },
];

export const shadowTokens: TokenEntry[] = [
  {
    name: "--shadow-card",
    value: "0 1px 2px rgb(0 0 0 / 0.2)",
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

export const radiusTokens: TokenEntry[] = [
  { name: "--skeleton-radius-default", value: "6px", usage: "Default skeleton primitive rounding" },
  { name: "radius-sm", value: "8px", usage: "Inputs, pills, and compact controls" },
  { name: "radius-md", value: "10px", usage: "Buttons and medium interactive elements" },
  { name: "radius-lg", value: "12px", usage: "Cards, table shells, and panels" },
  { name: "radius-xl", value: "16px", usage: "Modals and elevated overlays" },
  { name: "radius-2xl", value: "20px", usage: "Onboarding cards and hero containers" },
  { name: "radius-3xl", value: "24px", usage: "Large dashboard surfaces and premium containers" },
  { name: "radius-full", value: "9999px", usage: "Badges, chips, and circular controls" },
];
