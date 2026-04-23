"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { BaseChart, ChartTooltip } from "./BaseChart";
import { chartTheme, chartDimensions } from "@/lib/chart-theme";
import { ChartDataPoint } from "@/lib/mock-chart-data";

interface LineChartWrapperProps {
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  color?: string;
  strokeWidth?: number;
  dot?: boolean | object;
  formatter?: (value: any, name: string) => [string, string];
}

export function LineChartWrapper({
  data,
  dataKey = "value",
  xAxisKey = "name",
  height,
  showGrid = true,
  showLegend = false,
  color = chartTheme.colors.primary,
  strokeWidth = 2,
  dot = false,
  formatter,
}: LineChartWrapperProps) {
  return (
    <BaseChart height={height}>
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
          tick={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
        />
        <YAxis
          axisLine={chartTheme.axis.axisLine}
          tickLine={chartTheme.axis.tickLine}
          tick={{ fontSize: chartTheme.axis.fontSize, fill: chartTheme.axis.fill }}
        />
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {showLegend && <Legend wrapperStyle={chartTheme.legend.wrapperStyle} iconType={chartTheme.legend.iconType} />}
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={strokeWidth}
          dot={dot}
          activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "#fff" }}
        />
      </LineChart>
    </BaseChart>
  );
}
