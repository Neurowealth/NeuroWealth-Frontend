import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useNotifications } from "./useNotifications";
import { STORAGE_KEYS } from "@/lib/storage-keys";

const NOTIFICATION_STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS_LIST;

describe("useNotifications", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("initializes with MOCK_NOTIFICATIONS when storage is empty", () => {
    const { result } = renderHook(() => useNotifications());

    assert.ok(result.current.notifications.length > 0);
    assert.ok(result.current.unreadCount >= 0);
  });

  it("retrieves notifications from localStorage if available", () => {
    const mockNotifications = [
      { id: "1", title: "Test", isRead: false, message: "Test message", timestamp: new Date().toISOString() },
    ];
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(mockNotifications));

    const { result } = renderHook(() => useNotifications());

    assert.equal(result.current.notifications.length, 1);
    assert.equal(result.current.notifications[0].id, "1");
  });

  it("marks notification as read", () => {
    const { result } = renderHook(() => useNotifications());

    const firstNotificationId = result.current.notifications[0]?.id;
    const initialUnreadCount = result.current.unreadCount;

    act(() => {
      result.current.markAsRead(firstNotificationId);
    });

    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    const parsed = JSON.parse(stored || "[]");
    const markedNotification = parsed.find(
      (n: { id: string; isRead: boolean }) => n.id === firstNotificationId,
    );

    assert.equal(markedNotification?.isRead, true);
  });

  it("marks all notifications as read", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.markAllAsRead();
    });

    assert.equal(result.current.unreadCount, 0);
    result.current.notifications.forEach((n: { isRead: boolean }) => {
      assert.equal(n.isRead, true);
    });
  });

  it("clears all notifications", () => {
    const { result } = renderHook(() => useNotifications());

    assert.ok(result.current.notifications.length > 0);

    act(() => {
      result.current.clearNotifications();
    });

    assert.equal(result.current.notifications.length, 0);
  });

  // Regression test for Issue #544: malformed JSON
  it("gracefully handles malformed JSON in localStorage", () => {
    // Simulate corrupted/malformed JSON in storage
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, "{invalid json content}");

    // Should not throw and should return MOCK_NOTIFICATIONS
    const { result } = renderHook(() => useNotifications());

    assert.ok(result.current.notifications.length > 0);
    assert.ok(result.current.unreadCount >= 0);

    // Storage should be cleared of corrupted data
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    assert.ok(stored);
    // Verify it's valid JSON now
    const parsed = JSON.parse(stored);
    assert.ok(Array.isArray(parsed));
  });

  // Additional malformed JSON test cases
  it("handles truncated JSON arrays in localStorage", () => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, '[{"id":"1",');

    const { result } = renderHook(() => useNotifications());

    assert.ok(result.current.notifications.length > 0);
    // Should have reset to MOCK_NOTIFICATIONS due to parse error
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    const parsed = JSON.parse(stored || "[]");
    assert.ok(Array.isArray(parsed));
  });

  it("handles null value from malformed parse", () => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, "null");

    const { result } = renderHook(() => useNotifications());

    assert.ok(result.current.notifications.length > 0);
  });

  it("handles stale schema (non-array) gracefully", () => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, '{"old":"schema"}');

    const { result } = renderHook(() => useNotifications());

    assert.ok(result.current.notifications.length > 0);
  });

  it("persists changes to localStorage", () => {
    const { result } = renderHook(() => useNotifications());

    const firstNotificationId = result.current.notifications[0]?.id;

    act(() => {
      result.current.markAsRead(firstNotificationId);
    });

    // Verify persistence
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    assert.ok(stored);
    const parsed = JSON.parse(stored);
    const notif = parsed.find(
      (n: { id: string; isRead: boolean }) => n.id === firstNotificationId,
    );
    assert.equal(notif.isRead, true);
  });
});
