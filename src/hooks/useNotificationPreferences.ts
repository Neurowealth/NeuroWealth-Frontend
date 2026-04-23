import { useState } from "react";
import { NotificationPreferences, DEFAULT_PREFERENCES } from "@/lib/mock-preferences";

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES;
    const stored = localStorage.getItem("nw-notification-preferences");
    return stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
  });
  const [loading] = useState(false);

  const updatePreference = (
    section: "categories" | "channels",
    key: string,
    value: boolean
  ) => {
    const updated = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: value,
      },
    };
    setPreferences(updated);
    localStorage.setItem("nw-notification-preferences", JSON.stringify(updated));
  };

  return {
    preferences,
    loading,
    updatePreference,
  };
}
