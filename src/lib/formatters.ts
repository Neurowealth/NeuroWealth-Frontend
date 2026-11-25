import { dictionaries } from "@/lib/i18n/messages";
import { getActiveLocale } from "@/lib/i18n/locale-state";
import {
  getDisplayCurrency,
  getDisplayLocale,
  normalizeDisplayCurrency,
  normalizeDisplayLocale,
} from "@/lib/i18n/display-preferences";

/**
 * Per-call override of the saved display locale/currency (#1278). Invalid
 * values are ignored and the saved preference is used instead.
 */
export interface FormatOverrides {
  /** BCP47 tag, e.g. "en-NG". */
  locale?: string;
  /** ISO 4217 code, e.g. "NGN". */
  currency?: string;
}

function resolveLocale(overrides?: FormatOverrides): string {
  return normalizeDisplayLocale(overrides?.locale) ?? getDisplayLocale();
}

function resolveCurrency(overrides?: FormatOverrides): string {
  return normalizeDisplayCurrency(overrides?.currency) ?? getDisplayCurrency();
}

function getCurrencyFormatter(overrides?: FormatOverrides) {
  return new Intl.NumberFormat(resolveLocale(overrides), {
    style: "currency",
    currency: resolveCurrency(overrides),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPercentFormatter() {
  return new Intl.NumberFormat(getDisplayLocale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function getApyFormatter() {
  // Spec (Issue 468): 2–4 dp for APY.
  return new Intl.NumberFormat(getDisplayLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function getPreciseCurrencyFormatter(overrides?: FormatOverrides) {
  return new Intl.NumberFormat(resolveLocale(overrides), {
    style: "currency",
    currency: resolveCurrency(overrides),
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

function getTimestampFormatter() {
  // The year is included so records from a previous year do not look recent
  // in transaction history, audit trails and receipts.
  return new Intl.DateTimeFormat(getDisplayLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCurrency(value: number, overrides?: FormatOverrides): string {
  return getCurrencyFormatter(overrides).format(value);
}

export function formatSignedCurrency(value: number, overrides?: FormatOverrides): string {
  const absoluteValue = getCurrencyFormatter(overrides).format(Math.abs(value));
  const roundedValue = Number(value.toFixed(2));

  if (roundedValue > 0) {
    return `+${absoluteValue}`;
  }

  if (roundedValue < 0) {
    return `-${absoluteValue}`;
  }

  return absoluteValue;
}

export function formatPercent(value: number): string {
  return `${getPercentFormatter().format(value)}%`;
}

export function formatSignedPercent(value: number): string {
  const absoluteValue = `${getPercentFormatter().format(Math.abs(value))}%`;
  const roundedValue = Number(value.toFixed(1));

  if (roundedValue > 0) {
    return `+${absoluteValue}`;
  }

  if (roundedValue < 0) {
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
export function formatCurrencyPrecise(value: number, overrides?: FormatOverrides): string {
  return getPreciseCurrencyFormatter(overrides).format(value);
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
 * Compact currency for dense widgets (e.g. $12.3K). Locale-aware.
 */
export function formatCompactCurrency(value: number, overrides?: FormatOverrides): string {
  return new Intl.NumberFormat(resolveLocale(overrides), {
    style: "currency",
    currency: resolveCurrency(overrides),
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
  return new Intl.DateTimeFormat(getDisplayLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

function getNumberFormatter(options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(getDisplayLocale(), {
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
