import assert from "node:assert/strict";
import test from "node:test";
import React, { type ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { setupDomGlobals } from "@/test-setup";

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

test("StrategyList renders EmptyStateCompact when filters produce zero results", async () => {
  const { default: StrategyList } = await import("./StrategyList");
  const { root, container } = mount(React.createElement(StrategyList));

  const filterButtons = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="checkbox"]'),
  );
  const highRisk = filterButtons.find((button) => button.textContent?.includes("High Risk"));
  const income = filterButtons.find((button) => button.textContent?.includes("Income"));
  assert.ok(highRisk);
  assert.ok(income);

  act(() => {
    highRisk!.click();
  });
  act(() => {
    income!.click();
  });

  assert.match(container.textContent ?? "", /No strategies match the selected filters\./);
  assert.equal(container.querySelector(".text-text-secondary")?.textContent, "No strategies match the selected filters.");
  assert.match(container.textContent ?? "", /0 results/);

  act(() => root.unmount());
  container.remove();
});

/**
 * Regression test for issue #916: strategy cards must use theme-aware
 * Tailwind classes, not dark-only inline styles that ignore light mode.
 */
test("StrategyList cards have no inline styles and pair light/dark colors", async () => {
  const { default: StrategyList } = await import("./StrategyList");
  const { root, container } = mount(React.createElement(StrategyList));

  const cards = Array.from(container.querySelectorAll("h3")).map(
    (heading) => heading.closest("div.rounded-\\[10px\\]") as HTMLElement | null,
  );
  assert.ok(cards.length > 0, "expected strategy cards to render");

  for (const card of cards) {
    assert.ok(card, "each strategy title should sit inside a card");
    assert.equal(card!.querySelector("[style]"), null, "card content should not use inline styles");
    assert.equal(card!.getAttribute("style"), null, "card should not use inline styles");
    assert.match(card!.className, /\bbg-white\b/);
    assert.match(card!.className, /\bdark:bg-gray-900\b/);

    const title = card!.querySelector("h3")!;
    assert.match(title.className, /\btext-slate-900\b/);
    assert.match(title.className, /\bdark:text-gray-50\b/);
  }

  act(() => root.unmount());
  container.remove();
});