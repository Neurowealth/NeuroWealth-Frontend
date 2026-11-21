"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppLocale, dictionaries, localeToIntl } from "@/lib/i18n/messages";
import { setActiveLocale } from "@/lib/i18n/locale-state";
import {
  applyStoredDisplayPreferences,
  subscribeDisplayPreferences,
} from "@/lib/i18n/display-preferences";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * Persists the *UI translation* locale ("en" | "fr"). This is distinct from the
 * BCP47 *display formatting* locale stored inside the profile / preferences
 * blobs — see `src/lib/locale-options.ts` for the relationship between the two.
 */
const LOCALE_STORAGE_KEY = STORAGE_KEYS.LOCALE;

interface I18nContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale | string) => void;
  messages: (typeof dictionaries)[AppLocale];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function isSupportedLocale(value: string): value is AppLocale {
  return value === "en" || value === "fr";
}

/**
 * Normalizes any locale string (such as "en-US", "fr-FR", "en_GB") to an AppLocale.
 * Unsupported values fall back safely to fallback (default: "en").
 */
export function normalizeLocale(
  value: string | null | undefined,
  fallback: AppLocale = "en",
): AppLocale {
  if (!value) return fallback;
  const trimmed = value.trim().toLowerCase();
  const lang = trimmed.split(/[-_]/)[0];
  if (lang === "fr") return "fr";
  if (lang === "en") return "en";
  return fallback;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en");
  // Bumped when the saved display locale/currency changes so consumers of this
  // context re-render and the shared formatters are called again (#1278).
  const [displayVersion, setDisplayVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeDisplayPreferences(() =>
      setDisplayVersion((version) => version + 1),
    );
    applyStoredDisplayPreferences();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) {
      setLocaleState(stored);
      return;
    }

    const browserLanguage = window.navigator.language.toLowerCase();
    if (browserLanguage.startsWith("fr")) {
      setLocaleState("fr");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setActiveLocale(locale);

    if (typeof document !== "undefined") {
      document.documentElement.lang = localeToIntl[locale];
    }

    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  // Cross-tab sync: when another tab changes the locale, apply it here.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== LOCALE_STORAGE_KEY) return;
      if (e.newValue === null) return;
      if (isSupportedLocale(e.newValue) && e.newValue !== locale) {
        setLocaleState(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [locale]);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
  const setLocale = useCallback((nextLocale: AppLocale | string) => {
    const normalized = normalizeLocale(nextLocale);
    setLocaleState(normalized);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      messages: dictionaries[locale],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, setLocale, displayVersion],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}
