import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WalletConnectStep from "./WalletConnectStep";
import { setupDomGlobals } from "../../../test-setup";

setupDomGlobals();

function renderStep() {
  return render(
    <WalletConnectStep onNext={() => {}} onSkip={() => {}} />,
  );
}

function getWalletCard(name: string): HTMLElement {
  const heading = screen.getByRole("heading", { name });
  const card = heading.closest('[role="button"]');
  assert.ok(card, `expected a role="button" card for ${name}`);
  return card as HTMLElement;
}

describe("WalletConnectStep aria-pressed", () => {
  it("marks every wallet card as not pressed initially", () => {
    renderStep();

    for (const name of ["Freighter", "Albedo", "Ledger"]) {
      assert.equal(getWalletCard(name).getAttribute("aria-pressed"), "false");
    }
  });

  it("sets aria-pressed on the clicked wallet card only", async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(getWalletCard("Albedo"));

    assert.equal(getWalletCard("Albedo").getAttribute("aria-pressed"), "true");
    assert.equal(getWalletCard("Freighter").getAttribute("aria-pressed"), "false");
    assert.equal(getWalletCard("Ledger").getAttribute("aria-pressed"), "false");
  });

  it("moves aria-pressed when the selection changes", async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(getWalletCard("Freighter"));
    assert.equal(getWalletCard("Freighter").getAttribute("aria-pressed"), "true");

    await user.click(getWalletCard("Ledger"));
    assert.equal(getWalletCard("Freighter").getAttribute("aria-pressed"), "false");
    assert.equal(getWalletCard("Ledger").getAttribute("aria-pressed"), "true");
  });

  it("updates aria-pressed when selecting with the keyboard", async () => {
    const user = userEvent.setup();
    renderStep();

    getWalletCard("Albedo").focus();
    await user.keyboard("{Enter}");

    assert.equal(getWalletCard("Albedo").getAttribute("aria-pressed"), "true");
  });
});
