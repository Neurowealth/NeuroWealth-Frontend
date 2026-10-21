import { useCallback, useEffect, useState } from "react";
import { Notification, MOCK_NOTIFICATIONS } from "@/lib/mock-notifications";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useStorageSync } from "@/hooks/useStorageSync";

const NOTIFICATION_STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS_LIST;

/**
 * Same-tab change signal (#1091). The `storage` event only reaches *other*
 * tabs, so every mounted useNotifications instance (TopHeader, NotificationCenter,
 * NotificationToggle) would otherwise keep its own stale copy until remount.
 */
const NOTIFICATIONS_CHANGED_EVENT = "nw:notifications-changed";

function persistNotifications(notifications: Notification[]) {
  const serialized = JSON.stringify(notifications);
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, serialized);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new window.CustomEvent<string>(NOTIFICATIONS_CHANGED_EVENT, { detail: serialized }),
    );
  }
}

function isValidNotification(item: unknown): item is Notification {
  if (typeof item !== "object" || item === null) return false;
  const notification = item as Record<string, unknown>;
  return (
    typeof notification.id === "string" &&
    typeof notification.title === "string" &&
    typeof notification.message === "string" &&
    typeof notification.timestamp === "string" &&
    typeof notification.status === "string" &&
    typeof notification.isRead === "boolean" &&
    (notification.action === undefined ||
      (typeof notification.action === "object" &&
        notification.action !== null &&
        typeof (notification.action as Record<string, unknown>).label === "string" &&
        typeof (notification.action as Record<string, unknown>).href === "string"))
  );
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === "undefined") return MOCK_NOTIFICATIONS;
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
          localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
          return MOCK_NOTIFICATIONS;
        }
        // Validate each item's shape
        const validNotifications = parsed.filter(isValidNotification);
        if (validNotifications.length !== parsed.length) {
          // Some items were invalid - replace with validated set
          localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(validNotifications));
          return validNotifications.length > 0 ? validNotifications : MOCK_NOTIFICATIONS;
        }
        return validNotifications;
      } catch {
        // Malformed JSON - fallback to mock and clear corrupted storage
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
        return MOCK_NOTIFICATIONS;
      }
    }
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(MOCK_NOTIFICATIONS));
    return MOCK_NOTIFICATIONS;
  });
  const [loading] = useState(false);

  // Rehydrate when another tab marks/clears notifications. Read-only here:
  // writing back from a storage event would echo between open tabs.
  const syncNotifications = useCallback((nextValue: string | null) => {
    if (nextValue == null) {
      setNotifications(MOCK_NOTIFICATIONS);
      return;
    }

    try {
      const parsed = JSON.parse(nextValue);
      setNotifications(
        Array.isArray(parsed) ? parsed.filter(isValidNotification) : MOCK_NOTIFICATIONS,
      );
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  useStorageSync(NOTIFICATION_STORAGE_KEY, syncNotifications);

  // Stay in step with other instances in this tab — same-tab writes never
  // produce a `storage` event, so the writer broadcasts instead.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleSameTabChange = (event: Event) => {
      const { detail } = event as CustomEvent<string>;
      if (typeof detail !== "string") {
        return;
      }
      syncNotifications(detail);
    };

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleSameTabChange);
    return () =>
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleSameTabChange);
  }, [syncNotifications]);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    persistNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    persistNotifications(updated);
  };

  const clearNotifications = () => {
    const updated: Notification[] = [];
    setNotifications(updated);
    persistNotifications(updated);
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount: notifications.filter((n) => !n.isRead).length,
  };
}
