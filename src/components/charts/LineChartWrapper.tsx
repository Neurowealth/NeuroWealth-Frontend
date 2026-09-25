"use client";

import {
  LineChart,
  Line,
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

interface LineChartWrapperProps<T extends ChartDatum> {
  data: T[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean | object;
  formatter?: ChartTooltipFormatter;
  "aria-label"?: string;
}

export function LineChartWrapper<T extends ChartDatum = ChartDatum>({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height,
  showGrid = true,
  showLegend = false,
  color = chartTheme.colors.primary,
  strokeWidth = 2,
  strokeDasharray = chartTheme.patterns.primary,
  dot = false,
  formatter,
  "aria-label": ariaLabel,
}: LineChartWrapperProps<T>) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <BaseChart height={height} aria-label={ariaLabel}>
      <LineChart data={data} margin={chartDimensions.margin}>
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
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          dot={dot}
          isAnimationActive={!prefersReducedMotion}
          activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "#fff" }}
        />
      </LineChart>
    </BaseChart>
  );
}
