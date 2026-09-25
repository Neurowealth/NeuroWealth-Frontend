"use client";

import {
  AreaChart,
  Area,
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

interface AreaChartWrapperProps<T extends ChartDatum> {
  data: T[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  fillOpacity?: number;
  color?: string;
  formatter?: ChartTooltipFormatter;
  "aria-label"?: string;
}

export function AreaChartWrapper<T extends ChartDatum = ChartDatum>({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height,
  showGrid = true,
  showLegend = false,
  fillOpacity = 0.3,
  color = chartTheme.colors.primary,
  formatter,
  "aria-label": ariaLabel,
}: AreaChartWrapperProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <BaseChart height={height} aria-label={ariaLabel}>
      <AreaChart data={data} margin={chartDimensions.margin}>
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
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={fillOpacity}
          strokeWidth={2}
          isAnimationActive={!prefersReducedMotion}
        />
      </AreaChart>
    </BaseChart>
  );
}
