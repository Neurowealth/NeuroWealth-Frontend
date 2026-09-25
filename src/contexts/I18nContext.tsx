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
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * Persists the *UI translation* locale ("en" | "fr"). This is distinct from the
 * BCP47 *display formatting* locale stored inside the profile / preferences
 * blobs — see `src/lib/locale-options.ts` for the relationship between the two.
 */
const LOCALE_STORAGE_KEY = STORAGE_KEYS.LOCALE;

interface I18nContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  messages: (typeof dictionaries)[AppLocale];
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isSupportedLocale(value: string): value is AppLocale {
  return value === "en" || value === "fr";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en");

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

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      messages: dictionaries[locale],
    }),
    [locale, setLocale],
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
