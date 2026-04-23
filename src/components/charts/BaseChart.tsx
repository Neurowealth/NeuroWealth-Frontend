"use client";

import { ReactNode, useMemo } from "react";
import { ResponsiveContainer } from "recharts";
import { chartDimensions, chartTheme, getResponsiveConfig } from "@/lib/chart-theme";

interface BaseChartProps {
  children: ReactNode;
  height?: number;
  className?: string;
}

export function BaseChart({ children, height = chartDimensions.height, className }: BaseChartProps) {
  const responsiveConfig = useMemo(() => getResponsiveConfig(window.innerWidth), []);

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// Custom tooltip component that matches design spec
interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name: string) => [string, string];
}

export function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div style={chartTheme.tooltip.contentStyle}>
      {label && (
        <p style={chartTheme.tooltip.labelStyle}>{label}</p>
      )}
      {payload.map((entry, index) => {
        const [formattedValue, formattedName] = formatter
          ? formatter(entry.value, entry.dataKey)
          : [entry.value, entry.name || entry.dataKey];

        return (
          <p key={index} style={chartTheme.tooltip.itemStyle}>
            <span style={{ color: entry.color }}>●</span> {formattedName}: {formattedValue}
          </p>
        );
      })}
    </div>
  );
}
