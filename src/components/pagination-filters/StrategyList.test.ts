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