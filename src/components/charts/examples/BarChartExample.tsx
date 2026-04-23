"use client";

import { BarChartWrapper } from "@/components/charts/BarChartWrapper";
import { monthlyYieldData } from "@/lib/mock-chart-data";
import { formatCurrency } from "@/lib/formatters";

export function BarChartExample() {
  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Monthly Yield Performance
      </h3>
      <BarChartWrapper
        data={monthlyYieldData}
        height={300}
        showGrid={true}
        barSize={40}
        formatter={(value) => [formatCurrency(value), "Monthly Yield"]}
      />
    </div>
  );
}
