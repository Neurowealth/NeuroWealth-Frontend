import "@/test-utils/jsdom-setup";

import assert from "node:assert/strict";
import test from "node:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { CookieConsentProvider, useCookieConsent } from "./CookieConsentContext";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

test.afterEach(() => {
  localStorage.clear();
});

test("CookieConsentContext does not commit state when localStorage.setItem throws", () => {
  let latestContext: ReturnType<typeof useCookieConsent> | undefined;

  function Consumer() {
    latestContext = useCookieConsent();
    return createElement("div", null, latestContext.consentState.status);
  }

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  const originalSetItem = window.Storage.prototype.setItem;
  window.Storage.prototype.setItem = () => {
    throw new Error("QuotaExceededError: storage is full");
  };

  try {
    act(() => {
      root.render(
        createElement(CookieConsentProvider, null, createElement(Consumer))
      );
    });

    assert.equal(latestContext?.consentState.status, "pending");
    assert.equal(latestContext?.consentState.preferences.analytics, false);
    assert.equal(latestContext?.consentState.preferences.marketing, false);

    // Attempt acceptAll while setItem throws
    act(() => {
      latestContext?.acceptAll();
    });

    // Consent state must remain unchanged because write failed
    assert.equal(latestContext?.consentState.status, "pending");
    assert.equal(latestContext?.consentState.preferences.analytics, false);
    assert.equal(latestContext?.consentState.preferences.marketing, false);

    // Attempt savePreferences while setItem throws
    act(() => {
      latestContext?.savePreferences({ analytics: true, marketing: true });
    });

    assert.equal(latestContext?.consentState.status, "pending");
    assert.equal(latestContext?.consentState.preferences.analytics, false);

    // Attempt rejectAll while setItem throws
    act(() => {
      latestContext?.rejectAll();
    });

    assert.equal(latestContext?.consentState.status, "pending");
  } finally {
    window.Storage.prototype.setItem = originalSetItem;
    act(() => root.unmount());
    container.remove();
  }
});
