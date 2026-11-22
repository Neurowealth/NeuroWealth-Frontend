import "@/test-utils/jsdom-setup";

import assert from "node:assert/strict";
import test from "node:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, useTheme } from "./ThemeProvider";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function ThemeProbe() {
  const { theme, resolvedTheme } = useTheme();
  return createElement("span", { id: "theme-probe" }, `${theme}:${resolvedTheme}`);
}

test("ThemeProvider mounts safely and falls back to light when matchMedia is removed", () => {
  const originalWindowMatchMedia = globalThis.window.matchMedia;
  const originalGlobalMatchMedia = globalThis.matchMedia;

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    // Remove matchMedia to simulate environments without matchMedia support
    // @ts-expect-error testing missing matchMedia
    delete globalThis.window.matchMedia;
    // @ts-expect-error testing missing matchMedia
    delete globalThis.matchMedia;

    act(() => {
      root.render(createElement(ThemeProvider, null, createElement(ThemeProbe)));
    });

    assert.ok(container.textContent?.includes("system:light"));
  } finally {
    act(() => root.unmount());
    container.remove();
    Object.defineProperty(globalThis.window, "matchMedia", {
      value: originalWindowMatchMedia,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "matchMedia", {
      value: originalGlobalMatchMedia,
      writable: true,
      configurable: true,
    });
  }
});

test("ThemeProvider mounts and resolves dark theme when matchMedia prefers dark", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  const darkMatchMedia = (query: string) => ({
    matches: query.includes("prefers-color-scheme: dark"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });

  const originalWindowMatchMedia = globalThis.window.matchMedia;
  const originalGlobalMatchMedia = globalThis.matchMedia;

  try {
    Object.defineProperty(globalThis.window, "matchMedia", {
      value: darkMatchMedia,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "matchMedia", {
      value: darkMatchMedia,
      writable: true,
      configurable: true,
    });

    act(() => {
      root.render(createElement(ThemeProvider, null, createElement(ThemeProbe)));
    });

    assert.ok(container.textContent?.includes("system:dark"));
  } finally {
    act(() => root.unmount());
    container.remove();
    Object.defineProperty(globalThis.window, "matchMedia", {
      value: originalWindowMatchMedia,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "matchMedia", {
      value: originalGlobalMatchMedia,
      writable: true,
      configurable: true,
    });
  }
});
