import { getActiveIntlLocale, getActiveLocale } from "@/lib/i18n/locale-state";
import { dictionaries } from "@/lib/i18n/messages";

export type NumberTone = "positive" | "negative" | "neutral";

interface LocaleOption {
  locale?: string;
}

interface CurrencyFormatOptions extends LocaleOption {
  currency?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}

interface PercentFormatOptions extends LocaleOption {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}

interface NumberFormatOptions extends LocaleOption {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}

function resolveLocale(locale?: string) {
  return locale ?? getActiveIntlLocale();
}

function getCurrencyFormatter({
  currency = "USD",
  locale,
  maximumFractionDigits = 2,
  minimumFractionDigits = 2,
}: CurrencyFormatOptions = {}) {
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

function getPercentFormatter({
  locale,
  maximumFractionDigits = 4,
  minimumFractionDigits = 2,
}: PercentFormatOptions = {}) {
  return new Intl.NumberFormat(resolveLocale(locale), {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

function getNumberFormatter({
  locale,
  maximumFractionDigits = 2,
  minimumFractionDigits = 0,
}: NumberFormatOptions = {}) {
  return new Intl.NumberFormat(resolveLocale(locale), {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

function getTimestampFormatter(locale?: string) {
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getNumberTone(value: number): NumberTone {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

export function formatNumber(value: number, options?: NumberFormatOptions): string {
  return getNumberFormatter(options).format(value);
}

export function formatCompactNumber(value: number, options?: NumberFormatOptions): string {
  return new Intl.NumberFormat(resolveLocale(options?.locale), {
    notation: "compact",
    maximumFractionDigits: options?.maximumFractionDigits ?? 1,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
  }).format(value);
}

export function formatCurrency(value: number, options?: CurrencyFormatOptions): string {
  return getCurrencyFormatter(options).format(value);
}

export function formatSignedCurrency(value: number, options?: CurrencyFormatOptions): string {
  const absoluteValue = getCurrencyFormatter(options).format(Math.abs(value));

  if (value > 0) {
    return `+${absoluteValue}`;
  }

  if (value < 0) {
    return `-${absoluteValue}`;
  }

  return absoluteValue;
}

export function formatPercent(value: number, options?: PercentFormatOptions): string {
  return `${getPercentFormatter(options).format(value)}%`;
}

export function formatSignedPercent(value: number, options?: PercentFormatOptions): string {
  const absoluteValue = `${getPercentFormatter(options).format(Math.abs(value))}%`;

  if (value > 0) {
    return `+${absoluteValue}`;
  }

  if (value < 0) {
    return `-${absoluteValue}`;
  }

  return absoluteValue;
}

export function formatFullPrecision(value: number, options?: NumberFormatOptions): string {
  return getNumberFormatter({
    ...options,
    maximumFractionDigits: options?.maximumFractionDigits ?? 8,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
  }).format(value);
}

export function formatTimestamp(value: string, locale?: string): string {
  return getTimestampFormatter(locale).format(new Date(value));
}

export function formatSyncLabel(value: string): string {
  const prefix = dictionaries[getActiveLocale()].formatters.updatedPrefix;
  return `${prefix} ${getTimestampFormatter().format(new Date(value))}`;
}
