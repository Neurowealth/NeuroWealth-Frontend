"use client";

import { ReactNode } from "react";
import {
  formatApy,
  formatCompactCurrency,
  formatCurrency,
  formatCurrencyPrecise,
  formatSignedCurrency,
  formatSignedPercent,
  numericSign,
  type NumericSign,
} from "@/lib/formatters";
import { Tooltip } from "./Tooltip";

/**
 * Formatted-value UI helpers (Issue 468).
 *
 * Design spec:
 * - numbers render in a mono font;
 * - negative values are red, positive green, zero neutral;
 * - a tooltip exposes the full-precision value.
 *
 * These wrap the locale-aware helpers in `@/lib/formatters` so that locale
 * switching never breaks the surrounding layout.
 */

/** Spec colours: positive green, negative red, zero neutral. */
const SIGN_COLOR: Record<NumericSign, string> = {
  positive: "text-success",
  negative: "text-error",
  zero: "text-text-secondary",
};

interface BaseProps {
  /** Apply spec sign colours (green/red/neutral). Defaults to true. */
  colorBySign?: boolean;
  className?: string;
}

function Numeric({
  display,
  tooltip,
  value,
  colorBySign = true,
  className = "",
}: BaseProps & { display: ReactNode; tooltip: string; value: number }) {
  const color = colorBySign ? SIGN_COLOR[numericSign(value)] : "";
  const node = (
    <span className={`font-mono tabular-nums ${color} ${className}`.trim()}>{display}</span>
  );

  // Only attach a tooltip when it adds information beyond the displayed text.
  if (tooltip === String(display)) return node;

  return <Tooltip label={tooltip}>{node}</Tooltip>;
}

interface FormattedCurrencyProps extends BaseProps {
  value: number;
  /** Prefix positive values with "+". Useful for deltas. */
  signed?: boolean;
  /** Render compact (e.g. $12.3K) and reveal exact value in the tooltip. */
  compact?: boolean;
}

export function FormattedCurrency({
  value,
  signed = false,
  compact = false,
  colorBySign = true,
  className,
}: FormattedCurrencyProps) {
  const display = compact
    ? formatCompactCurrency(value)
    : signed
      ? formatSignedCurrency(value)
      : formatCurrency(value);

  return (
    <Numeric
      value={value}
      display={display}
      tooltip={formatCurrencyPrecise(value)}
      colorBySign={colorBySign}
      className={className}
    />
  );
}

interface FormattedPercentProps extends BaseProps {
  value: number;
  /** Prefix positive values with "+". */
  signed?: boolean;
  /** Use 2–4 dp APY precision instead of the default 1 dp. */
  apy?: boolean;
}

export function FormattedPercent({
  value,
  signed = false,
  apy = false,
  colorBySign = true,
  className,
}: FormattedPercentProps) {
  const display = apy ? formatApy(value) : signed ? formatSignedPercent(value) : `${value}%`;
  // APY carries its own full precision; otherwise reveal the raw signed value.
  const tooltip = apy ? formatApy(value) : formatSignedPercent(value);

  return (
    <Numeric
      value={value}
      display={display}
      tooltip={tooltip}
      colorBySign={colorBySign}
      className={className}
    />
  );
}
