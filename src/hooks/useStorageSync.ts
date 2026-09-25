import { useEffect } from "react";

/**
 * Mirrors AuthContext's storage sync pattern for any hook backed by localStorage.
 * When another tab mutates the same key, re-read and rehydrate the client state.
 */
export function useStorageSync(
  key: string,
  onChange: (value: string | null) => void,
) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key !== key) {
        return;
      }
      onChange(event.newValue ?? null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, onChange]);
}
