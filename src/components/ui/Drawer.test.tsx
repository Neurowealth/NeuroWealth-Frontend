import assert from "node:assert/strict";
import test, { afterEach, describe } from "node:test";
import React, { createElement, useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { Drawer } from "./Drawer";

setupDomGlobals();
Object.assign(globalThis, { React });

function DrawerHarness({
  preventClose = false,
  initialOpen = false,
  side = "right",
}: {
  preventClose?: boolean;
  initialOpen?: boolean;
  side?: "left" | "right";
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return createElement(
    "div",
    null,
    createElement(
      "button",
      {
        type: "button",
        "data-testid": "drawer-trigger",
        onClick: () => setIsOpen(true),
      },
      "Open Drawer",
    ),
    <Drawer
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Activity Details"
      preventClose={preventClose}
      side={side}
      footer={
        <button type="button" data-testid="drawer-apply-btn" onClick={() => setIsOpen(false)}>
          Apply
        </button>
      }
    >
      <div>
        <input type="text" data-testid="drawer-input" aria-label="Filter text" />
      </div>
    </Drawer>,
  );
}

describe("Drawer focus management and keyboard interactions (#1182)", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  test("renders dialog with role='dialog', aria-modal='true', and aria-labelledby matching the title node", () => {
    const view = render(createElement(DrawerHarness, { initialOpen: true }));
    const dialog = view.getByRole("dialog");

    assert.equal(dialog.getAttribute("role"), "dialog");
    assert.equal(dialog.getAttribute("aria-modal"), "true");
    assert.equal(dialog.getAttribute("aria-labelledby"), "drawer-title");

    const titleEl = document.getElementById("drawer-title");
    assert.ok(titleEl, "drawer-title element must exist in the DOM");
    assert.equal(titleEl.textContent, "Activity Details");
  });

  test("moves focus into the drawer on open, traps Tab and Shift+Tab inside the container, and returns focus to trigger on close", () => {
    const view = render(createElement(DrawerHarness));
    const trigger = view.getByTestId("drawer-trigger");

    trigger.focus();
    assert.equal(document.activeElement, trigger);

    // Open drawer
    fireEvent.click(trigger);

    const closeBtn = view.getByRole("button", { name: "Close drawer" });
    const input = view.getByTestId("drawer-input");
    const applyBtn = view.getByTestId("drawer-apply-btn");

    // Focus moves to first focusable element inside the drawer
    assert.equal(document.activeElement, closeBtn);
    assert.equal(document.body.style.overflow, "hidden");

    // Shift+Tab from first wraps to last element
    fireEvent.keyDown(closeBtn, { key: "Tab", shiftKey: true });
    assert.equal(document.activeElement, applyBtn);

    // Tab from last wraps back to first element
    fireEvent.keyDown(applyBtn, { key: "Tab", shiftKey: false });
    assert.equal(document.activeElement, closeBtn);

    // Middle input can receive focus
    input.focus();
    assert.equal(document.activeElement, input);

    // Closing returns focus to trigger and cleans up overflow
    fireEvent.click(closeBtn);
    assert.equal(view.queryByRole("dialog"), null);
    assert.equal(document.activeElement, trigger);
    assert.equal(document.body.style.overflow, "");
  });

  test("closes with Escape key when preventClose is false and returns focus to trigger", () => {
    const view = render(createElement(DrawerHarness, { preventClose: false }));
    const trigger = view.getByTestId("drawer-trigger");

    trigger.focus();
    fireEvent.click(trigger);
    assert.ok(view.getByRole("dialog"));

    fireEvent.keyDown(document, { key: "Escape" });
    assert.equal(view.queryByRole("dialog"), null);
    assert.equal(document.activeElement, trigger);
  });

  test("does not close on Escape or render close button when preventClose is true", () => {
    const view = render(createElement(DrawerHarness, { preventClose: true }));
    const trigger = view.getByTestId("drawer-trigger");

    trigger.focus();
    fireEvent.click(trigger);

    assert.ok(view.getByRole("dialog"));
    assert.equal(view.queryByRole("button", { name: "Close drawer" }), null);

    const input = view.getByTestId("drawer-input");
    assert.equal(document.activeElement, input);

    fireEvent.keyDown(document, { key: "Escape" });
    assert.ok(view.getByRole("dialog"));
  });

  test("applies right and left side positioning classes on the rendered panel", () => {
    const rightView = render(createElement(DrawerHarness, { initialOpen: true, side: "right" }));
    const rightDialog = rightView.getByRole("dialog");
    assert.ok(rightDialog.querySelector(".right-0"), "right drawer panel should have right-0 class");
    cleanup();

    const leftView = render(createElement(DrawerHarness, { initialOpen: true, side: "left" }));
    const leftDialog = leftView.getByRole("dialog");
    assert.ok(leftDialog.querySelector(".left-0"), "left drawer panel should have left-0 class");
  });
});
