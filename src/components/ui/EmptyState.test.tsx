import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { Search } from "lucide-react";
import { setupDomGlobals } from "@/test-setup";
import EmptyStateCompact, { EmptyState } from "./EmptyState";

setupDomGlobals();
Object.assign(globalThis, { React });

describe("EmptyState component rendering", () => {
  afterEach(cleanup);

  it("renders heading, body, and icon elements", () => {
    const { getByRole, getByText, getByTestId } = render(
      <EmptyState
        icon={<span data-testid="test-icon">icon</span>}
        heading="No transactions yet"
        body="Deposit funds to begin automated neural indexing."
      />,
    );

    const heading = getByRole("heading", { level: 2 });
    assert.equal(heading.textContent, "No transactions yet");
    assert.ok(getByText("Deposit funds to begin automated neural indexing."));
    assert.ok(getByTestId("test-icon"));
  });

  it("renders CTA link with Next Link pointing to ctaHref", () => {
    const { getByRole } = render(
      <EmptyState
        icon={<span>*</span>}
        heading="No strategies"
        body="Explore pre-built vaults to allocate capital."
        ctaLabel="Explore vaults"
        ctaHref="/vaults"
      />,
    );

    const link = getByRole("link");
    assert.equal(link.getAttribute("href"), "/vaults");
    assert.ok(link.textContent?.includes("Explore vaults"));
  });

  it("renders CTA button and invokes onAction callback when clicked", () => {
    let actionTriggered = false;
    const { getByRole } = render(
      <EmptyState
        icon={<span>!</span>}
        heading="Connection lost"
        body="Unable to reach the Stellar Horizon node."
        ctaLabel="Retry connection"
        onAction={() => {
          actionTriggered = true;
        }}
      />,
    );

    const button = getByRole("button", { name: "Retry connection" });
    assert.ok(button);
    fireEvent.click(button);
    assert.equal(actionTriggered, true);
  });

  it("renders no CTA when ctaLabel is omitted", () => {
    const { queryByRole } = render(
      <EmptyState
        icon={<span>?</span>}
        heading="Nothing found"
        body="Try adjusting your filter parameters."
      />,
    );

    assert.equal(queryByRole("link"), null);
    assert.equal(queryByRole("button"), null);
  });

  it("renders no CTA when ctaLabel is provided without ctaHref or onAction", () => {
    const { queryByRole } = render(
      <EmptyState
        icon={<span>?</span>}
        heading="Read-only notice"
        body="This section has no interactive operations."
        ctaLabel="Placeholder label"
      />,
    );

    assert.equal(queryByRole("link"), null);
    assert.equal(queryByRole("button"), null);
  });
});

describe("EmptyStateCompact rendering", () => {
  afterEach(cleanup);

  it("renders title, description, and icon component", () => {
    const { getByText } = render(
      <EmptyStateCompact
        icon={Search}
        title="No search results"
        description="Try searching with a different keyword."
      />,
    );

    assert.ok(getByText("No search results"));
    assert.ok(getByText("Try searching with a different keyword."));
  });

  it("renders without description when optional prop is omitted", () => {
    const { getByText, queryByText } = render(
      <EmptyStateCompact
        icon={Search}
        title="Compact state title only"
      />,
    );

    assert.ok(getByText("Compact state title only"));
    assert.equal(queryByText("Try searching with a different keyword."), null);
  });
});
