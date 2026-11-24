import assert from "node:assert/strict";
import test from "node:test";

import {
  LineChartWrapper,
  AreaChartWrapper,
  BarChartWrapper,
  DonutChartWrapper,
  BaseChart,
  ChartTooltip,
  usePrefersReducedMotion,
} from "@/components/charts";

const namedExports = [
  { name: "LineChartWrapper", value: LineChartWrapper },
  { name: "AreaChartWrapper", value: AreaChartWrapper },
  { name: "BarChartWrapper", value: BarChartWrapper },
  { name: "DonutChartWrapper", value: DonutChartWrapper },
  { name: "BaseChart", value: BaseChart },
  { name: "ChartTooltip", value: ChartTooltip },
  { name: "usePrefersReducedMotion", value: usePrefersReducedMotion },
] as const;

test("barrel @/components/charts exports every name shown in the charts docs snippets", () => {
  for (const { name, value } of namedExports) {
    assert.ok(value, `expected @/components/charts.${name} to be exported`);
    assert.ok(
      typeof value === "function" || typeof value === "object",
      `expected @/components/charts.${name} to be a function or object, got ${typeof value}`,
    );
  }
});

test("Copy-paste snippets from docs/charts resolve without deep imports", () => {
  assert.ok(LineChartWrapper, "snippet import { LineChartWrapper } from \"@/components/charts\" resolves");
  assert.ok(AreaChartWrapper, "snippet import { AreaChartWrapper } from \"@/components/charts\" resolves");
  assert.ok(BarChartWrapper, "snippet import { BarChartWrapper } from \"@/components/charts\" resolves");
  assert.ok(DonutChartWrapper, "snippet import { DonutChartWrapper } from \"@/components/charts\" resolves");
});
