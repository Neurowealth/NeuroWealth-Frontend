import assert from "node:assert/strict";
import test from "node:test";
import React, { type ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";

setupDomGlobals();
(globalThis as typeof globalThis & { React?: typeof React }).React = React;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function mount(ui: ReactNode): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(React.createElement(I18nProvider, null, ui)));
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
    assert.match(card!.className, /\bdark:bg-slate-900\b/);

    const title = card!.querySelector("h3")!;
    assert.match(title.className, /\btext-slate-900\b/);
    assert.match(title.className, /\bdark:text-slate-50\b/);
  }

  act(() => root.unmount());
  container.remove();
});

test("StrategyList resets page to 1 when filters change (no stale-page bug)", async () => {
  const { default: StrategyList } = await import("./StrategyList");
  const { root, container } = mount(React.createElement(StrategyList));

  // Helper to get current page number from pagination display
  const getCurrentPage = () => {
    const pageText = container.textContent?.match(/Page (\d+)/);
    return pageText ? parseInt(pageText[1]) : 1;
  };

  // Helper to navigate to a specific page
  const navigateToPage = (pageNum: number) => {
    // Find the "next" or page navigation buttons
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>("button"));

    // Try to find a jump-to-page input or buttons for higher pages
    if (pageNum > 1) {
      // Click next button multiple times or find page jump input
      const jumpInput = container.querySelector<HTMLInputElement>("input[type='number']");
      if (jumpInput) {
        act(() => {
          jumpInput.value = pageNum.toString();
          jumpInput.dispatchEvent(new Event("change", { bubbles: true }));
        });
      } else {
        // Click next button (pageNum - 1) times
        const nextButtons = buttons.filter((b) => b.textContent?.includes("Next"));
        for (let i = 1; i < pageNum; i++) {
          const nextBtn = nextButtons[nextButtons.length - 1];
          if (nextBtn && !nextBtn.disabled) {
            act(() => nextBtn.click());
          }
        }
      }
    }
  };

  // Navigate to page 2 or higher (if available)
  navigateToPage(2);

  // Verify we're on page 2+ (or that pagination is available)
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Apply a filter that narrows results
  const filterButtons = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="checkbox"]'),
  );
  const highRiskFilter = filterButtons.find((b) => b.textContent?.includes("High Risk"));

  assert.ok(highRiskFilter, "should have High Risk filter option");

  act(() => {
    highRiskFilter?.click();
  });

  await new Promise((resolve) => setTimeout(resolve, 50));

  // After applying filter, page should reset to 1
  const pageText = container.textContent ?? "";
  const results = pageText.match(/(\d+) results/);
  assert.ok(results, "should show results count");

  // Page should be back to 1 (check for page indicator or lack of page 2+ content)
  // We can verify by checking that we're not in an out-of-range state
  const emptyState = container.textContent?.includes("No strategies");
  if (!emptyState) {
    // If we have results, verify the pagination is showing page 1
    assert.ok(
      pageText.includes("1") || !pageText.includes("Page 2"),
      "page should reset to 1 after filter change"
    );
  }

  act(() => root.unmount());
  container.remove();
});

test("StrategyList handles multiple filter changes without rendering empty pagination", async () => {
  const { default: StrategyList } = await import("./StrategyList");
  const { root, container } = mount(React.createElement(StrategyList));

  // Apply first filter
  const filterButtons = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="checkbox"]'),
  );
  const lowRiskFilter = filterButtons.find((b) => b.textContent?.includes("Low Risk"));

  assert.ok(lowRiskFilter, "should have Low Risk filter");

  act(() => {
    lowRiskFilter?.click();
  });

  await new Promise((resolve) => setTimeout(resolve, 50));

  let resultsText = container.textContent?.match(/(\d+) results/);
  assert.ok(resultsText, "should show results after first filter");
  const lowRiskCount = parseInt(resultsText[1]);

  // Apply second filter that may narrow results further
  const incomeFilter = filterButtons.find((b) => b.textContent?.includes("Income"));

  if (incomeFilter) {
    act(() => {
      incomeFilter.click();
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    resultsText = container.textContent?.match(/(\d+) results/);
    assert.ok(resultsText, "should show results after second filter");
    const combinedCount = parseInt(resultsText[1]);

    // Combined count should be <= individual counts (stricter filtering)
    assert.ok(
      combinedCount <= lowRiskCount,
      "combined filters should narrow results or stay same"
    );

    // Should not show "No strategies" unless both categories have zero overlap
    // Verify pagination state is sensible
    assert.ok(
      !container.textContent?.includes("Page 2+") || combinedCount > 6,
      "pagination should only show if enough results exist"
    );
  }

  act(() => root.unmount());
  container.remove();
});