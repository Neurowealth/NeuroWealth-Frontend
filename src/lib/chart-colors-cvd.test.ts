import assert from "node:assert/strict";
import test from "node:test";

import { chartTheme } from "./chart-theme";
import {
  type CvdMode,
  getCvdPairDistance,
  meetsWCAGAA,
} from "./chart-colors-cvd";

const CHART_BACKGROUNDS = ["#111827", "#ffffff"];
const CVD_MODES: CvdMode[] = ["protanopia", "deuteranopia", "tritanopia"];
const MIN_CVD_PAIR_DISTANCE = 35;

const activeChartColors = [
  chartTheme.colors.primary,
  chartTheme.colors.accent,
  chartTheme.colors.warning,
  chartTheme.colors["neutral-strong"],
];

test("active chart colors meet WCAG AA graphics contrast on dark and light chart backgrounds", () => {
  for (const color of activeChartColors) {
    for (const background of CHART_BACKGROUNDS) {
      assert.equal(
        meetsWCAGAA(color, background, false),
        true,
        `${color} should meet 3:1 graphics contrast on ${background}`,
      );
    }
  }
});

test("active chart colors remain distinguishable under simulated CVD modes", () => {
  for (const mode of CVD_MODES) {
    for (let i = 0; i < activeChartColors.length; i++) {
      for (let j = i + 1; j < activeChartColors.length; j++) {
        const distance = getCvdPairDistance(
          activeChartColors[i],
          activeChartColors[j],
          mode,
        );

        assert.ok(
          distance >= MIN_CVD_PAIR_DISTANCE,
          `${activeChartColors[i]} and ${activeChartColors[j]} are too close in ${mode}: ${distance.toFixed(1)}`,
        );
      }
    }
  }
});

test("chart tones expose non-color stroke patterns for redundant series encoding", () => {
  assert.equal(chartTheme.patterns.primary, "0");
  assert.notEqual(chartTheme.patterns.accent, chartTheme.patterns.primary);
  assert.notEqual(chartTheme.patterns.warning, chartTheme.patterns.primary);
  assert.notEqual(
    chartTheme.patterns["neutral-strong"],
    chartTheme.patterns.primary,
  );
});
