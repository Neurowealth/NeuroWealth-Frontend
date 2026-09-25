import { useState } from "react";
import { Notification, MOCK_NOTIFICATIONS } from "@/lib/mock-notifications";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const NOTIFICATION_STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS_LIST;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === "undefined") return MOCK_NOTIFICATIONS;
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : MOCK_NOTIFICATIONS;
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
