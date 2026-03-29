import { AppLocale, localeToIntl } from "./messages";

let activeLocale: AppLocale = "en";

export function setActiveLocale(locale: AppLocale) {
  activeLocale = locale;
}

export function getActiveLocale(): AppLocale {
  return activeLocale;
}

export function getActiveIntlLocale(): string {
  return localeToIntl[activeLocale];
}
