"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  BaseChart,
  ChartTooltip,
  type ChartTooltipFormatter,
  usePrefersReducedMotion,
} from "./BaseChart";
import { chartTheme, chartDimensions } from "@/lib/chart-theme";
import type { ChartDatum } from "@/lib/mock-chart-data";

interface BarChartWrapperProps<T extends ChartDatum> {
  data: T[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  color?: string;
  strokeDasharray?: string;
  barSize?: number;
  formatter?: ChartTooltipFormatter;
  "aria-label"?: string;
}

export function BarChartWrapper<T extends ChartDatum = ChartDatum>({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height,
  showGrid = true,
  showLegend = false,
  color = chartTheme.colors.primary,
  strokeDasharray = chartTheme.patterns.primary,
  barSize,
  formatter,
  "aria-label": ariaLabel,
}: BarChartWrapperProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <BaseChart height={height} aria-label={ariaLabel}>
      <BarChart
        data={data}
        margin={chartDimensions.margin}
        barCategoryGap="20%"
      >
        {showGrid && (
          <CartesianGrid
            stroke={chartTheme.grid.stroke}
            strokeDasharray={chartTheme.grid.strokeDasharray}
            strokeOpacity={chartTheme.grid.strokeOpacity}
          />
        )}
        <XAxis
          dataKey={xAxisKey}
          axisLine={chartTheme.axis.axisLine}
          tickLine={chartTheme.axis.tickLine}
          tick={{
            fontSize: chartTheme.axis.fontSize,
            fill: chartTheme.axis.fill,
          }}
        />
        <YAxis
          axisLine={chartTheme.axis.axisLine}
          tickLine={chartTheme.axis.tickLine}
          tick={{
            fontSize: chartTheme.axis.fontSize,
            fill: chartTheme.axis.fill,
          }}
        />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {showLegend && (
          <Legend
            wrapperStyle={chartTheme.legend.wrapperStyle}
            iconType={chartTheme.legend.iconType}
          />
        )}
        <Bar
          dataKey={dataKey}
          fill={color}
          stroke={color}
          strokeDasharray={strokeDasharray}
          radius={[4, 4, 0, 0]}
          barSize={barSize}
          isAnimationActive={!prefersReducedMotion}
        />
      </BarChart>
    </BaseChart>
  );
}
