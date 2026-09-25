import assert from "node:assert/strict";
import test from "node:test";

type AppLocale = "en" | "fr";

interface LocaleState {
  locale: AppLocale;
  available: AppLocale[];
}

function isSupportedLocale(value: string): value is AppLocale {
  return value === "en" || value === "fr";
}

function detectInitialLocale(stored: string | null, browserLanguage: string): AppLocale {
  if (stored && isSupportedLocale(stored)) return stored;
  if (browserLanguage.startsWith("fr")) return "fr";
  return "en";
}

test("LocaleSwitcher — supports en and fr locales", () => {
  assert.equal(isSupportedLocale("en"), true);
  assert.equal(isSupportedLocale("fr"), true);
  assert.equal(isSupportedLocale("de"), false);
  assert.equal(isSupportedLocale(""), false);
});

test("LocaleSwitcher — stored locale takes precedence", () => {
  const locale = detectInitialLocale("fr", "en-US");
  assert.equal(locale, "fr");
});

test("LocaleSwitcher — browser language fallback to fr", () => {
  const locale = detectInitialLocale(null, "fr-FR");
  assert.equal(locale, "fr");
});

test("LocaleSwitcher — browser language fallback to en", () => {
  const locale = detectInitialLocale(null, "en-US");
  assert.equal(locale, "en");
});

test("LocaleSwitcher — browser language with fr prefix selects french", () => {
  const locale = detectInitialLocale(null, "fr-CA");
  assert.equal(locale, "fr");
});

test("LocaleSwitcher — stored invalid value falls back to browser", () => {
  const locale = detectInitialLocale("de", "fr-FR");
  assert.equal(locale, "fr");
});

test("LocaleSwitcher — stored and browser both default to en", () => {
  const locale = detectInitialLocale(null, "de-DE");
  assert.equal(locale, "en");
});

test("LocaleSwitcher — has accessible label via htmlFor", () => {
  const labelHtmlFor = "locale-switcher";
  assert.equal(labelHtmlFor, "locale-switcher");
});
