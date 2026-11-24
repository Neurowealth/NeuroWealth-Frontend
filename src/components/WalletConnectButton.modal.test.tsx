import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";
import { dictionaries } from "@/lib/i18n/messages";
import { ToastProvider } from "@/components/notifications/ToastProvider";
import WalletConnectButton from "./WalletConnectButton";

setupDomGlobals();
Object.assign(globalThis, { React, NodeFilter: window.NodeFilter });

test("customizes successive wallet modals with one mounted button", async (t) => {
  const view = render(
    <I18nProvider>
      <ToastProvider><WalletConnectButton /></ToastProvider>
    </I18nProvider>,
  );
  t.after(() => view.unmount());

  for (const opening of ["first", "second"]) {
    const modal = document.createElement("div");
    modal.className = "swk-modal";
    const help = document.createElement("p");
    help.textContent = "Learn more";
    modal.append(help);
    document.body.append(modal);
    try {
      await waitFor(() => {
        assert.equal(help.style.display, "none", opening + " modal boilerplate");
        assert.equal(
          modal.querySelector(".custom-neurowealth-message")?.textContent,
          dictionaries.en.walletConnection.button.modalMessage,
        );
      });
    } finally {
      modal.remove();
    }
  }
});
