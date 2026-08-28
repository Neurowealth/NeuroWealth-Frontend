import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { CookieConsentSettings } from "./CookieConsentSettings";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { setupDomGlobals } from "@/test-setup";

setupDomGlobals();

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
  cleanup();
});
