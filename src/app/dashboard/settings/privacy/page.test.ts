import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { render, cleanup } from "@testing-library/react";
import PrivacyPage from "./page";
import { I18nProvider } from "@/contexts/I18nContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { setupDomGlobals } from "@/test-setup";

setupDomGlobals();

function Providers({ children }: { children: React.ReactNode }) {
  return createElement(
    I18nProvider,
    null,
    createElement(CookieConsentProvider, null, children)
  );
}

test("PrivacyPage — hydration guard skeleton-to-content transition", () => {
  // 1. Initial mount (SSR) should return the skeleton
  const html = renderToString(createElement(Providers, null, createElement(PrivacyPage)));
  assert.ok(html.includes('aria-hidden="true"'), "Should render skeleton with aria-hidden");
  
  // 2. Client render (after hydration) should return the real content
  const { container } = render(createElement(Providers, null, createElement(PrivacyPage)));
  assert.ok(!container.innerHTML.includes('aria-hidden="true"'), "Skeleton should be gone");
  assert.ok(container.textContent?.includes("Cookie & Privacy Preferences"), "Content should be visible");
  cleanup();
});
