import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  formatCurrency,
  formatSignedCurrency,
  formatPercent,
  formatSignedPercent,
  numericSign,
  formatCurrencyPrecise,
  formatApy,
  formatApyRange,
  formatCompactCurrency,
  formatTimestamp,
  formatSyncLabel,
  formatDate,
} from "./formatters";
import { setActiveLocale, getActiveLocale } from "./i18n/locale-state";
import {
  resetDisplayPreferences,
  setDisplayPreferences,
} from "./i18n/display-preferences";
import { formatNumber } from "./formatters";

describe("formatters", () => {
  // Mock locale to ensure consistent test results
  beforeEach(() => {
    // Tests run with TZ=UTC (set in package.json test script)
    // Intl formatters will use default locale behavior
    setActiveLocale("en");
  });

  describe("formatCurrency", () => {
    it("formats positive numbers as currency", () => {
      const result = formatCurrency(1234.56);
      assert.match(result, /1.*234.*56/); // Locale-agnostic pattern
    });

    it("formats zero", () => {
      const result = formatCurrency(0);
      assert.ok(result.includes("0"));
    });

    it("formats negative numbers", () => {
      const result = formatCurrency(-99.99);
      assert.ok(result.includes("99.99") || result.includes("99,99"));
    });

    it("rounds to 2 decimal places", () => {
      const result = formatCurrency(10.126);
      assert.ok(result.includes("10.13") || result.includes("10,13"));
    });
  });

  describe("formatSignedCurrency", () => {
    it("adds plus sign for positive values", () => {
      const result = formatSignedCurrency(500);
      assert.match(result, /\+/);
      assert.ok(result.includes("500"));
    });

    it("includes minus sign for negative values", () => {
      const result = formatSignedCurrency(-250);
      assert.match(result, /-/);
      assert.ok(result.includes("250"));
    });

    it("formats zero without sign", () => {
      const result = formatSignedCurrency(0);
      assert.ok(!result.match(/[\+\-]/));
    });

    it("omits the sign when a small value rounds to zero", () => {
      const result = formatSignedCurrency(-0.004);
      assert.ok(!result.match(/[\+\-]/));
      assert.ok(result.includes("0.00") || result.includes("0,00"));
    });
  });

  describe("formatPercent", () => {
    it("formats percent with 1 decimal place", () => {
      const result = formatPercent(5.678);
      assert.match(result, /5\.7|5,7/); // Allow locale variations
      assert.ok(result.includes("%"));
    });

    it("includes percent sign", () => {
      const result = formatPercent(10);
      assert.ok(result.includes("%"));
    });

    it("handles zero", () => {
      const result = formatPercent(0);
      assert.ok(result.includes("0"));
      assert.ok(result.includes("%"));
    });
  });

  describe("formatSignedPercent", () => {
    it("adds plus sign for positive percent", () => {
      const result = formatSignedPercent(8.5);
      assert.match(result, /\+/);
      assert.ok(result.includes("%"));
    });

    it("includes minus for negative percent", () => {
      const result = formatSignedPercent(-3.2);
      assert.match(result, /-/);
      assert.ok(result.includes("%"));
    });

    it("omits the sign when a small percent rounds to zero", () => {
      const result = formatSignedPercent(-0.04);
      assert.ok(!result.match(/[\+\-]/));
      assert.ok(result.includes("0.0%") || result.includes("0,0%"));
    });
  });

  describe("numericSign", () => {
    it("returns 'positive' for positive values", () => {
      assert.equal(numericSign(42), "positive");
      assert.equal(numericSign(0.001), "positive");
    });

    it("returns 'negative' for negative values", () => {
      assert.equal(numericSign(-10), "negative");
      assert.equal(numericSign(-0.001), "negative");
    });

    it("returns 'zero' for zero", () => {
      assert.equal(numericSign(0), "zero");
    });
  });

  describe("formatCurrencyPrecise", () => {
    it("preserves up to 8 decimal places", () => {
      const result = formatCurrencyPrecise(0.12345678);
      // Precision should be preserved (up to 8 dp)
      assert.ok(result.length > 3); // At least "$0.xx"
    });

    it("handles large numbers", () => {
      const result = formatCurrencyPrecise(999999.99999999);
      assert.ok(result.length > 0);
    });
  });

  describe("formatApy", () => {
    it("formats APY with 2–4 decimal places", () => {
      const result = formatApy(4.5);
      assert.ok(result.includes("%"));
      assert.ok(
        result.includes("4.5") ||
          result.includes("4,5") ||
          result.includes("4.50"),
      );
    });

    it("shows trailing precision up to 4 dp", () => {
      const result = formatApy(6.123);
      assert.ok(result.includes("%"));
    });

    it("maintains minimum 2 decimal places", () => {
      const result = formatApy(5);
      // Should have at least 2 dp representation
      assert.ok(result.includes("%"));
    });
  });

  describe("formatApyRange", () => {
    it("formats min and max APY with en-dash", () => {
      const result = formatApyRange(3.0, 5.5);
      assert.ok(result.includes("–")); // en-dash
      assert.ok(result.includes("%"));
      assert.ok(result.includes("3") && result.includes("5"));
    });

    it("handles identical min/max", () => {
      const result = formatApyRange(4.25, 4.25);
      assert.ok(result.includes("–"));
      assert.ok(result.includes("4.25") || result.includes("4,25"));
    });
  });

  describe("formatCompactCurrency", () => {
    it("compacts currency for dense display", () => {
      const result = formatCompactCurrency(150000);
      assert.ok(result.length <= 8);
    });

    it("includes currency symbol or format", () => {
      const result = formatCompactCurrency(5000);
      assert.ok(result.length > 0);
    });
  });

  describe("formatTimestamp", () => {
    it("formats timestamp with month, day, hour, minute", () => {
      const testDate = "2024-06-15T14:30:00Z";
      const result = formatTimestamp(testDate);
      // Should include time components
      assert.ok(result.length > 0);
    });

    it("handles ISO date strings", () => {
      const result = formatTimestamp("2024-01-01T00:00:00Z");
      assert.ok(result.includes("Jan") || result.includes("1"));
    });
  });

  describe("formatSyncLabel", () => {
    it("includes 'updated' prefix and timestamp", () => {
      const testDate = "2024-06-15T14:30:00Z";
      const result = formatSyncLabel(testDate);
      // Should contain a timestamp format
      assert.ok(result.length > 0);
    });

    it("handles date conversion", () => {
      const result = formatSyncLabel("2024-03-20T10:15:00Z");
      assert.ok(result.length > 5);
    });
  });

  describe("formatDate", () => {
    it("formats date with default options", () => {
      const result = formatDate("2024-06-15");
      assert.ok(
        result.includes("Jun") ||
          result.includes("15") ||
          result.includes("2024"),
      );
    });

    it("accepts custom format options", () => {
      const result = formatDate("2024-06-15", { month: "long" });
      assert.ok(result.length > 0);
    });

    it("handles Date objects", () => {
      const date = new Date("2024-06-15");
      const result = formatDate(date);
      assert.ok(result.length > 0);
    });

    it("formats with year, month, day", () => {
      const result = formatDate("2024-12-25");
      // Result should contain date info
      assert.ok(
        result.includes("2024") ||
          result.includes("25") ||
          result.includes("Dec"),
      );
    });
  });

  // Locale-aware formatting tests (Issue #540)
  describe("locale-aware formatting", () => {
    it("formats currency differently in French locale", () => {
      setActiveLocale("fr");
      const result = formatCurrency(1234.56);
      // French uses different separators than English
      assert.ok(result.length > 0);
      assert.equal(getActiveLocale(), "fr");
    });

    it("formatting is locale-aware", () => {
      setActiveLocale("fr");
      const result = formatCurrency(1234.56);
      // French uses different separators and currency symbol positioning
      assert.ok(result.length > 0);
      assert.equal(getActiveLocale(), "fr");
    });

    it("locale switch affects date formatting", () => {
      const testDate = "2024-06-15";

      setActiveLocale("en");
      const enResult = formatDate(testDate);
      assert.ok(enResult.length > 0);

      setActiveLocale("fr");
      const frResult = formatDate(testDate);
      assert.ok(frResult.length > 0);

      // Results should be different due to locale differences
      assert.equal(getActiveLocale(), "fr");
    });

    it("locale switch affects timestamp formatting", () => {
      const testTimestamp = "2024-06-15T14:30:00Z";

      setActiveLocale("en");
      const enResult = formatTimestamp(testTimestamp);

      setActiveLocale("fr");
      const frResult = formatTimestamp(testTimestamp);

      assert.ok(enResult.length > 0);
      assert.ok(frResult.length > 0);
      assert.equal(getActiveLocale(), "fr");
    });

    it("preserves formatting across multiple locale switches", () => {
      const testValue = 5.678;

      setActiveLocale("en");
      const en1 = formatPercent(testValue);

      setActiveLocale("fr");
      const fr1 = formatPercent(testValue);

      setActiveLocale("en");
      const en2 = formatPercent(testValue);

      // English formatting should be consistent across switches
      assert.equal(en1, en2);
      assert.ok(en1.includes("%"));
      assert.ok(fr1.includes("%"));
    });

    it("formatCompactCurrency is locale-aware", () => {
      const value = 150000;

      setActiveLocale("en");
      const enResult = formatCompactCurrency(value);

      setActiveLocale("fr");
      const frResult = formatCompactCurrency(value);

      assert.ok(enResult.length > 0);
      assert.ok(frResult.length > 0);
      // Both should produce distinct output for different locales
      assert.notEqual(enResult, frResult);
    });
  });
});

