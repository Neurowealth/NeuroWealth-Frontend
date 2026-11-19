import assert from "node:assert/strict";
import { describe, it } from "node:test";
import React, { type ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { setupDomGlobals } from "@/test-setup";
import { FormErrorSummary } from "./FormErrors";

setupDomGlobals();
(globalThis as typeof globalThis & { React?: typeof React }).React = React;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function mount(ui: ReactNode): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(ui));
  return { root, container };
}

describe("FormErrorSummary", () => {
  it("renders null when errors array is empty", () => {
    const { root, container } = mount(
      React.createElement(FormErrorSummary, { title: "Validation Error", errors: [] }),
    );
    assert.equal(container.innerHTML, "");
    act(() => root.unmount());
    container.remove();
  });

  it("renders error list and title when errors exist", () => {
    const { root, container } = mount(
      React.createElement(FormErrorSummary, {
        title: "Form Errors",
        errors: ["Email required", "Password too short"],
      }),
    );

    const alert = container.querySelector('[role="alert"]');
    assert.ok(alert, "should render an alert container");
    assert.equal(alert.getAttribute("aria-live"), "assertive");
    assert.match(container.textContent ?? "", /Form Errors/);
    assert.match(container.textContent ?? "", /Email required/);
    assert.match(container.textContent ?? "", /Password too short/);

    act(() => root.unmount());
    container.remove();
  });
});
