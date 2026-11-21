import { AppLocale, localeToIntl } from "./messages";

type LocaleChangeListener = (locale: AppLocale) => void;

let activeLocale: AppLocale = "en";
const localeChangeListeners = new Set<LocaleChangeListener>();

export function setActiveLocale(locale: AppLocale) {
  if (activeLocale === locale) {
    return;
  }
  activeLocale = locale;
  for (const listener of localeChangeListeners) {
    listener(locale);
  }
}

export function getActiveLocale(): AppLocale {
  return activeLocale;
}

export function getActiveIntlLocale(): string {
  return localeToIntl[activeLocale];
}

export function subscribeToLocaleChange(
  listener: LocaleChangeListener,
): () => void {
  localeChangeListeners.add(listener);
  return () => {
    localeChangeListeners.delete(listener);
  };
}
