import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_DISPLAY_CURRENCY,
  applyStoredDisplayPreferences,
  getDisplayCurrency,
  getDisplayLocale,
  normalizeDisplayCurrency,
  normalizeDisplayLocale,
  resetDisplayPreferences,
  setDisplayPreferences,
  subscribeDisplayPreferences,
} from "./display-preferences";
import { setActiveLocale } from "./locale-state";
import { STORAGE_KEYS } from "../storage-keys";

describe("display preferences", () => {
  beforeEach(() => {
    setActiveLocale("en");
    resetDisplayPreferences();
  });

  afterEach(() => {
    resetDisplayPreferences();
  });

  it("falls back to the UI locale and USD when nothing is saved", () => {
    assert.equal(getDisplayLocale(), "en-US");
    assert.equal(getDisplayCurrency(), DEFAULT_DISPLAY_CURRENCY);
    setActiveLocale("fr");
    assert.equal(getDisplayLocale(), "fr-FR");
  });

  it("uses the saved locale and currency over the UI locale", () => {
    setDisplayPreferences({ locale: "en-NG", currency: "NGN" });
    assert.equal(getDisplayLocale(), "en-NG");
    assert.equal(getDisplayCurrency(), "NGN");
    setActiveLocale("fr");
    assert.equal(getDisplayLocale(), "en-NG");
  });

  it("normalizes case and underscores", () => {
    assert.equal(normalizeDisplayLocale("de_de"), "de-DE");
    assert.equal(normalizeDisplayCurrency(" eur "), "EUR");
  });

  it("rejects invalid locales and currencies", () => {
    for (const bad of ["", "   ", "not a locale!!", "en--US", 42, null, undefined]) {
      assert.equal(normalizeDisplayLocale(bad), null);
    }
    for (const bad of ["", "US", "USDD", "12A", "ZZZ9", 5, null, undefined]) {
      assert.equal(normalizeDisplayCurrency(bad), null);
    }
  });

  it("clears a field that is missing or invalid instead of keeping a stale value", () => {
    setDisplayPreferences({ locale: "de-DE", currency: "EUR" });
    const applied = setDisplayPreferences({ locale: "garbage!!", currency: undefined });
    assert.deepEqual(applied, { locale: null, currency: null });
    assert.equal(getDisplayLocale(), "en-US");
    assert.equal(getDisplayCurrency(), "USD");
  });

  it("notifies subscribers on change and stops after unsubscribe", () => {
    let calls = 0;
    const unsubscribe = subscribeDisplayPreferences(() => {
      calls += 1;
    });
    setDisplayPreferences({ locale: "pt-BR", currency: "BRL" });
    resetDisplayPreferences();
    assert.equal(calls, 2);
    unsubscribe();
    setDisplayPreferences({ locale: "pt-BR", currency: "BRL" });
    assert.equal(calls, 2);
  });

  describe("applyStoredDisplayPreferences", () => {
    const globalWithWindow = globalThis as unknown as { window?: unknown };
    const original = globalWithWindow.window;

    function stubStorage(value: string | null) {
      globalWithWindow.window = {
        localStorage: {
          getItem: (key: string) => (key === STORAGE_KEYS.PREFERENCES ? value : null),
        },
      };
    }

    afterEach(() => {
      globalWithWindow.window = original;
    });

    it("reads locale and currencyFormat from the saved preferences blob", () => {
      stubStorage(JSON.stringify({ locale: "de-DE", currencyFormat: "EUR", theme: "dark" }));
      applyStoredDisplayPreferences();
      assert.equal(getDisplayLocale(), "de-DE");
      assert.equal(getDisplayCurrency(), "EUR");
    });

    it("keeps the defaults when nothing is stored", () => {
      stubStorage(null);
      applyStoredDisplayPreferences();
      assert.equal(getDisplayLocale(), "en-US");
      assert.equal(getDisplayCurrency(), "USD");
    });

    it("keeps the defaults when the stored value is corrupt", () => {
      stubStorage("{not json");
      applyStoredDisplayPreferences();
      assert.equal(getDisplayLocale(), "en-US");
      stubStorage(JSON.stringify("a string"));
      applyStoredDisplayPreferences();
      assert.equal(getDisplayCurrency(), "USD");
    });

    it("does nothing without a window", () => {
      globalWithWindow.window = undefined;
      applyStoredDisplayPreferences();
      assert.equal(getDisplayLocale(), "en-US");
    });
  });
});
