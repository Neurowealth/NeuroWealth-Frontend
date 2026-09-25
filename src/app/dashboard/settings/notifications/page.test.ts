import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import React, { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { act, renderHook } from "@/test-utils/render-hook";
import { DEFAULT_PREFERENCES, type NotificationPreferences } from "@/lib/mock-preferences";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { I18nProvider } from "@/contexts/I18nContext";
import { ToastProvider } from "@/components/notifications/ToastProvider";
import { dictionaries } from "@/lib/i18n/messages";
import NotificationsSettingsPage from "./page";

// tsx compiles the page's JSX with the classic runtime, which expects a global React.
Object.assign(globalThis, { React });

function flush(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("notification settings loads, edits, and saves the shared NotificationPreferences shape", async () => {
  localStorage.clear();
  const stored = {
    ...DEFAULT_PREFERENCES,
    categories: { ...DEFAULT_PREFERENCES.categories, promotions: true },
  };
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(stored));

  const { result } = renderHook(() =>
    useSettingsForm<NotificationPreferences>(
      STORAGE_KEYS.NOTIFICATIONS,
      DEFAULT_PREFERENCES,
      { auditSection: "notifications", loadDelayMs: 0, saveDelayMs: 0 },
    ),
  );

  await act(async () => {
    await flush(0);
  });
  assert.deepEqual(result.current.draft, stored);

  act(() => {
    result.current.setDraft({
      ...result.current.draft,
      channels: { ...result.current.draft.channels, email: false },
    });
  });
  assert.equal(result.current.isDirty, true);

  await act(async () => {
    await result.current.handleSave();
  });

  const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)!);
  assert.equal(saved.channels.email, false);
  assert.equal(saved.categories.promotions, true);
  assert.deepEqual(saved.emailDigest, DEFAULT_PREFERENCES.emailDigest);

  const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  assert.match(source, /useSettingsForm<NotificationPreferences>/);
  assert.match(source, /STORAGE_KEYS\.NOTIFICATIONS/);
  assert.match(source, /\["emailDigest", "weeklyDigest"\]/);
  assert.match(source, /\["categories", "promotions"\]/);

  localStorage.clear();
});

/**
 * Regression test for issue #770: each notification toggle on the settings
 * page must expose its visible title as the switch's accessible name, so a
 * future edit can't silently drop PreferenceToggle's `label` prop again.
 */
test("notifications settings page — every toggle's accessible name matches its title", async () => {
  localStorage.clear();
  const channels = dictionaries.en.settings.notifications.channels;
  const expectedTitles = [
    channels.emailTitle,
    channels.transactionTitle,
    channels.weeklyTitle,
    channels.productTitle,
    channels.securityTitle,
  ];

  const { findAllByRole, getByRole } = render(
    createElement(
      I18nProvider,
      null,
      createElement(ToastProvider, null, createElement(NotificationsSettingsPage)),
    ),
  );

  const checkboxes = await findAllByRole("checkbox", {}, { timeout: 3000 });
  assert.equal(checkboxes.length, expectedTitles.length);

  for (const title of expectedTitles) {
    assert.ok(
      getByRole("checkbox", { name: title }),
      `expected a toggle with accessible name "${title}"`,
    );
  }

  cleanup();
  localStorage.clear();
});
