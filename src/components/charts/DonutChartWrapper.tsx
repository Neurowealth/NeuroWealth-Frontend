"use client";

import { memo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import {
  BaseChart,
  ChartTooltip,
  type ChartTooltipFormatter,
  usePrefersReducedMotion,
} from "./BaseChart";
import {
  chartTheme,
  getChartColor,
  getChartStrokeDasharray,
} from "@/lib/chart-theme";
import type { AssetAllocationSlice } from "@/lib/mock-chart-data";

interface DonutChartWrapperProps {
  data: AssetAllocationSlice[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  formatter?: ChartTooltipFormatter;
  "aria-label"?: string;
}

export const DonutChartWrapper = memo(function DonutChartWrapper({
  data,
  height,
  innerRadius = 60,
  outerRadius = 100,
  showLegend = false,
  formatter,
  "aria-label": ariaLabel,
}: DonutChartWrapperProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <BaseChart height={height} aria-label={ariaLabel}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          isAnimationActive={!prefersReducedMotion}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.tone
                  ? getChartColor(entry.tone)
                  : chartTheme.colors.primary
              }
              stroke={chartTheme.tooltip.contentStyle.backgroundColor}
              strokeDasharray={
                entry.tone
                  ? getChartStrokeDasharray(entry.tone)
                  : chartTheme.patterns.primary
              }
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {showLegend && (
          <Legend
            wrapperStyle={chartTheme.legend.wrapperStyle}
            iconType={chartTheme.legend.iconType}
          />
        )}
      </PieChart>
    </BaseChart>
  );
});
