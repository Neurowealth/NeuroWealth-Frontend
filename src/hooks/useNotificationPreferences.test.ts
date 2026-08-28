import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useNotificationPreferences } from "./useNotificationPreferences";
import { DEFAULT_PREFERENCES } from "@/lib/mock-preferences";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const NOTIFICATION_PREFERENCES_STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS;

describe("useNotificationPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("initializes with DEFAULT_PREFERENCES when storage is empty", () => {
    const { result } = renderHook(() => useNotificationPreferences());

    assert.deepEqual(result.current.preferences, DEFAULT_PREFERENCES);
  });

  it("retrieves preferences from localStorage if available", () => {
    const stored = {
      categories: { transactions: false, system: true, promotions: true },
      channels: { inApp: true, email: false, push: true },
    };
    localStorage.setItem(NOTIFICATION_PREFERENCES_STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useNotificationPreferences());

    assert.deepEqual(result.current.preferences, stored);
  });

  // Regression test for Issue #686: malformed JSON must not crash the hook.
  it("gracefully handles malformed JSON in localStorage", () => {
    localStorage.setItem(NOTIFICATION_PREFERENCES_STORAGE_KEY, "{invalid json content}");

    assert.doesNotThrow(() => {
      const { result } = renderHook(() => useNotificationPreferences());
      assert.deepEqual(result.current.preferences, DEFAULT_PREFERENCES);
    });

    // Storage should be repaired with valid JSON afterwards.
    const stored = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);
    assert.ok(stored);
    assert.deepEqual(JSON.parse(stored), DEFAULT_PREFERENCES);
  });

  it("handles truncated JSON in localStorage", () => {
    localStorage.setItem(NOTIFICATION_PREFERENCES_STORAGE_KEY, '{"categories":{');

    const { result } = renderHook(() => useNotificationPreferences());

    assert.deepEqual(result.current.preferences, DEFAULT_PREFERENCES);
  });

  it("updates categories, channels, and emailDigest without clobbering other sections", () => {
    const { result } = renderHook(() => useNotificationPreferences());

    act(() => {
      result.current.updatePreference("categories", "promotions", true);
      result.current.updatePreference("channels", "email", false);
      result.current.updatePreference("emailDigest", "weeklyDigest", false);
    });

    const expected = {
      ...DEFAULT_PREFERENCES,
      categories: { ...DEFAULT_PREFERENCES.categories, promotions: true },
      channels: { ...DEFAULT_PREFERENCES.channels, email: false },
      emailDigest: { ...DEFAULT_PREFERENCES.emailDigest, weeklyDigest: false },
    };
    assert.deepEqual(result.current.preferences, expected);
    assert.deepEqual(
      JSON.parse(localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY)!),
      expected,
    );
  });
});
