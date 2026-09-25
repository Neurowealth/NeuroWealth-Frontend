import { useCallback, useEffect, useRef, useState } from "react";
import { mockAuditService } from "@/lib/mock-audit";
import { logger } from "@/lib/logger";
import { useStorageSync } from "@/hooks/useStorageSync";

type SaveStatus = "idle" | "success" | "error";

interface UseSettingsFormOptions<T> {
  auditSection: string;
  loadDelayMs?: number;
  saveDelayMs?: number;
  statusResetMs?: number;
  /** Runs after the mocked save delay, before persisting. Throw to abort the save. */
  validate?: (draft: T) => void;
  onSaveSuccess?: (saved: T) => void;
  onSaveError?: (error: unknown) => void;
}

export function useSettingsForm<T>(
  storageKey: string,
  defaultValue: T,
  options: UseSettingsFormOptions<T>,
) {
  const [saved, setSaved] = useState<T>(defaultValue);
  const [draft, setDraft] = useState<T>(defaultValue);
  const [editing, _setEditing] = useState(false);
  const editingRef = useRef(false);
  const setEditing = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    _setEditing((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      editingRef.current = next;
      return next;
    });
  }, []);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [pageLoading, setPageLoading] = useState(true);

  // Callers may pass an inline default object; keeping it in a ref stops a new
  // identity on every render from re-running the initial load and clobbering
  // an in-progress draft.
  const defaultValueRef = useRef(defaultValue);
  defaultValueRef.current = defaultValue;

  const syncFromStorage = useCallback(() => {
    const fallback = defaultValueRef.current;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored == null) {
        setSaved(fallback);
        if (!editingRef.current) {
          setDraft(fallback);
        }
        return;
      }

      const data = JSON.parse(stored) as T;
      setSaved(data);
      if (!editingRef.current) {
        setDraft(data);
      }
    } catch (error) {
      logger.error("Failed to load saved settings from localStorage", {
        storageKey,
        error,
      });
      setSaved(fallback);
      if (!editingRef.current) {
        setDraft(fallback);
      }
    }
  }, [storageKey]);

  useStorageSync(storageKey, () => {
    if (!editingRef.current) {
      syncFromStorage();
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      syncFromStorage();
      setPageLoading(false);
    }, options.loadDelayMs ?? 600);
    return () => clearTimeout(timer);
  }, [options.loadDelayMs, syncFromStorage]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      await new Promise((resolve) => setTimeout(resolve, options.saveDelayMs ?? 600));
      options.validate?.(draft);
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setSaved(draft);
      if (typeof window !== "undefined") {
        try {
          const EventCtor = window.Event || Event;
          const storagePayload = {
            key: storageKey,
            newValue: JSON.stringify(draft),
          };
          let storageEvent: Event;
          if (typeof window.StorageEvent === "function") {
            storageEvent = new window.StorageEvent("storage", storagePayload);
          } else if (typeof StorageEvent === "function") {
            storageEvent = new StorageEvent("storage", storagePayload);
          } else {
            storageEvent = Object.assign(new EventCtor("storage"), storagePayload);
          }
          window.dispatchEvent(storageEvent);
          window.dispatchEvent(new EventCtor("notification-preferences-updated"));
        } catch {
          // ignore dispatch issues in non-standard test environments
        }
      }
      setStatus("success");
      setEditing(false);
      mockAuditService.logEvent("settings_change", {
        section: options.auditSection,
        changes: draft,
      });
      options.onSaveSuccess?.(draft);
      setTimeout(() => setStatus("idle"), options.statusResetMs ?? 3000);
    } catch (error) {
      logger.error("settings_save_failed", {
        auditSection: options.auditSection,
        storageKey,
        error,
      });
      setStatus("error");
      options.onSaveError?.(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(saved);
    setEditing(false);
    setStatus("idle");
  };

  return {
    saved,
    setSaved,
    draft,
    setDraft,
    editing,
    setEditing,
    saving,
    setSaving,
    status,
    setStatus,
    pageLoading,
    isDirty,
    handleSave,
    handleCancel,
  };
}
