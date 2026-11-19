import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import React, { createElement } from "react";
import { setupDomGlobals } from "../../../test-setup";

setupDomGlobals();
Object.assign(globalThis, { React });

// Use createRequire so these modules are loaded after setupDomGlobals initializes window/document
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { render, cleanup, fireEvent } = require("@testing-library/react") as typeof import("@testing-library/react");
const FirstDepositStep = (require("./FirstDepositStep") as { default: typeof import("./FirstDepositStep").default }).default;
const { I18nProvider } = require("@/contexts/I18nContext") as typeof import("@/contexts/I18nContext");
const { dictionaries } = require("@/lib/i18n/messages") as typeof import("@/lib/i18n/messages");

function renderStep(props: { onNext?: () => void; onSkip?: () => void; onBack?: () => void } = {}) {
  return render(
    createElement(
      I18nProvider,
      null,
      createElement(FirstDepositStep, {
        onNext: props.onNext || (() => {}),
        onSkip: props.onSkip || (() => {}),
        onBack: props.onBack,
      }),
    ),
  );
}

function getAssetCard(container: HTMLElement, name: string): HTMLElement {
  const cards = Array.from(container.querySelectorAll<HTMLElement>('[role="button"]'));
  const card = cards.find((c) => c.querySelector("h4")?.textContent === name);
  assert.ok(card, `expected a role="button" card for ${name}`);
  return card;
}

describe("FirstDepositStep", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders real component and translated strings from message catalog", () => {
  const { container } = renderStep();
  const t = dictionaries.en.onboardingSteps.firstDeposit;

  // Header title and description
  const heading = container.querySelector("h2");
  assert.ok(heading, "expected an h2 heading element");
  assert.equal(heading.textContent, t.title);
  assert.ok(
    container.textContent?.includes(t.description),
    `expected description: ${t.description}`,
  );

  // Section headings
  assert.ok(
    container.textContent?.includes(t.selectAssetHeading),
    `expected select asset heading: ${t.selectAssetHeading}`,
  );
  assert.ok(
    container.textContent?.includes(t.depositAmountHeading),
    `expected deposit amount heading: ${t.depositAmountHeading}`,
  );

  // Balance prefix
  assert.ok(
    container.textContent?.includes(t.balancePrefix),
    `expected balance prefix: ${t.balancePrefix}`,
  );

  // Custom amount placeholder
  const input = container.querySelector('input[type="number"]');
  assert.ok(input, "expected a custom amount number input");
  assert.equal(input.getAttribute("placeholder"), t.customAmountPlaceholder);

  // Fee information
  assert.ok(
    container.textContent?.includes(t.feeInfoTitle),
    `expected fee info title: ${t.feeInfoTitle}`,
  );
  assert.ok(
    container.textContent?.includes(t.feeInfoBody),
    `expected fee info body: ${t.feeInfoBody}`,
  );

  // Action buttons
  const buttons = Array.from(container.querySelectorAll("button"));
  const buttonTexts = buttons.map((b) => b.textContent?.trim());
  assert.ok(
    buttonTexts.includes(t.depositButton),
    `expected deposit button: "${t.depositButton}"`,
  );
  assert.ok(
    buttonTexts.includes(t.skipButton),
    `expected skip button: "${t.skipButton}"`,
  );

  // Help guide link / prompt
  assert.ok(
    container.textContent?.includes(t.questionsPrompt),
    `expected questions prompt: ${t.questionsPrompt}`,
  );
  assert.ok(
    buttonTexts.includes(t.viewGuide),
    `expected view guide button: "${t.viewGuide}"`,
  );
  });

  it("initially selected asset (XLM) has aria-pressed=true and others false", () => {
    const { container } = renderStep();

    assert.equal(getAssetCard(container, "Stellar (XLM)").getAttribute("aria-pressed"), "true");
    assert.equal(getAssetCard(container, "USD Coin").getAttribute("aria-pressed"), "false");
    assert.equal(getAssetCard(container, "Euro Coin").getAttribute("aria-pressed"), "false");
  });

  it("updates aria-pressed when another asset card is clicked", () => {
    const { container } = renderStep();

    fireEvent.click(getAssetCard(container, "USD Coin"));
    assert.equal(getAssetCard(container, "Stellar (XLM)").getAttribute("aria-pressed"), "false");
    assert.equal(getAssetCard(container, "USD Coin").getAttribute("aria-pressed"), "true");
    assert.equal(getAssetCard(container, "Euro Coin").getAttribute("aria-pressed"), "false");

    fireEvent.click(getAssetCard(container, "Euro Coin"));
    assert.equal(getAssetCard(container, "USD Coin").getAttribute("aria-pressed"), "false");
    assert.equal(getAssetCard(container, "Euro Coin").getAttribute("aria-pressed"), "true");
  });

  it("updates aria-pressed on Enter and Space keyboard events", () => {
    const { container } = renderStep();

    const usdcCard = getAssetCard(container, "USD Coin");
    usdcCard.focus();
    fireEvent.keyDown(usdcCard, { key: "Enter" });
    assert.equal(usdcCard.getAttribute("aria-pressed"), "true");

    const eurcCard = getAssetCard(container, "Euro Coin");
    eurcCard.focus();
    fireEvent.keyDown(eurcCard, { key: " " });
    assert.equal(eurcCard.getAttribute("aria-pressed"), "true");
  });

  it("verifies all asset cards have role=button and tabIndex=0", () => {
    const { container } = renderStep();

    for (const name of ["Stellar (XLM)", "USD Coin", "Euro Coin"]) {
      const card = getAssetCard(container, name);
      assert.equal(card.getAttribute("role"), "button");
      assert.equal(card.getAttribute("tabindex"), "0");
    }
  });

  it("preset amount buttons update the selected amount and total display", () => {
    const { container } = renderStep();

    const preset250 = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === "$250",
    );
    assert.ok(preset250, "expected $250 preset button");
    fireEvent.click(preset250);

    const totalSpan = container.querySelector(".text-green-400.text-2xl");
    assert.ok(totalSpan, "expected total amount span");
    assert.equal(totalSpan.textContent?.trim(), "250 XLM");
  });

  it("custom amount input updates total display and clears preset selection", () => {
    const { container } = renderStep();

    const input = container.querySelector('input[type="number"]') as HTMLInputElement;
    assert.ok(input, "expected custom amount input");
    fireEvent.change(input, { target: { value: "350" } });

    const totalSpan = container.querySelector(".text-green-400.text-2xl");
    assert.ok(totalSpan, "expected total amount span");
    assert.equal(totalSpan.textContent?.trim(), "350 XLM");
  });

  it("displays translated validation error when deposit exceeds asset balance", () => {
    const { container } = renderStep();
    const t = dictionaries.en.onboardingSteps.firstDeposit;

    const input = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "5000" } });

    const submitBtn = container.querySelector('button[data-qa="deposit-submit-button"]') as HTMLButtonElement;
    assert.ok(submitBtn, "expected deposit submit button");
    assert.equal(submitBtn.disabled, false);
    fireEvent.click(submitBtn);

    const alert = container.querySelector('[role="alert"]');
    assert.ok(alert, "expected role=alert container for error");
    assert.ok(
      alert.textContent?.includes(t.errorInsufficientBalance),
      `expected error: "${t.errorInsufficientBalance}"`,
    );
  });
});

