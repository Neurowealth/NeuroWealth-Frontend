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
      {
        id: "1",
        title: "Test",
        isRead: false,
        message: "Test message",
        timestamp: new Date().toISOString(),
        status: "info" as const,
      },
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

  it("filters out invalid items and keeps valid ones (per-item shape validation)", () => {
    const mixedStored = [
      {
        id: "valid-1",
        title: "Valid Title",
        message: "Valid Message",
        timestamp: "2026-01-01T00:00:00Z",
        status: "info",
        isRead: false,
      },
      { id: "invalid-1", title: 123 }, // invalid title type
      null, // invalid null
      "not-an-object", // invalid string
      {
        id: "valid-2",
        title: "Valid Title 2",
        message: "Valid Message 2",
        timestamp: "2026-01-01T00:00:00Z",
        status: "success",
        isRead: true,
      },
    ];
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(mixedStored));

    const { result } = renderHook(() => useNotifications());

    assert.equal(result.current.notifications.length, 2);
    assert.equal(result.current.notifications[0]?.id, "valid-1");
    assert.equal(result.current.notifications[1]?.id, "valid-2");

    // Storage should be overwritten with filtered set
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    assert.ok(stored);
    const parsed = JSON.parse(stored);
    assert.equal(parsed.length, 2);
    assert.equal(parsed[0].id, "valid-1");
    assert.equal(parsed[1].id, "valid-2");
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

  // #1042 — another tab's markAllAsRead/clear must reach this tab's state.
  it("re-syncs when another tab updates the notifications key", () => {
    const { result } = renderHook(() => useNotifications());
    assert.ok(result.current.unreadCount > 0);

    const allRead = result.current.notifications.map((n) => ({ ...n, isRead: true }));
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: NOTIFICATION_STORAGE_KEY,
          newValue: JSON.stringify(allRead),
        }),
      );
    });

    assert.equal(result.current.unreadCount, 0);
  });

  it("re-syncs to an empty list when another tab clears notifications", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: NOTIFICATION_STORAGE_KEY,
          newValue: JSON.stringify([]),
        }),
      );
    });

    assert.equal(result.current.notifications.length, 0);
  });

  it("ignores storage events for unrelated keys", () => {
    const { result } = renderHook(() => useNotifications());
    const before = result.current.notifications.length;

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "some-other-key", newValue: "[]" }),
      );
    });

    assert.equal(result.current.notifications.length, before);
  });

  // #1091 — same-tab instances (TopHeader + NotificationCenter) each hold their
  // own copy and never receive a `storage` event for writes made in this tab.
  describe("same-tab instance sync (#1091)", () => {
    it("propagates markAllAsRead from one instance to another without a remount", () => {
      const header = renderHook(() => useNotifications());
      const center = renderHook(() => useNotifications());

      assert.ok(header.result.current.unreadCount > 0);
      assert.ok(center.result.current.unreadCount > 0);

      act(() => {
        center.result.current.markAllAsRead();
      });

      assert.equal(center.result.current.unreadCount, 0);
      assert.equal(header.result.current.unreadCount, 0);

      center.unmount();
      header.unmount();
    });

    it("propagates markAsRead from one instance to another", () => {
      const header = renderHook(() => useNotifications());
      const center = renderHook(() => useNotifications());

      const targetId = center.result.current.notifications.find((n) => !n.isRead)?.id;
      assert.ok(targetId);
      const unreadBefore = header.result.current.unreadCount;

      act(() => {
        center.result.current.markAsRead(targetId);
      });

      assert.equal(header.result.current.unreadCount, unreadBefore - 1);

      center.unmount();
      header.unmount();
    });

    it("propagates clearNotifications from one instance to another", () => {
      const header = renderHook(() => useNotifications());
      const center = renderHook(() => useNotifications());

      act(() => {
        center.result.current.clearNotifications();
      });

      assert.equal(header.result.current.notifications.length, 0);
      assert.equal(header.result.current.unreadCount, 0);

      center.unmount();
      header.unmount();
    });

    it("propagates updates in both directions between instances", () => {
      const header = renderHook(() => useNotifications());
      const center = renderHook(() => useNotifications());

      act(() => {
        header.result.current.markAllAsRead();
      });
      assert.equal(center.result.current.unreadCount, 0);

      act(() => {
        center.result.current.clearNotifications();
      });
      assert.equal(header.result.current.notifications.length, 0);

      center.unmount();
      header.unmount();
    });
  });
});
