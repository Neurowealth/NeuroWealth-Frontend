import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { render, cleanup, waitFor } from "@testing-library/react";
import { CookieConsentSettings } from "./CookieConsentSettings";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { setupDomGlobals } from "@/test-setup";
import { STORAGE_KEYS } from "@/lib/storage-keys";

setupDomGlobals();

test.afterEach(() => {
  localStorage.clear();
  cleanup();
});

test("CookieConsentSettings — renders preferences and trigger", () => {
  const { container } = render(
    createElement(CookieConsentProvider, null, createElement(CookieConsentSettings))
  );

  // Status is pending by default
  assert.ok(container.textContent?.includes("No preference set"));
  
  // Should render the 4 preference rows
  assert.ok(container.textContent?.includes("Strictly Necessary"));
  assert.ok(container.textContent?.includes("Analytics"));
  assert.ok(container.textContent?.includes("Marketing"));
  assert.ok(container.textContent?.includes("Personalization"));
  
  // Should render the manage preferences button
  assert.ok(container.textContent?.includes("Manage preferences"));
});

test("CookieConsentSettings resets malformed stored consent state", async () => {
  localStorage.setItem(
    STORAGE_KEYS.COOKIE_CONSENT,
    JSON.stringify({ status: "accepted" }),
  );

  const { container } = render(
    createElement(CookieConsentProvider, null, createElement(CookieConsentSettings)),
  );

  await waitFor(() => {
    assert.ok(container.textContent?.includes("No preference set"));
    assert.equal(localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT), null);
  });
});
