"use client";

import type { ReactNode } from "react";
import { useState, useEffect, memo } from "react";
import { ResponsiveContainer } from "recharts";
import {
  chartDimensions,
  chartTheme,
  getResponsiveConfig,
} from "@/lib/chart-theme";

type ChartValue = string | number | boolean | null | undefined;
type ChartDataKey = string | number;

interface ChartTooltipPayloadItem<
  Value extends ReactNode = ChartValue,
  Key extends ReactNode = ChartDataKey,
> {
  value?: Value;
  dataKey?: Key;
  name?: string;
  color?: string;
}

export type ChartTooltipFormatter<
  Value extends ReactNode = ChartValue,
  Key extends ReactNode = ChartDataKey,
> = (value: Value | undefined, name: Key | undefined) => [ReactNode, ReactNode];

interface BaseChartProps {
  children: ReactNode;
  height?: number;
  className?: string;
  "aria-label"?: string;
}

export const BaseChart = memo(function BaseChart({
  children,
  height = chartDimensions.height,
  className,
  "aria-label": ariaLabel,
}: BaseChartProps) {
  const [responsiveConfig, setResponsiveConfig] = useState(() =>
    typeof window !== "undefined"
      ? getResponsiveConfig(window.innerWidth)
      : getResponsiveConfig(1024),
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setResponsiveConfig(getResponsiveConfig(window.innerWidth));
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () =>
      setPrefersReducedMotion(mediaQuery.matches);

    handleResize();
    handleMotionPreference();

    window.addEventListener("resize", handleResize);
    mediaQuery.addEventListener("change", handleMotionPreference);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  return (
    <div
      className={className}
      style={{ width: "100%", height }}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
});

// Custom tooltip component that matches design spec
interface ChartTooltipProps<
  Value extends ReactNode = number,
  Key extends ReactNode = string,
> {
  active?: boolean;
  payload?: ChartTooltipPayloadItem<Value, Key>[];
  label?: string;
  formatter?: ChartTooltipFormatter<Value, Key>;
}

export function ChartTooltip<
  Value extends ReactNode = number,
  Key extends ReactNode = string,
>({ active, payload, label, formatter }: ChartTooltipProps<Value, Key>) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div style={chartTheme.tooltip.contentStyle}>
      {label && <p style={chartTheme.tooltip.labelStyle}>{label}</p>}
      {payload.map((entry, index) => {
        const [formattedValue, formattedName] = formatter
          ? formatter(entry.value, entry.dataKey)
          : [entry.value, entry.name || entry.dataKey];

        return (
          <p key={index} style={chartTheme.tooltip.itemStyle}>
            <span style={{ color: entry.color }}>●</span> {formattedName}:{" "}
            {formattedValue}
          </p>
        );
      })}
    </div>
  );
}

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    handler();
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}
