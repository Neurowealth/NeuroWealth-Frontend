import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React, { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { Button } from "./Button";

setupDomGlobals();
Object.assign(globalThis, { React });

describe("Button component", () => {
  afterEach(cleanup);

  it("renders the default primary variant and medium size", () => {
    const { getByRole } = render(createElement(Button, null, "Continue"));
    const button = getByRole("button", { name: "Continue" });

    assert.ok(button.classList.contains("bg-sky-500"));
    assert.ok(button.classList.contains("hover:bg-sky-400"));
    assert.ok(button.classList.contains("text-white"));
    assert.ok(button.classList.contains("px-5"));
    assert.ok(button.classList.contains("py-2.5"));
  });

  it("renders rounded-lg and disabled modifiers", () => {
    const { getByRole } = render(
      createElement(Button, { disabled: true }, "Unavailable"),
    );
    const button = getByRole("button", { name: "Unavailable" }) as HTMLButtonElement;

    assert.equal(button.disabled, true);
    assert.ok(button.classList.contains("rounded-lg"));
    assert.ok(button.classList.contains("disabled:opacity-50"));
    assert.ok(button.classList.contains("disabled:cursor-not-allowed"));
  });

  it("renders secondary hover and border classes", () => {
    const { getByRole } = render(
      createElement(Button, { variant: "secondary" }, "Secondary"),
    );
    const button = getByRole("button", { name: "Secondary" });

    assert.ok(button.classList.contains("border"));
    assert.ok(button.classList.contains("border-sky-500/60"));
    assert.ok(button.classList.contains("text-sky-400"));
    assert.ok(button.classList.contains("hover:bg-sky-500/10"));
  });

  it("renders ghost hover and dark classes", () => {
    const { getByRole } = render(
      createElement(Button, { variant: "ghost" }, "Ghost"),
    );
    const button = getByRole("button", { name: "Ghost" });

    assert.ok(button.classList.contains("hover:text-slate-100"));
    assert.ok(button.classList.contains("hover:bg-white/5"));
    assert.ok(button.classList.contains("dark:text-slate-400"));
    assert.ok(button.classList.contains("dark:hover:text-white"));
  });

  it("renders destructive hover classes", () => {
    const { getByRole } = render(
      createElement(Button, { variant: "destructive" }, "Delete"),
    );
    const button = getByRole("button", { name: "Delete" });

    assert.ok(button.classList.contains("bg-red-500"));
    assert.ok(button.classList.contains("hover:bg-red-400"));
  });

  it("renders small and large size classes", () => {
    const small = render(createElement(Button, { size: "sm" }, "Small"));
    const smallButton = small.getByRole("button", { name: "Small" });
    assert.ok(smallButton.classList.contains("px-3"));
    assert.ok(smallButton.classList.contains("py-1.5"));
    assert.ok(smallButton.classList.contains("rounded-lg"));
    small.unmount();

    const large = render(createElement(Button, { size: "lg" }, "Large"));
    const largeButton = large.getByRole("button", { name: "Large" });
    assert.ok(largeButton.classList.contains("px-7"));
    assert.ok(largeButton.classList.contains("py-3.5"));
    assert.ok(largeButton.classList.contains("rounded-lg"));
  });

  it("appends custom className to rendered classes", () => {
    const { getByRole } = render(
      createElement(Button, { className: "my-custom-class" }, "Custom"),
    );
    const button = getByRole("button", { name: "Custom" });

    assert.ok(button.classList.contains("my-custom-class"));
  });
});
