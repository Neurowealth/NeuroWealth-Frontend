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

  it("generates an id using useId when id is omitted", () => {
    const { getByText, getByRole } = render(
      createElement(Input, { label: "Full Name" }),
    );

    const label = getByText("Full Name") as HTMLLabelElement;
    const input = getByRole("textbox") as HTMLInputElement;

    assert.ok(input.id, "expected generated id on input");
    assert.equal(label.htmlFor, input.id);
  });

  it("renders the default variant classes without aria-describedby or aria-invalid", () => {
    const { getByRole } = render(createElement(Input));
    const input = getByRole("textbox") as HTMLInputElement;

    assert.ok(input.classList.contains("border-slate-200"));
    assert.ok(input.classList.contains("focus:border-brand-500"));
    assert.ok(input.classList.contains("focus:ring-brand-500/20"));
    assert.ok(input.classList.contains("dark:border-white/10"));
    assert.ok(input.classList.contains("dark:focus:border-brand-500"));
    assert.ok(input.classList.contains("dark:focus:ring-brand-500/20"));
    assert.equal(input.getAttribute("aria-describedby"), null);
    assert.equal(input.getAttribute("aria-invalid"), null);
  });

  it("links hint text to input with aria-describedby without setting aria-invalid", () => {
    const { getByRole, getByText } = render(
      createElement(Input, { id: "email-input", hint: "Enter your primary email address" }),
    );
    const input = getByRole("textbox") as HTMLInputElement;
    const hintElement = getByText("Enter your primary email address");

    assert.equal(hintElement.id, "email-input-hint");
    assert.equal(input.getAttribute("aria-describedby"), "email-input-hint");
    assert.equal(input.getAttribute("aria-invalid"), null);
  });

  it("links error text to input with aria-describedby and sets aria-invalid to true", () => {
    const { getByRole, getByText } = render(
      createElement(Input, { id: "email-input", error: "Invalid email address format" }),
    );
    const input = getByRole("textbox") as HTMLInputElement;
    const errorElement = getByText("Invalid email address format");

    assert.equal(errorElement.id, "email-input-error");
    assert.equal(input.getAttribute("aria-describedby"), "email-input-error");
    assert.equal(input.getAttribute("aria-invalid"), "true");
  });

  it("renders error variant classes and makes error text take precedence over hint", () => {
    const { getByRole, getByText, queryByText } = render(
      createElement(Input, {
        id: "test-input",
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
    assert.equal(input.getAttribute("aria-describedby"), "test-input-error");
    assert.equal(input.getAttribute("aria-invalid"), "true");
  });

  it("merges custom aria-describedby with hint or error id", () => {
    const { getByRole } = render(
      createElement(Input, {
        id: "custom-input",
        "aria-describedby": "external-help",
        error: "Invalid input",
      }),
    );
    const input = getByRole("textbox") as HTMLInputElement;

    assert.equal(input.getAttribute("aria-describedby"), "external-help custom-input-error");
    assert.equal(input.getAttribute("aria-invalid"), "true");
  });

  it("renders the hint when there is no error", () => {
    const { getByText } = render(
      createElement(Input, { hint: "Helpful hint" }),
    );

    assert.ok(getByText("Helpful hint"));
  });
});
