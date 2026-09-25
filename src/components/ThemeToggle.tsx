"use client";

import { useTheme } from "@/contexts/ThemeProvider";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, mounted } = useTheme();

  function toggle() {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme(resolvedTheme === "light" ? "dark" : "light");
    }
  }

  if (!mounted) {
    return <div className="w-[34px] h-[34px]" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
      aria-label={
        resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
    >
      {resolvedTheme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
