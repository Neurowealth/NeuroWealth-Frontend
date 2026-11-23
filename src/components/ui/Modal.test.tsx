import assert from "node:assert/strict";
import test, { afterEach, describe } from "node:test";
import React, { createElement, useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { Modal } from "./Modal";

setupDomGlobals();
Object.assign(globalThis, { React });

function ModalHarness({
  preventClose = false,
  initialOpen = false,
}: {
  preventClose?: boolean;
  initialOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return createElement(
    "div",
    null,
    createElement(
      "button",
      {
        type: "button",
        "data-testid": "modal-trigger",
        onClick: () => setIsOpen(true),
      },
      "Open Modal",
    ),
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Transfer Confirmation"
      preventClose={preventClose}
      footer={
        <button type="button" data-testid="modal-confirm-btn" onClick={() => setIsOpen(false)}>
          Confirm
        </button>
      }
    >
      <div>
        <input type="text" data-testid="modal-input" aria-label="Transfer note" />
      </div>
    </Modal>,
  );
}

describe("Modal focus management and keyboard interactions (#1182)", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  test("renders dialog with role='dialog', aria-modal='true', and aria-labelledby matching the title node", () => {
    const view = render(createElement(ModalHarness, { initialOpen: true }));
    const dialog = view.getByRole("dialog");

    assert.equal(dialog.getAttribute("role"), "dialog");
    assert.equal(dialog.getAttribute("aria-modal"), "true");
    assert.equal(dialog.getAttribute("aria-labelledby"), "modal-title");

    const titleEl = document.getElementById("modal-title");
    assert.ok(titleEl, "modal-title element must exist in the DOM");
    assert.equal(titleEl.textContent, "Transfer Confirmation");
  });

  test("moves focus into the modal on open, traps Tab and Shift+Tab inside the container, and returns focus to trigger on close", () => {
    const view = render(createElement(ModalHarness));
    const trigger = view.getByTestId("modal-trigger");

    trigger.focus();
    assert.equal(document.activeElement, trigger);

    // Open the modal via the trigger button
    fireEvent.click(trigger);

    const closeBtn = view.getByRole("button", { name: "Close modal" });
    const input = view.getByTestId("modal-input");
    const confirmBtn = view.getByTestId("modal-confirm-btn");

    // Focus automatically enters the first focusable element inside the modal
    assert.equal(document.activeElement, closeBtn);
    assert.equal(document.body.style.overflow, "hidden");

    // Shift+Tab from the first focusable element wraps around to the last element
    fireEvent.keyDown(closeBtn, { key: "Tab", shiftKey: true });
    assert.equal(document.activeElement, confirmBtn);

    // Tab from the last focusable element wraps back to the first element
    fireEvent.keyDown(confirmBtn, { key: "Tab", shiftKey: false });
    assert.equal(document.activeElement, closeBtn);

    // Middle element can receive focus inside the dialog
    input.focus();
    assert.equal(document.activeElement, input);

    // Closing via the close button restores focus to the trigger and resets body overflow
    fireEvent.click(closeBtn);
    assert.equal(view.queryByRole("dialog"), null);
    assert.equal(document.activeElement, trigger);
    assert.equal(document.body.style.overflow, "");
  });

  test("closes with Escape key when preventClose is false and returns focus to trigger", () => {
    const view = render(createElement(ModalHarness, { preventClose: false }));
    const trigger = view.getByTestId("modal-trigger");

    trigger.focus();
    fireEvent.click(trigger);
    assert.ok(view.getByRole("dialog"));

    fireEvent.keyDown(document, { key: "Escape" });
    assert.equal(view.queryByRole("dialog"), null);
    assert.equal(document.activeElement, trigger);
  });

  test("does not close on Escape or render close button when preventClose is true", () => {
    const view = render(createElement(ModalHarness, { preventClose: true }));
    const trigger = view.getByTestId("modal-trigger");

    trigger.focus();
    fireEvent.click(trigger);

    const dialog = view.getByRole("dialog");
    assert.ok(dialog);
    assert.equal(view.queryByRole("button", { name: "Close modal" }), null);

    // First focusable element when close button is hidden is the input
    const input = view.getByTestId("modal-input");
    assert.equal(document.activeElement, input);

    // Pressing Escape must not close the modal
    fireEvent.keyDown(document, { key: "Escape" });
    assert.ok(view.getByRole("dialog"));
  });
});
