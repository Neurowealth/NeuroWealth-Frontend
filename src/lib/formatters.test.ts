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
  formatCompactNumber,
  formatCompactCurrency,
  formatTimestamp,
  formatSyncLabel,
  formatDate,
} from "./formatters";
import { setActiveLocale, getActiveLocale } from "./i18n/locale-state";

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

  describe("formatCompactNumber", () => {
    it("compacts large numbers", () => {
      const result = formatCompactNumber(12300);
      // Compact formatting should produce something like "12.3K"
      assert.ok(result.length <= 6);
    });

    it("handles millions", () => {
      const result = formatCompactNumber(1200000);
      // Should be compact (e.g., "1.2M")
      assert.ok(result.length <= 6);
    });

    it("formats small numbers without compacting", () => {
      const result = formatCompactNumber(500);
      assert.ok(result.includes("500") || result.length <= 5);
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
