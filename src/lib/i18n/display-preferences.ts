import { STORAGE_KEYS } from "@/lib/storage-keys";
import { getActiveIntlLocale } from "./locale-state";

/**
 * Display formatting preferences (#1278).
 *
 * The profile and preferences pages let a user save a BCP47 display locale
 * (`en-NG`, `de-DE`, ...) and a currency code (`NGN`, `EUR`, ...). Those are
 * separate from the UI translation locale (`en` | `fr`), which only knows two
 * regions. This module holds the saved display choice so the shared formatters
 * can honour it; when nothing is saved they fall back to the translation
 * locale and USD, so existing output is unchanged.
 */

export const DEFAULT_DISPLAY_CURRENCY = "USD";

export interface DisplayPreferences {
  /** BCP47 tag such as "en-NG". */
  locale?: string;
  /** ISO 4217 code such as "NGN". */
  currency?: string;
}

let displayLocale: string | null = null;
let displayCurrency: string | null = null;
const listeners = new Set<() => void>();

/** Returns the canonical form of a BCP47 tag, or null when it is not valid. */
export function normalizeDisplayLocale(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  try {
    const [canonical] = Intl.getCanonicalLocales(value.trim().replace(/_/g, "-"));
    return canonical ?? null;
  } catch {
    return null;
  }
}

/** Returns the upper-case ISO 4217 code, or null when Intl does not accept it. */
export function normalizeDisplayCurrency(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return null;
  try {
    new Intl.NumberFormat("en-US", { style: "currency", currency: code });
    return code;
  } catch {
    return null;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

/**
 * Applies the saved display choice. A field that is missing or invalid is
 * cleared, so the formatters fall back to their defaults for it instead of
 * keeping a stale earlier value. Returns what was actually applied.
 */
export function setDisplayPreferences(preferences: DisplayPreferences): {
  locale: string | null;
  currency: string | null;
} {
  displayLocale = normalizeDisplayLocale(preferences.locale);
  displayCurrency = normalizeDisplayCurrency(preferences.currency);
  notify();
  return { locale: displayLocale, currency: displayCurrency };
}

export function resetDisplayPreferences(): void {
  displayLocale = null;
  displayCurrency = null;
  notify();
}

/** BCP47 locale for numbers, dates and currency: the saved one, else the UI locale's. */
export function getDisplayLocale(): string {
  return displayLocale ?? getActiveIntlLocale();
}

/** Currency code for money values: the saved one, else USD. */
export function getDisplayCurrency(): string {
  return displayCurrency ?? DEFAULT_DISPLAY_CURRENCY;
}

/** Calls `listener` whenever the display preferences change. Returns an unsubscribe function. */
export function subscribeDisplayPreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Reads the saved preferences blob (`STORAGE_KEYS.PREFERENCES`) and applies it.
 * Safe to call on the server or with unavailable/corrupt storage: it does
 * nothing in those cases.
 */
export function applyStoredDisplayPreferences(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return;
    const record = parsed as Record<string, unknown>;
    setDisplayPreferences({
      locale: typeof record.locale === "string" ? record.locale : undefined,
      currency: typeof record.currencyFormat === "string" ? record.currencyFormat : undefined,
    });
  } catch {
    // Unreadable storage leaves the defaults in place.
  }
}
