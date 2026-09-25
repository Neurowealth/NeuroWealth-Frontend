#!/usr/bin/env tsx
/**
 * Chart Color Contrast Verification Script
 *
 * Programmatically verifies chart colors for WCAG AA graphics contrast and
 * simulated CVD distinguishability on the actual application backgrounds.
 *
 * Usage: npx tsx scripts/verify-chart-contrast.ts
 */

import {
  CVD_PALETTES,
  type CvdMode,
  getCvdPairDistance,
  getContrastRatio,
  meetsWCAGAA,
} from "../src/lib/chart-colors-cvd";

// Actual background colors from tailwind.config.ts and globals.css
const BACKGROUNDS = {
  body: "#020617", // Body background (globals.css)
  surface: "#111827", // Card/surface background where charts render (tailwind.config.ts)
  surfaceElevated: "#1F2937", // Elevated surface (tailwind.config.ts)
  lightMode: "#ffffff", // white (typical light mode)
};

// WCAG standards
const WCAG_AA_TEXT = 4.5;
const WCAG_AA_GRAPHICS = 3.0;
const WCAG_AAA_TEXT = 7.0;
const MIN_CVD_PAIR_DISTANCE = 35;
const CVD_MODES: CvdMode[] = ["protanopia", "deuteranopia", "tritanopia"];

interface ContrastResult {
  color: string;
  hex: string;
  background: string;
  ratio: number;
  passesAAText: boolean;
  passesAAGraphics: boolean;
  passesAAAText: boolean;
}

function testColorContrast(
  colorName: string,
  colorHex: string,
  bgName: string,
  bgHex: string,
): ContrastResult {
  const ratio = getContrastRatio(colorHex, bgHex);

  return {
    color: colorName,
    hex: colorHex,
    background: bgName,
    ratio: Math.round(ratio * 100) / 100,
    passesAAText: ratio >= WCAG_AA_TEXT,
    passesAAGraphics: ratio >= WCAG_AA_GRAPHICS,
    passesAAAText: ratio >= WCAG_AAA_TEXT,
  };
}

function formatResult(result: ContrastResult): string {
  const graphicsStatus = result.passesAAGraphics ? "✅" : "❌";
  const textStatus = result.passesAAText ? "✅" : "⚠️ ";
  const aaaStatus = result.passesAAAText ? "(AAA)" : "";

  return `${graphicsStatus} ${textStatus} ${result.color.padEnd(18)} ${result.hex} → ${result.ratio.toFixed(2)}:1 ${aaaStatus}`;
}

function formatDistance(value: number): string {
  return Math.round(value * 10) / 10 + "";
}

