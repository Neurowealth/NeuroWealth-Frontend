import {
  formatCompactNumber,
  formatCurrency,
  formatFullPrecision,
  formatNumber,
  formatPercent,
  getNumberTone,
  type NumberTone,
} from "@/lib/formatters";

type FormattedValueKind = "currency" | "percent" | "compact" | "number";

const toneClasses: Record<NumberTone, string> = {
  positive: "text-emerald-300",
  negative: "text-red-300",
  neutral: "text-slate-100",
};

interface FormattedValueProps {
  value: number;
  kind?: FormattedValueKind;
  currency?: string;
  locale?: string;
  signed?: boolean;
  className?: string;
  label?: string;
  fullPrecisionDigits?: number;
}

function getDisplayValue({
  currency,
  kind = "number",
  locale,
  signed = false,
  value,
}: FormattedValueProps) {
  const absoluteValue = signed ? Math.abs(value) : value;
  const sign = signed && value > 0 ? "+" : signed && value < 0 ? "-" : "";

  if (kind === "currency") {
    return `${sign}${formatCurrency(absoluteValue, { currency, locale })}`;
  }

  if (kind === "percent") {
    return `${sign}${formatPercent(absoluteValue, { locale })}`;
  }

  if (kind === "compact") {
    return `${sign}${formatCompactNumber(absoluteValue, { locale })}`;
  }

  return `${sign}${formatNumber(absoluteValue, { locale })}`;
}

export function FormattedValue(props: FormattedValueProps) {
  const {
    className = "",
    currency = "USD",
    fullPrecisionDigits = 8,
    kind = "number",
    label,
    locale,
    value,
  } = props;
  const tone = getNumberTone(value);
  const displayValue = getDisplayValue({ ...props, currency, kind });
  const fullValue =
    kind === "currency"
      ? formatCurrency(value, {
          currency,
          locale,
          maximumFractionDigits: fullPrecisionDigits,
          minimumFractionDigits: 2,
        })
      : kind === "percent"
        ? formatPercent(value, {
            locale,
            maximumFractionDigits: fullPrecisionDigits,
            minimumFractionDigits: 2,
          })
        : formatFullPrecision(value, {
            locale,
            maximumFractionDigits: fullPrecisionDigits,
          });

  return (
    <span
      aria-label={label ? `${label}: ${fullValue}` : fullValue}
      className={`font-mono tabular-nums ${toneClasses[tone]} ${className}`}
      title={fullValue}
    >
      {displayValue}
    </span>
  );
}
