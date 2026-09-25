import { getActiveIntlLocale } from "@/lib/i18n/locale-state";
import { dictionaries } from "@/lib/i18n/messages";
import { getActiveLocale } from "@/lib/i18n/locale-state";

function getCurrencyFormatter() {
  return new Intl.NumberFormat(getActiveIntlLocale(), {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPercentFormatter() {
  return new Intl.NumberFormat(getActiveIntlLocale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function getApyFormatter() {
  // Spec (Issue 468): 2–4 dp for APY.
  return new Intl.NumberFormat(getActiveIntlLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function getCompactFormatter() {
  return new Intl.NumberFormat(getActiveIntlLocale(), {
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

function getPreciseCurrencyFormatter() {
  return new Intl.NumberFormat(getActiveIntlLocale(), {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

function getTimestampFormatter() {
  return new Intl.DateTimeFormat(getActiveIntlLocale(), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number): string {
  return getCurrencyFormatter().format(value);
}

export function formatSignedCurrency(value: number): string {
  const absoluteValue = getCurrencyFormatter().format(Math.abs(value));

  if (value > 0) {
    return `+${absoluteValue}`;
  }

  if (value < 0) {
    return `-${absoluteValue}`;
  }

  return absoluteValue;
}

export function formatPercent(value: number): string {
  return `${getPercentFormatter().format(value)}%`;
}

export function formatSignedPercent(value: number): string {
  const absoluteValue = `${getPercentFormatter().format(Math.abs(value))}%`;

  if (value > 0) {
    return `+${absoluteValue}`;
  }

  if (value < 0) {
    return `-${absoluteValue}`;
  }

  return absoluteValue;
}

/**
 * Sign of a numeric value, used by formatted-value UI helpers to pick the
 * spec colour: positive → green, negative → red, zero → neutral.
 */
export type NumericSign = "positive" | "negative" | "zero";

export function numericSign(value: number): NumericSign {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "zero";
}

/**
 * Full-precision, locale-aware currency string for tooltips. Keeps up to 8
 * fraction digits so the underlying value is never silently truncated.
 */
export function formatCurrencyPrecise(value: number): string {
  return getPreciseCurrencyFormatter().format(value);
}

/**
 * APY/yield string with 2–4 dp (Issue 468 spec). Trailing precision past 2 dp
 * is preserved; values are not padded beyond what they carry.
 */
export function formatApy(value: number): string {
  return `${getApyFormatter().format(value)}%`;
}

/**
 * Locale-aware APY range (e.g. "4.00%–6.00%") from a min/max pair.
 */
export function formatApyRange(min: number, max: number): string {
  return `${formatApy(min)}–${formatApy(max)}`;
}

/**
 * Compact number formatting (e.g. 12.3K, 1.2M) for dense widgets. Locale-aware.
 */
export function formatCompactNumber(value: number): string {
  return getCompactFormatter().format(value);
}

/**
 * Compact currency for dense widgets (e.g. $12.3K). Locale-aware.
 */
export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat(getActiveIntlLocale(), {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatTimestamp(value: string): string {
  return getTimestampFormatter().format(new Date(value));
}

export function formatSyncLabel(value: string): string {
  const prefix = dictionaries[getActiveLocale()].formatters.updatedPrefix;
  return `${prefix} ${getTimestampFormatter().format(new Date(value))}`;
}

function getDateFormatter(options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(getActiveIntlLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

function getNumberFormatter(options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(getActiveIntlLocale(), {
    ...options,
  });
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return getDateFormatter(options).format(date);
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return getNumberFormatter(options).format(value);
}
