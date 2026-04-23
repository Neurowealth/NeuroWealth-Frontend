"use client";

import { LineChartWrapper } from "@/components/charts/LineChartWrapper";
import { portfolioValueData } from "@/lib/mock-chart-data";
import { formatCurrency } from "@/lib/formatters";

export function LineChartExample() {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Portfolio Growth Trend
      </h3>
      <LineChartWrapper
        data={portfolioValueData}
        height={300}
        showGrid={true}
        dot={{ r: 3 }}
        formatter={(value) => [formatCurrency(value), "Portfolio Value"]}
      />
    </div>
  );
}
