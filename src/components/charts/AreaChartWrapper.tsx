"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BaseChart, ChartTooltip } from "./BaseChart";
import { chartTheme, chartDimensions } from "@/lib/chart-theme";
import { ChartDataPoint } from "@/lib/mock-chart-data";

interface AreaChartWrapperProps {
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  fillOpacity?: number;
  color?: string;
  formatter?: (value: any, name: string) => [string, string];
}

export function AreaChartWrapper({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height,
  showGrid = true,
  showLegend = false,
  fillOpacity = 0.3,
  color = chartTheme.colors.primary,
  formatter,
}: AreaChartWrapperProps) {
  return (
    <BaseChart height={height}>
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
          tick={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
        />
        <YAxis
          axisLine={chartTheme.axis.axisLine}
          tickLine={chartTheme.axis.tickLine}
          tick={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
        />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {showLegend && <Legend wrapperStyle={chartTheme.legend.wrapperStyle} iconType={chartTheme.legend.iconType} />}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={fillOpacity}
          strokeWidth={2}
        />
      </AreaChart>
    </BaseChart>
  );
}
