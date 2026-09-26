import { useState } from "react";
import { Notification, MOCK_NOTIFICATIONS } from "@/lib/mock-notifications";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const NOTIFICATION_STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS_LIST;

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

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([]));
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
