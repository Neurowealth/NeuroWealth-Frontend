import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  setActiveLocale,
  getActiveLocale,
  getActiveIntlLocale,
  subscribeToLocaleChange,
} from "./locale-state";
import type { AppLocale } from "./messages";

describe("locale-state", () => {
  beforeEach(() => {
    setActiveLocale("en");
  });

  describe("setActiveLocale and getActiveLocale", () => {
    it("starts with 'en' as default locale", () => {
      assert.equal(getActiveLocale(), "en");
    });

    it("updates activeLocale when setActiveLocale is called", () => {
      setActiveLocale("fr");
      assert.equal(getActiveLocale(), "fr");
    });

    it("supports multiple locale switches", () => {
      setActiveLocale("fr");
      assert.equal(getActiveLocale(), "fr");

      setActiveLocale("en");
      assert.equal(getActiveLocale(), "en");

      setActiveLocale("fr");
      assert.equal(getActiveLocale(), "fr");
    });
  });

  describe("getActiveIntlLocale", () => {
    it("returns 'en-US' for en locale", () => {
      setActiveLocale("en");
      assert.equal(getActiveIntlLocale(), "en-US");
    });

    it("returns correct intl locale for fr", () => {
      setActiveLocale("fr");
      assert.equal(getActiveIntlLocale(), "fr-FR");
    });

    it("reflects changes when locale is switched", () => {
      setActiveLocale("fr");
      assert.equal(getActiveIntlLocale(), "fr-FR");

      setActiveLocale("en");
      assert.equal(getActiveIntlLocale(), "en-US");
    });
  });

  describe("subscribeToLocaleChange", () => {
    it("notifies listeners when locale changes and stops after unsubscribe", () => {
      const seen: AppLocale[] = [];
      const unsubscribe = subscribeToLocaleChange((locale) => {
        seen.push(locale);
      });

      setActiveLocale("en"); // no-op, already "en"
      setActiveLocale("fr");
      setActiveLocale("fr"); // no-op, already "fr"
      setActiveLocale("en");

      unsubscribe();
      setActiveLocale("fr");

      assert.deepEqual(seen, ["fr", "en"]);
    });
  });
});
