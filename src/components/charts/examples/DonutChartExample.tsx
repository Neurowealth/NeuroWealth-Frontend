"use client";

import { DonutChartWrapper } from "@/components/charts/DonutChartWrapper";
import { assetAllocationData } from "@/lib/mock-chart-data";
import { formatPercent } from "@/lib/formatters";

export function DonutChartExample() {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Asset Allocation
      </h3>
      <DonutChartWrapper
        data={assetAllocationData}
        height={300}
        showLegend={true}
        formatter={(value, name) => [formatPercent(value / 100), name]}
      />
    </div>
  );
}