function main() {
  console.log("\n🎨 Chart Color Contrast Verification\n");
  console.log("=".repeat(80));
  console.log("\nTesting against ACTUAL application backgrounds");
  console.log("Charts render on surface (#111827), not body (#020617)\n");
  console.log("=".repeat(80));

  // Test primary palette
  console.log("\n📊 PRIMARY PALETTE (CVD-Safe Colors)\n");

  const primaryColors = Object.entries(CVD_PALETTES.primary);
  const accessibleColors = Object.entries(CVD_PALETTES.accessible);

  // Test against surface background (where charts are actually rendered)
  console.log(
    `\n🎯 Surface Background - WHERE CHARTS RENDER (${BACKGROUNDS.surface})\n`,
  );
  console.log(
    "   ✅ = Graphics OK (3:1) | ⚠️  = Text needs improvement (4.5:1)\n",
  );

  const surfaceResults: ContrastResult[] = [];

  primaryColors.forEach(([name, hex]) => {
    const result = testColorContrast(name, hex, "surface", BACKGROUNDS.surface);
    surfaceResults.push(result);
    console.log(formatResult(result));
  });

  // Test against body background (for reference)
  console.log(`\n📄 Body Background - REFERENCE ONLY (${BACKGROUNDS.body})\n`);

  const bodyResults: ContrastResult[] = [];

  primaryColors.forEach(([name, hex]) => {
    const result = testColorContrast(name, hex, "body", BACKGROUNDS.body);
    bodyResults.push(result);
    console.log(formatResult(result));
  });

  // Test against light mode background
  console.log(`\n☀️  Light Mode Background (${BACKGROUNDS.lightMode})\n`);

  const lightResults: ContrastResult[] = [];

  primaryColors.forEach(([name, hex]) => {
    const result = testColorContrast(
      name,
      hex,
      "lightMode",
      BACKGROUNDS.lightMode,
    );
    lightResults.push(result);
    console.log(formatResult(result));
  });

  // Test accessible palette
  console.log("\n\n♿ ACCESSIBLE PALETTE (Extended Colors)\n");
  console.log(`\n🎯 Surface Background (${BACKGROUNDS.surface})\n`);

  accessibleColors.forEach(([name, hex]) => {
    const result = testColorContrast(name, hex, "surface", BACKGROUNDS.surface);
    console.log(formatResult(result));
  });

  // Test neutral colors
  console.log("\n\n🎨 NEUTRAL PALETTE (Supporting Colors)\n");
  console.log(`\n🎯 Surface Background (${BACKGROUNDS.surface})\n`);

  Object.entries(CVD_PALETTES.neutral).forEach(([name, hex]) => {
    const result = testColorContrast(name, hex, "surface", BACKGROUNDS.surface);
    console.log(formatResult(result));
  });

  // Summary
  console.log("\n\n" + "=".repeat(80));
  console.log("\n📋 SUMMARY\n");

  const allSurfaceGraphicsPass = surfaceResults.every(
    (r) => r.passesAAGraphics,
  );
  const allSurfaceTextPass = surfaceResults.every((r) => r.passesAAText);
  const allLightGraphicsPass = lightResults.every((r) => r.passesAAGraphics);
  const surfaceAAACount = surfaceResults.filter((r) => r.passesAAAText).length;

  console.log(
    `Surface (Graphics 3:1):      ${allSurfaceGraphicsPass ? "✅ ALL PASS" : "❌ SOME FAIL"} (CRITICAL for charts)`,
  );
  console.log(
    `Surface (Text 4.5:1):        ${allSurfaceTextPass ? "✅ ALL PASS" : "⚠️  SOME FAIL"} (recommended for labels)`,
  );
  console.log(
    `Light Mode (Graphics 3:1):   ${allLightGraphicsPass ? "✅ ALL PASS" : "❌ SOME FAIL"}`,
  );
  console.log(
    `Surface AAA (7:1):           ${surfaceAAACount}/${surfaceResults.length} colors`,
  );

  // Color differentiation test
  console.log("\n\n🔍 CVD DIFFERENTIATION TEST\n");
  console.log(
    `Testing simulated RGB distance between palette colors (minimum ${MIN_CVD_PAIR_DISTANCE}):\n`,
  );

  const paletteColors = Object.entries(CVD_PALETTES.primary);
  let allCvdPairsPass = true;

  CVD_MODES.forEach((mode) => {
    console.log(`\n${mode.toUpperCase()}\n`);

    for (let i = 0; i < paletteColors.length; i++) {
      for (let j = i + 1; j < paletteColors.length; j++) {
        const [name1, hex1] = paletteColors[i];
        const [name2, hex2] = paletteColors[j];
        const distance = getCvdPairDistance(hex1, hex2, mode);
        const passes = distance >= MIN_CVD_PAIR_DISTANCE;
        const status = passes ? "✅" : "❌";

        if (!passes) {
          allCvdPairsPass = false;
        }

        console.log(
          `${status} ${name1.padEnd(10)} vs ${name2.padEnd(10)}: ${formatDistance(distance)}`,
        );
      }
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log("\n✨ Verification complete!\n");

  // Exit with error if any critical tests fail
  // For charts, WCAG AA Graphics (3:1) is the critical requirement
  if (!allSurfaceGraphicsPass) {
    console.error(
      "❌ CRITICAL: Some colors fail WCAG AA graphics contrast (3:1) on surface backgrounds\n",
    );
    process.exit(1);
  }

  if (!allLightGraphicsPass) {
    console.error(
      "❌ CRITICAL: Some colors fail WCAG AA graphics contrast (3:1) on light backgrounds\n",
    );
    process.exit(1);
  }

  if (!allCvdPairsPass) {
    console.error(
      `❌ CRITICAL: Some chart colors are too close under simulated CVD modes (minimum ${MIN_CVD_PAIR_DISTANCE})\n`,
    );
    process.exit(1);
  }

  if (!allSurfaceTextPass) {
    console.warn(
      "⚠️  WARNING: Some colors fail WCAG AA text contrast (4.5:1) on surface backgrounds\n",
    );
    console.warn(
      "   This is acceptable for chart graphics but not for text labels.\n",
    );
    console.warn(
      "   Consider using lighter shades for axis labels and legends.\n",
    );
  }

  console.log(
    "✅ All critical accessibility requirements met for chart graphics and CVD differentiation!\n",
  );
}

// Run the verification
main();
