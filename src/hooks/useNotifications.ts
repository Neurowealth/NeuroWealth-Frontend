import { useState } from "react";
import { Notification, MOCK_NOTIFICATIONS } from "@/lib/mock-notifications";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === "undefined") return MOCK_NOTIFICATIONS;
    const stored = localStorage.getItem("nw-notifications");
    if (stored) return JSON.parse(stored);
    localStorage.setItem("nw-notifications", JSON.stringify(MOCK_NOTIFICATIONS));
    return MOCK_NOTIFICATIONS;
  });
  const [loading] = useState(false);

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage.setItem("nw-notifications", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage.setItem("nw-notifications", JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("nw-notifications", JSON.stringify([]));
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
