"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BaseChart, ChartTooltip } from "./BaseChart";
import { chartTheme, chartDimensions } from "@/lib/chart-theme";
import { ChartDataPoint } from "@/lib/mock-chart-data";

interface BarChartWrapperProps {
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  color?: string;
  barSize?: number;
  formatter?: (value: any, name: string) => [string, string];
}

export function BarChartWrapper({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height,
  showGrid = true,
  showLegend = false,
  color = chartTheme.colors.primary,
  barSize,
  formatter,
}: BarChartWrapperProps) {
  return (
    <BaseChart height={height}>
      <BarChart data={data} margin={chartDimensions.margin} barCategoryGap="20%">
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
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[4, 4, 0, 0]}
          barSize={barSize}
        />
      </BarChart>
    </BaseChart>
  );
}
