import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { act, renderHook } from "@/test-utils/render-hook";
import { DEFAULT_PREFERENCES, type NotificationPreferences } from "@/lib/mock-preferences";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useSettingsForm } from "@/hooks/useSettingsForm";

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
