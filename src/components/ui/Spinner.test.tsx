import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { Spinner } from "./Spinner";

setupDomGlobals();
Object.assign(globalThis, { React });

describe("Spinner component", () => {
  afterEach(cleanup);

  it("renders with default props and accessible role", () => {
    const { getByRole } = render(<Spinner />);
    const spinner = getByRole("status");
    assert.ok(spinner);
    assert.equal(spinner.getAttribute("aria-label"), "Loading");
    assert.ok(spinner.classList.contains("animate-spin"));
    assert.ok(spinner.classList.contains("h-4"));
    assert.ok(spinner.classList.contains("w-4"));
  });

  it("renders with custom title for aria-label", () => {
    const { getByRole } = render(<Spinner title="Processing transaction" />);
    const spinner = getByRole("status");
    assert.equal(spinner.getAttribute("aria-label"), "Processing transaction");
  });

  it("applies custom className alongside animate-spin", () => {
    const { getByRole } = render(<Spinner className="h-8 w-8 text-sky-500" />);
    const spinner = getByRole("status");
    assert.ok(spinner.classList.contains("animate-spin"));
    assert.ok(spinner.classList.contains("h-8"));
    assert.ok(spinner.classList.contains("w-8"));
    assert.ok(spinner.classList.contains("text-sky-500"));
  });
});
