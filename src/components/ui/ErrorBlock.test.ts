import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { ErrorBlock } from "./ErrorBlock";

setupDomGlobals();
Object.assign(globalThis, { React });

describe("ErrorBlock component", () => {
  afterEach(cleanup);

  it("renders role=alert with aria-live=assertive", () => {
    const { getByRole } = render(
      React.createElement(ErrorBlock, {
        title: "Portfolio failed to load",
        description: "Something went wrong while loading your portfolio.",
      }),
    );
    const alert = getByRole("alert");
    assert.ok(alert);
    assert.equal(alert.getAttribute("aria-live"), "assertive");
  });

  it("renders the title and description from the DOM", () => {
    const { getByText } = render(
      React.createElement(ErrorBlock, {
        title: "Portfolio failed",
        description: "Retry this action.",
      }),
    );
    assert.ok(getByText("Portfolio failed"));
    assert.ok(getByText("Retry this action."));
  });

  it("fires the action callback when the action button is clicked", () => {
    const calls: string[] = [];
    const { getByRole } = render(
      React.createElement(ErrorBlock, {
        title: "Portfolio failed",
        description: "Something went wrong while loading your portfolio.",
        actionLabel: "Retry",
        onAction: () => {
          calls.push("clicked");
        },
      }),
    );
    fireEvent.click(getByRole("button", { name: "Retry" }));
    assert.equal(calls.length, 1);
  });

  it("defaults the action label to 'Try again'", () => {
    const { getByRole } = render(
      React.createElement(ErrorBlock, {
        title: "Portfolio failed",
        description: "Something went wrong while loading your portfolio.",
        onAction: () => {},
      }),
    );
    assert.ok(getByRole("button", { name: "Try again" }));
  });

  it("renders no action button when onAction is not provided", () => {
    const { queryByRole } = render(
      React.createElement(ErrorBlock, {
        title: "Portfolio failed",
        description: "Something went wrong while loading your portfolio.",
        actionLabel: "Retry",
      }),
    );
    assert.equal(queryByRole("button"), null);
  });
});
