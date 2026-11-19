import { useEffect, useRef } from "react";

/**
 * Mirrors AuthContext's storage sync pattern for any hook backed by localStorage.
 * When another tab mutates the same key, re-read and rehydrate the client state.
 *
 * The latest `onChange` is kept in a ref so callers can pass an inline arrow
 * without the window listener being torn down and re-attached on every render.
 */
export function useStorageSync(
  key: string,
  onChange: (value: string | null) => void,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key !== key) {
        return;
      }
      onChangeRef.current(event.newValue ?? null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);
}
