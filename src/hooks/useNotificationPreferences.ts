import { useCallback, useState } from "react";
import { NotificationPreferences, DEFAULT_PREFERENCES } from "@/lib/mock-preferences";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useStorageSync } from "@/hooks/useStorageSync";

const NOTIFICATION_PREFERENCES_STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS;

function mergeStoredPreferences(value: unknown): NotificationPreferences {
  const parsed = typeof value === "object" && value !== null ? (value as Partial<NotificationPreferences>) : {};

  return {
    ...DEFAULT_PREFERENCES,
    ...parsed,
    categories: { ...DEFAULT_PREFERENCES.categories, ...(parsed.categories ?? {}) },
    channels: { ...DEFAULT_PREFERENCES.channels, ...(parsed.channels ?? {}) },
    emailDigest: {
      ...DEFAULT_PREFERENCES.emailDigest,
      ...(parsed.emailDigest ?? {}),
    },
  };
}

function readStoredPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  const stored = localStorage.getItem(NOTIFICATION_PREFERENCES_STORAGE_KEY);
  if (!stored) return DEFAULT_PREFERENCES;

  try {
    return mergeStoredPreferences(JSON.parse(stored));
  } catch {
    localStorage.setItem(
      NOTIFICATION_PREFERENCES_STORAGE_KEY,
      JSON.stringify(DEFAULT_PREFERENCES),
    );
    return DEFAULT_PREFERENCES;
  }
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(readStoredPreferences);
  const [loading] = useState(false);

  const syncPreferences = useCallback((nextValue: string | null) => {
    if (nextValue == null) {
      setPreferences(DEFAULT_PREFERENCES);
      return;
    }

    try {
      setPreferences(mergeStoredPreferences(JSON.parse(nextValue)));
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, []);

  useStorageSync(NOTIFICATION_PREFERENCES_STORAGE_KEY, syncPreferences);



  const updatePreference = (
    section: "categories" | "channels" | "emailDigest",
    key: string,
    value: boolean,
  ) => {
    setPreferences((current) => {
      const updated = {
        ...current,
        [section]: {
          ...current[section],
          [key]: value,
        },
      };
      localStorage.setItem(
        NOTIFICATION_PREFERENCES_STORAGE_KEY,
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  return {
    preferences,
    loading,
    updatePreference,
  };
}
