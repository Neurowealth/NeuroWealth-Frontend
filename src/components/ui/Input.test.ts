import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React, { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { Input } from "./Input";

setupDomGlobals();
Object.assign(globalThis, { React });

describe("Input component", () => {
  afterEach(cleanup);

  it("uses an explicit id for the label and input", () => {
    const { getByText, getByRole } = render(
      createElement(Input, { id: "wallet-address", label: "Wallet Address" }),
    );

    const label = getByText("Wallet Address") as HTMLLabelElement;
    const input = getByRole("textbox") as HTMLInputElement;

    assert.equal(label.htmlFor, "wallet-address");
    assert.equal(input.id, "wallet-address");
  });

  it("derives an id from the label when id is omitted", () => {
    const { getByText, getByRole } = render(
      createElement(Input, { label: "Full Name" }),
    );

    const label = getByText("Full Name") as HTMLLabelElement;
    const input = getByRole("textbox") as HTMLInputElement;

    assert.equal(label.htmlFor, "full-name");
    assert.equal(input.id, "full-name");
  });

  it("renders the default variant classes", () => {
    const { getByRole } = render(createElement(Input));
    const input = getByRole("textbox") as HTMLInputElement;

    assert.ok(input.classList.contains("border-slate-200"));
    assert.ok(input.classList.contains("focus:border-brand-500"));
    assert.ok(input.classList.contains("focus:ring-brand-500/20"));
    assert.ok(input.classList.contains("dark:border-white/10"));
    assert.ok(input.classList.contains("dark:focus:border-brand-500"));
    assert.ok(input.classList.contains("dark:focus:ring-brand-500/20"));
  });

  it("renders the success variant classes", () => {
    const { getByRole } = render(createElement(Input, { variant: "success" }));
    const input = getByRole("textbox") as HTMLInputElement;

    assert.ok(input.classList.contains("border-brand-500"));
    assert.ok(input.classList.contains("focus:border-brand-500"));
    assert.ok(input.classList.contains("focus:ring-brand-500/20"));
    assert.ok(input.classList.contains("dark:border-brand-500/60"));
    assert.ok(input.classList.contains("dark:focus:border-brand-500"));
  });

  it("renders error variant classes and gives error text precedence over hint", () => {
    const { getByRole, getByText, queryByText } = render(
      createElement(Input, {
        variant: "success",
        error: "This field is required",
        hint: "Helpful hint",
      }),
    );
    const input = getByRole("textbox") as HTMLInputElement;

    assert.ok(input.classList.contains("border-accent-red"));
    assert.ok(input.classList.contains("focus:border-accent-red"));
    assert.ok(input.classList.contains("focus:ring-red-400/20"));
    assert.ok(input.classList.contains("dark:border-red-400/60"));
    assert.ok(input.classList.contains("dark:focus:border-accent-red"));
    assert.ok(getByText("This field is required"));
    assert.equal(queryByText("Helpful hint"), null);
  });

  it("renders the hint when there is no error", () => {
    const { getByText } = render(
      createElement(Input, { hint: "Helpful hint" }),
    );

    assert.ok(getByText("Helpful hint"));
  });
});
