import assert from "node:assert/strict";
import test from "node:test";
import React, { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";
import { dictionaries } from "@/lib/i18n/messages";
import HelpPage from "./page";

setupDomGlobals();
// tsx compiles the page's JSX with the classic runtime, which expects a global React.
Object.assign(globalThis, { React });

/**
 * Regression test for issue #934: the Transaction Help tab's "Contact Support"
 * button used to navigate to a nonexistent /help#support route. It must now
 * switch the Help Center to its Contact Support tab in place.
 */
test("help page — Contact Support in Transaction Help opens the contact tab", () => {
  const guidance = dictionaries.en.help.guidance;
  const { getByRole, getByText } = render(
    createElement(I18nProvider, null, createElement(HelpPage)),
  );

  fireEvent.click(getByRole("tab", { name: "Transaction Help" }));
  fireEvent.click(getByText(guidance.issues[0].title));
  fireEvent.click(getByRole("button", { name: guidance.contactSupport }));

  const contactTab = getByRole("tab", { name: "Contact Support" });
  assert.equal(contactTab.getAttribute("aria-selected"), "true");

  const contactPanel = document.getElementById("help-panel-contact");
  const transactionsPanel = document.getElementById("help-panel-transactions");
  assert.equal(contactPanel?.hidden, false);
  assert.equal(transactionsPanel?.hidden, true);

  cleanup();
});
