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

export function formatTimestamp(value: string): string {
  return getTimestampFormatter().format(new Date(value));
}

export function formatSyncLabel(value: string): string {
  const prefix = dictionaries[getActiveLocale()].formatters.updatedPrefix;
  return `${prefix} ${getTimestampFormatter().format(new Date(value))}`;
}
