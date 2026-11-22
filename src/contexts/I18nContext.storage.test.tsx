import "@/test-utils/jsdom-setup";

import assert from "node:assert/strict";
import test from "node:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider, useI18n } from "@/contexts/I18nContext";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function I18nProbe({
  onReady,
}: {
  onReady?: (api: { setLocale: (next: string) => void }) => void;
}) {
  const { locale, setLocale } = useI18n();
  onReady?.({ setLocale });
  return createElement("span", { "data-testid": "locale" }, locale);
}

test("I18nProvider falls back to navigator.language and skips persistence when localStorage throws", () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(
    window,
    "localStorage",
  );
  const originalLanguage = Object.getOwnPropertyDescriptor(
    window.navigator,
    "language",
  );

  const throwingStorage = {
    getItem() {
      throw new DOMException("Storage access denied", "SecurityError");
    },
    setItem() {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    },
    removeItem() {
      throw new DOMException("Storage access denied", "SecurityError");
    },
    clear() {
      throw new DOMException("Storage access denied", "SecurityError");
    },
    key() {
      return null;
    },
    length: 0,
  };

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: throwingStorage,
  });
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    value: "fr-CA",
  });

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  let setLocaleFn: ((next: string) => void) | undefined;

  try {
    act(() => {
      root.render(
        createElement(
          I18nProvider,
          null,
          createElement(I18nProbe, {
            onReady: ({ setLocale }) => {
              setLocaleFn = setLocale;
            },
          }),
        ),
      );
    });

    assert.equal(container.textContent, "fr");
    assert.equal(document.documentElement.lang, "fr-FR");

    act(() => {
      setLocaleFn?.("en");
    });

    assert.equal(container.textContent, "en");
    assert.equal(document.documentElement.lang, "en-US");
  } finally {
    act(() => root.unmount());
    container.remove();
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
    if (originalLanguage) {
      Object.defineProperty(window.navigator, "language", originalLanguage);
    }
  }
});

test("I18nProvider defaults to 'en' when window.localStorage getter throws and navigator.language is unsupported", () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(
    window,
    "localStorage",
  );
  const originalLanguage = Object.getOwnPropertyDescriptor(
    window.navigator,
    "language",
  );

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("Storage disabled", "SecurityError");
    },
  });
  Object.defineProperty(window.navigator, "language", {
    configurable: true,
    value: "de-DE",
  });

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    act(() => {
      root.render(
        createElement(I18nProvider, null, createElement(I18nProbe)),
      );
    });

    assert.equal(container.textContent, "en");
    assert.equal(document.documentElement.lang, "en-US");
  } finally {
    act(() => root.unmount());
    container.remove();
    if (originalLocalStorage) {
      Object.defineProperty(window, "localStorage", originalLocalStorage);
    }
    if (originalLanguage) {
      Object.defineProperty(window.navigator, "language", originalLanguage);
    }
  }
});
