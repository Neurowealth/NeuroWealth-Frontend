import assert from "node:assert/strict";
import { afterEach, before, beforeEach, describe, it } from "node:test";
import React from "react";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";

import { dictionaries, faqCategoryByItemId, guidanceIssueSeverityById } from "@/lib/i18n/messages";

/**
 * Renders the two help sections and checks that each entry shows the metadata
 * of *itself* — the behaviour the index-based arrays used to get wrong the
 * moment the dictionary order changed.
 *
 * The modules are imported after the DOM globals exist, and `React` is exposed
 * globally before importing the components: this repo compiles JSX with the
 * classic transform (tsconfig `jsx: "preserve"`), so a component that does not
 * import React itself resolves it from the global scope.
 */
let rtl: typeof import("@testing-library/react");
let FAQSection: typeof import("./FAQSection").default;
let TransactionGuidance: typeof import("./TransactionGuidance").default;

const t = dictionaries.en.help;

before(async () => {
  setupDomGlobals();
  (globalThis as typeof globalThis & { React: typeof React }).React = React;

  rtl = await import("@testing-library/react");
  FAQSection = (await import("./FAQSection")).default;
  TransactionGuidance = (await import("./TransactionGuidance")).default;
});

describe("help sections render each entry's own metadata", () => {
  beforeEach(() => {
    setupDomGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    rtl.cleanup();
  });

  it("labels every FAQ card with that entry's category", () => {
    rtl.render(React.createElement(I18nProvider, null, React.createElement(FAQSection)));

    for (const item of t.faq.items) {
      const question = rtl.screen.getByText(item.q);
      const badge = question.closest("button")?.querySelector("span");
      assert.equal(
        badge?.textContent?.trim(),
        t.faq.categories[faqCategoryByItemId[item.id]],
        `badge of "${item.id}" does not match its category`,
      );
    }
  });

  it("still filters by category after the ids were introduced", () => {
    rtl.render(React.createElement(I18nProvider, null, React.createElement(FAQSection)));

    const filter = rtl.screen.getByLabelText(t.faq.filterAria) as HTMLSelectElement;
    rtl.fireEvent.change(filter, { target: { value: "staking" } });

    const staking = t.faq.items.filter(item => faqCategoryByItemId[item.id] === "staking");
    assert.equal(staking.length, 2, "fixture expectation changed — update this check");

    for (const item of staking) {
      assert.ok(rtl.screen.getByText(item.q), `staking question missing: ${item.q}`);
    }
    for (const item of t.faq.items.filter(i => faqCategoryByItemId[i.id] !== "staking")) {
      assert.equal(
        rtl.screen.queryByText(item.q),
        null,
        `question from another category is still listed: ${item.q}`,
      );
    }
  });

  it("labels every guidance issue with its own severity", () => {
    rtl.render(React.createElement(I18nProvider, null, React.createElement(TransactionGuidance)));

    for (const issue of t.guidance.issues) {
      const badge = rtl.screen.getByText(issue.title).closest("div")?.parentElement?.querySelector("span");
      assert.equal(
        badge?.textContent?.trim(),
        t.guidance.severity[guidanceIssueSeverityById[issue.id]],
        `severity badge of "${issue.id}" is wrong`,
      );
    }
  });

  it("opens the detail view of the selected issue with its severity", () => {
    rtl.render(React.createElement(I18nProvider, null, React.createElement(TransactionGuidance)));

    const issue = t.guidance.issues[1];
    rtl.fireEvent.click(rtl.screen.getByText(issue.title));

    const priority = t.guidance.priority.replace(
      "{severity}",
      t.guidance.severity[guidanceIssueSeverityById[issue.id]].toUpperCase(),
    );
    assert.ok(rtl.screen.getByText(priority), `priority badge not rendered: ${priority}`);

    rtl.fireEvent.click(rtl.screen.getByText(t.guidance.symptoms));
    for (const symptom of issue.symptoms) {
      assert.ok(rtl.screen.getByText(symptom), `symptom not rendered: ${symptom}`);
    }
  });
});
