import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useSettingsForm } from "./useSettingsForm";
import { logger } from "@/lib/logger";

interface Draft {
  enabled: boolean;
}

function flush(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("useSettingsForm", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it("loads defaults when storage is empty, then clears pageLoading", async () => {
    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test" }),
    );

    assert.equal(result.current.pageLoading, true);

    await act(async () => {
      await flush(650);
    });

    assert.equal(result.current.pageLoading, false);
    assert.deepEqual(result.current.saved, { enabled: false });
  });

  it("hydrates saved/draft from localStorage", async () => {
    localStorage.setItem("test-key", JSON.stringify({ enabled: true }));

    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test" }),
    );

    await act(async () => {
      await flush(650);
    });

    assert.deepEqual(result.current.saved, { enabled: true });
    assert.deepEqual(result.current.draft, { enabled: true });
  });
  it("logs and keeps defaults when stored settings JSON is malformed", async () => {
    localStorage.setItem("bad-settings", "{not valid json");
    const errorSpy = mock.method(logger, "error");

    const { result } = renderHook(() =>
      useSettingsForm<Draft>("bad-settings", { enabled: false }, { auditSection: "test", loadDelayMs: 0 }),
    );

    await act(async () => {
      await flush(0);
    });

    assert.equal(result.current.pageLoading, false);
    assert.deepEqual(result.current.saved, { enabled: false });
    assert.deepEqual(result.current.draft, { enabled: false });
    assert.equal(errorSpy.mock.callCount(), 1);

    const [message, context] = errorSpy.mock.calls[0].arguments;
    assert.equal(message, "Failed to load saved settings from localStorage");
    assert.equal((context as { storageKey: string }).storageKey, "bad-settings");
    assert.ok((context as { error: unknown }).error instanceof SyntaxError);
  });

  it("tracks isDirty and persists on handleSave", async () => {
    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test", saveDelayMs: 0 }),
    );

    await act(async () => {
      await flush(650);
    });

    act(() => {
      result.current.setDraft({ enabled: true });
    });
    assert.equal(result.current.isDirty, true);

    await act(async () => {
      await result.current.handleSave();
    });

    assert.equal(result.current.isDirty, false);
    assert.equal(result.current.status, "success");
    assert.deepEqual(JSON.parse(localStorage.getItem("test-key")!), { enabled: true });
  });

  it("handleCancel reverts draft to saved", async () => {
    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test" }),
    );

    await act(async () => {
      await flush(650);
    });

    act(() => {
      result.current.setDraft({ enabled: true });
      result.current.setEditing(true);
    });

    act(() => {
      result.current.handleCancel();
    });

    assert.deepEqual(result.current.draft, { enabled: false });
    assert.equal(result.current.editing, false);
  });

  it("aborts the save and sets error status when validate throws", async () => {
    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, {
        auditSection: "test",
        saveDelayMs: 0,
        validate: () => {
          throw new Error("blocked");
        },
      }),
    );

    await act(async () => {
      await flush(650);
    });

    act(() => {
      result.current.setDraft({ enabled: true });
    });

    await act(async () => {
      await result.current.handleSave();
    });

    assert.equal(result.current.status, "error");
    assert.equal(localStorage.getItem("test-key"), null);
  });

  it("useStorageSync does not overwrite draft while editing (#851)", async () => {
    localStorage.setItem("test-key", JSON.stringify({ enabled: false }));

    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test", loadDelayMs: 0 }),
    );

    await act(async () => {
      await flush(0);
    });

    act(() => {
      result.current.setEditing(true);
      result.current.setDraft({ enabled: true });
    });

    assert.equal(result.current.editing, true);
    assert.deepEqual(result.current.draft, { enabled: true });

    // Simulate another tab writing a new value to the same key
    localStorage.setItem("test-key", JSON.stringify({ enabled: false }));

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test-key",
          newValue: JSON.stringify({ enabled: false }),
        }),
      );
      await flush(0);
    });

    // The in-progress draft must not be clobbered while the user is editing
    assert.deepEqual(result.current.draft, { enabled: true });
    assert.equal(result.current.editing, true);
  });

  it("manual storage listener does not overwrite saved while editing (#914)", async () => {
    localStorage.setItem("test-key", JSON.stringify({ enabled: false }));

    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test", loadDelayMs: 0 }),
    );

    await act(async () => {
      await flush(0);
    });

    act(() => {
      result.current.setEditing(true);
      result.current.setDraft({ enabled: true });
    });

    assert.equal(result.current.editing, true);
    assert.deepEqual(result.current.draft, { enabled: true });
    assert.deepEqual(result.current.saved, { enabled: false });

    // Simulate another tab writing a new value to the same key
    localStorage.setItem("test-key", JSON.stringify({ enabled: false }));

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test-key",
          newValue: JSON.stringify({ enabled: false }),
        }),
      );
      await flush(0);
    });

    // Saved must not be overwritten while editing
    assert.deepEqual(result.current.saved, { enabled: false });
    assert.equal(result.current.editing, true);
  });

  it("handleCancel reverts to pre-edit value after cross-tab storage event (#914)", async () => {
    localStorage.setItem("test-key", JSON.stringify({ enabled: false }));

    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test", loadDelayMs: 0 }),
    );

    await act(async () => {
      await flush(0);
    });

    act(() => {
      result.current.setEditing(true);
      result.current.setDraft({ enabled: true });
    });

    assert.equal(result.current.editing, true);
    assert.deepEqual(result.current.draft, { enabled: true });
    assert.deepEqual(result.current.saved, { enabled: false });

    // Simulate another tab writing a different value
    localStorage.setItem("test-key", JSON.stringify({ enabled: false }));

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test-key",
          newValue: JSON.stringify({ enabled: false }),
        }),
      );
      await flush(0);
    });

    // Cancel should revert to the pre-edit value, not the other tab's value
    act(() => {
      result.current.handleCancel();
    });

    assert.deepEqual(result.current.draft, { enabled: false });
    assert.equal(result.current.editing, false);
  });

  it("synchronizes saved and draft when storage event fires while editing is false (#966)", async () => {
    localStorage.setItem("test-key", JSON.stringify({ enabled: false }));

    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test", loadDelayMs: 0 }),
    );

    await act(async () => {
      await flush(0);
    });

    assert.equal(result.current.editing, false);
    assert.deepEqual(result.current.saved, { enabled: false });
    assert.deepEqual(result.current.draft, { enabled: false });

    // Simulate cross-tab storage change
    localStorage.setItem("test-key", JSON.stringify({ enabled: true }));

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "test-key",
          newValue: JSON.stringify({ enabled: true }),
        }),
      );
      await flush(0);
    });

    assert.deepEqual(result.current.saved, { enabled: true });
    assert.deepEqual(result.current.draft, { enabled: true });
  });

  it("handleSave dispatches a storage event carrying key and newValue (#966)", async () => {
    let capturedEvent: StorageEvent | null = null;
    const handler = (e: Event) => {
      capturedEvent = e as StorageEvent;
    };
    window.addEventListener("storage", handler);

    try {
      const { result } = renderHook(() =>
        useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test", saveDelayMs: 0 }),
      );

      await act(async () => {
        await flush(650);
      });

      act(() => {
        result.current.setDraft({ enabled: true });
      });

      await act(async () => {
        await result.current.handleSave();
      });

      assert.ok(capturedEvent, "expected a storage event to be dispatched");
      assert.equal((capturedEvent as StorageEvent).key, "test-key");
      assert.equal((capturedEvent as StorageEvent).newValue, JSON.stringify({ enabled: true }));
    } finally {
      window.removeEventListener("storage", handler);
    }
  });

  it("ignores storage events for other keys when editing is false (#966)", async () => {
    localStorage.setItem("test-key", JSON.stringify({ enabled: false }));
    localStorage.setItem("other-key", JSON.stringify({ enabled: true }));

    const { result } = renderHook(() =>
      useSettingsForm<Draft>("test-key", { enabled: false }, { auditSection: "test", loadDelayMs: 0 }),
    );

    await act(async () => {
      await flush(0);
    });

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "other-key",
          newValue: JSON.stringify({ enabled: true }),
        }),
      );
      await flush(0);
    });

    assert.deepEqual(result.current.saved, { enabled: false });
    assert.deepEqual(result.current.draft, { enabled: false });
  });
});
