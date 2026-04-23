"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BaseChart, ChartTooltip } from "./BaseChart";
import { chartTheme, chartDimensions, getChartColor } from "@/lib/chart-theme";
import { ChartDataPoint } from "@/lib/mock-chart-data";
import { ChartTone } from "@/lib/portfolio";

interface DonutChartWrapperProps {
  data: (ChartDataPoint & { tone?: ChartTone })[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  formatter?: (value: any, name: string) => [string, string];
}

export function DonutChartWrapper({
  data,
  height,
  innerRadius = 60,
  outerRadius = 100,
  showLegend = false,
  formatter,
}: DonutChartWrapperProps) {
  return (
    <BaseChart height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.tone ? getChartColor(entry.tone) : chartTheme.colors.primary}
            />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip formatter={formatter} />} />
        {showLegend && <Legend wrapperStyle={chartTheme.legend.wrapperStyle} iconType={chartTheme.legend.iconType} />}
      </PieChart>
    </BaseChart>
  );
}
