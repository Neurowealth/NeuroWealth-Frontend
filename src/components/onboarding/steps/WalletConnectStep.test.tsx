import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React, { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import WalletConnectStep from "./WalletConnectStep";
import { I18nProvider } from "@/contexts/I18nContext";
import { dictionaries } from "@/lib/i18n/messages";
import { setupDomGlobals } from "../../../test-setup";

setupDomGlobals();
Object.assign(globalThis, { React });

function renderStep() {
  cleanup();
  return render(
    createElement(
      I18nProvider,
      null,
      createElement(WalletConnectStep, { onNext: () => {}, onSkip: () => {} }),
    ),
  );
}

function getWalletCard(container: HTMLElement, name: string): HTMLElement {
  const cards = Array.from(container.querySelectorAll<HTMLElement>('[role="button"]'));
  const card = cards.find((c) => c.querySelector("h3")?.textContent === name);
  assert.ok(card, `expected a role="button" card for ${name}`);
  return card;
}

describe("WalletConnectStep aria-pressed", () => {
  it("marks every wallet card as not pressed initially", () => {
    const { container } = renderStep();

    for (const name of ["Freighter", "Albedo", "Ledger"]) {
      assert.equal(getWalletCard(container, name).getAttribute("aria-pressed"), "false");
    }
  });

  it("sets aria-pressed on the clicked wallet card only", () => {
    const { container } = renderStep();

    fireEvent.click(getWalletCard(container, "Albedo"));

    assert.equal(getWalletCard(container, "Albedo").getAttribute("aria-pressed"), "true");
    assert.equal(getWalletCard(container, "Freighter").getAttribute("aria-pressed"), "false");
    assert.equal(getWalletCard(container, "Ledger").getAttribute("aria-pressed"), "false");
  });

  it("moves aria-pressed when the selection changes", () => {
    const { container } = renderStep();

    fireEvent.click(getWalletCard(container, "Freighter"));
    assert.equal(getWalletCard(container, "Freighter").getAttribute("aria-pressed"), "true");

    fireEvent.click(getWalletCard(container, "Ledger"));
    assert.equal(getWalletCard(container, "Freighter").getAttribute("aria-pressed"), "false");
    assert.equal(getWalletCard(container, "Ledger").getAttribute("aria-pressed"), "true");
  });

  it("updates aria-pressed when selecting with the keyboard", () => {
    const { container } = renderStep();

    const albedoCard = getWalletCard(container, "Albedo");
    albedoCard.focus();
    fireEvent.keyDown(albedoCard, { key: "Enter" });

    assert.equal(getWalletCard(container, "Albedo").getAttribute("aria-pressed"), "true");
  });
});

describe("WalletConnectStep translated strings", () => {
  it("renders translated copy from the message catalog", () => {
    const { container } = renderStep();
    const t = dictionaries.en.onboardingSteps.walletConnect;

    // Header title and description
    const heading = container.querySelector("h2");
    assert.ok(heading, "expected an h2 heading element");
    assert.equal(heading.textContent, t.title);
    assert.ok(container.textContent?.includes(t.description), `expected description: ${t.description}`);

    // Recommended badge
    assert.ok(container.textContent?.includes(t.recommended), `expected badge: ${t.recommended}`);

    // Wallet descriptions from catalog
    assert.ok(
      container.textContent?.includes(t.walletDescriptions.freighter),
      `expected freighter description: ${t.walletDescriptions.freighter}`,
    );
    assert.ok(
      container.textContent?.includes(t.walletDescriptions.albedo),
      `expected albedo description: ${t.walletDescriptions.albedo}`,
    );
    assert.ok(
      container.textContent?.includes(t.walletDescriptions.ledger),
      `expected ledger description: ${t.walletDescriptions.ledger}`,
    );

    // Security notice title and body
    const securityHeading = container.querySelector("h4");
    assert.ok(securityHeading, "expected an h4 security notice heading");
    assert.equal(securityHeading.textContent, t.securityNoticeTitle);
    assert.ok(
      container.textContent?.includes(t.securityNoticeBody),
      `expected security notice body: ${t.securityNoticeBody}`,
    );

    // Action buttons
    const buttons = Array.from(container.querySelectorAll("button"));
    const buttonTexts = buttons.map((b) => b.textContent?.trim());
    assert.ok(
      buttonTexts.includes(t.connectButton),
      `expected connect button labeled "${t.connectButton}"`,
    );
    assert.ok(
      buttonTexts.includes(t.skipButton),
      `expected skip button labeled "${t.skipButton}"`,
    );

    // Help links / prompt
    assert.ok(
      container.textContent?.includes(t.noWalletPrompt),
      `expected no wallet prompt: ${t.noWalletPrompt}`,
    );
    assert.ok(
      buttonTexts.includes(t.learnMore),
      `expected learn more button labeled "${t.learnMore}"`,
    );
  });
});
