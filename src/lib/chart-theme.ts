import { ChartTone } from "@/lib/portfolio";

// Chart theme configuration
export const chartTheme = {
  // Color palette using approved tokens
  colors: {
    primary: "var(--chart-primary)",
    accent: "var(--chart-accent)",
    warning: "var(--chart-warning)",
    "neutral-strong": "var(--chart-neutral-strong)",
    "neutral-soft": "var(--chart-neutral-soft)",
  } as Record<ChartTone, string>,

  // Grid configuration
  grid: {
    stroke: "#e2e8f0", // neutral-200
    strokeDasharray: "0",
    strokeOpacity: 0.3,
  },

  // Axis configuration
  axis: {
    fontSize: 12,
    fontFamily: "var(--font-sans)",
    fill: "#64748b", // slate-500
    tickLine: false,
    axisLine: false,
  },

  // Tooltip configuration
  tooltip: {
    contentStyle: {
      backgroundColor: "#111827", // gray-900
      border: "1px solid #1f2937", // gray-800
      borderRadius: "8px",
      fontSize: "12px",
      fontFamily: "var(--font-sans)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    labelStyle: {
      color: "#f1f5f9", // slate-100
      fontWeight: 600,
    },
    itemStyle: {
      color: "#e2e8f0", // slate-200
    },
  },

  // Legend configuration
  legend: {
    wrapperStyle: {
      fontSize: "12px",
      fontFamily: "var(--font-sans)",
      color: "#64748b", // slate-500
    },
    iconType: "circle" as const,
  },

  // Responsive breakpoints
  responsive: {
    mobile: { maxWidth: 768 },
    tablet: { minWidth: 769, maxWidth: 1024 },
    desktop: { minWidth: 1025 },
  },
};

// Common chart dimensions
export const chartDimensions = {
  height: 300,
  margin: {
    top: 20,
    right: 30,
    bottom: 20,
    left: 20,
  },
};

// Utility function to get chart color by tone
export function getChartColor(tone: ChartTone): string {
  return chartTheme.colors[tone];
}

// Utility function to get responsive chart config
export function getResponsiveConfig(width: number) {
  if (width <= chartTheme.responsive.mobile.maxWidth) {
    return {
      fontSize: 10,
      showLegend: false,
      margin: { top: 15, right: 15, bottom: 15, left: 15 },
    };
  }

  return {
    fontSize: 12,
    showLegend: true,
    margin: chartDimensions.margin,
  };
}
