"use client";

import { AreaChartWrapper } from "@/components/charts/AreaChartWrapper";
import { portfolioValueData } from "@/lib/mock-chart-data";
import { formatCurrency } from "@/lib/formatters";

export function AreaChartExample() {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Portfolio Value Area
      </h3>
      <AreaChartWrapper
        data={portfolioValueData}
        height={300}
        showGrid={true}
        fillOpacity={0.4}
        formatter={(value) => [formatCurrency(value), "Portfolio Value"]}
      />
    </div>
  );
}