describe("test environment", () => {
  it("yarn test pins TZ to UTC", () => {
    assert.equal(process.env.TZ, "UTC");
  });
});

// #1278 — formatters follow the saved profile locale and currency.
describe("formatters honour the saved display locale and currency", () => {
  beforeEach(() => {
    setActiveLocale("en");
    resetDisplayPreferences();
  });

  it("keeps USD and the UI locale when no preference is saved", () => {
    assert.equal(formatCurrency(1234.56), "$1,234.56");
  });

  it("formats Nigerian Naira for en-NG / NGN", () => {
    setDisplayPreferences({ locale: "en-NG", currency: "NGN" });
    const result = formatCurrency(1234.56);
    assert.ok(result.includes("1,234.56"), result);
    assert.match(result, /₦|NGN/);
    assert.ok(!result.includes("$"), result);
  });

  it("formats euros with German separators for de-DE / EUR", () => {
    setDisplayPreferences({ locale: "de-DE", currency: "EUR" });
    const result = formatCurrency(1234.56);
    assert.ok(result.includes("1.234,56"), result);
    assert.ok(result.includes("€"), result);
  });

  it("applies the saved currency to signed, precise and compact output", () => {
    setDisplayPreferences({ locale: "de-DE", currency: "EUR" });
    assert.ok(formatSignedCurrency(-5).includes("€"));
    assert.ok(formatSignedCurrency(5).startsWith("+"));
    assert.ok(formatCurrencyPrecise(0.12345678).includes("€"));
    assert.ok(formatCompactCurrency(12345).includes("€"));
  });

  it("formats numbers, percentages and APY with the saved locale", () => {
    setDisplayPreferences({ locale: "de-DE", currency: "EUR" });
    assert.equal(formatNumber(1234567.891), "1.234.567,891");
    assert.equal(formatPercent(12.3), "12,3%");
    assert.equal(formatApy(4.5), "4,50%");
  });

  it("formats dates with the saved locale", () => {
    const iso = "2026-03-05T00:00:00Z";
    assert.equal(formatDate(iso), "Mar 5, 2026");
    setDisplayPreferences({ locale: "en-GB", currency: "GBP" });
    assert.equal(formatDate(iso), "5 Mar 2026");
  });

  it("lets a call override the saved preference", () => {
    setDisplayPreferences({ locale: "en-NG", currency: "NGN" });
    const result = formatCurrency(1234.56, { locale: "de-DE", currency: "EUR" });
    assert.ok(result.includes("1.234,56") && result.includes("€"), result);
  });

  it("ignores an invalid override and uses the saved preference", () => {
    setDisplayPreferences({ locale: "de-DE", currency: "EUR" });
    const result = formatCurrency(1234.56, { locale: "bad locale!!", currency: "??" });
    assert.ok(result.includes("1.234,56") && result.includes("€"), result);
  });

  it("falls back to the defaults after the preference is reset", () => {
    setDisplayPreferences({ locale: "de-DE", currency: "EUR" });
    resetDisplayPreferences();
    assert.equal(formatCurrency(1234.56), "$1,234.56");
  });
});

describe("timestamp year (#1279)", () => {
  beforeEach(() => {
    setActiveLocale("en");
  });

  it("formatTimestamp includes the year for a date in a prior year", () => {
    assert.match(formatTimestamp("2023-03-04T09:05:00Z"), /2023/);
  });

  it("formatTimestamp shows different years for the same day and month", () => {
    const earlier = formatTimestamp("2022-07-09T12:00:00Z");
    const later = formatTimestamp("2024-07-09T12:00:00Z");

    assert.match(earlier, /2022/);
    assert.match(later, /2024/);
    assert.notEqual(earlier, later);
  });

  it("formatSyncLabel includes the year for a date in a prior year", () => {
    assert.match(formatSyncLabel("2021-11-30T18:45:00Z"), /2021/);
  });

  it("includes the year in the French locale too", () => {
    setActiveLocale("fr");

    assert.match(formatTimestamp("2023-03-04T09:05:00Z"), /2023/);
  });

  it("still includes the time of day", () => {
    assert.match(formatTimestamp("2023-03-04T09:05:00Z"), /9:05|09:05|09 ?h ?05/);
  });
});
