import assert from "node:assert/strict";
import test from "node:test";

import { dictionaries, faqCategoryByItemId, guidanceIssueSeverityById } from "./messages";

/**
 * Guards the coupling between the help translation arrays and the metadata
 * that used to be attached to them by array position.
 *
 * The types already reject a *missing* metadata entry; these checks cover the
 * runtime data itself: every locale must list the same ids in the same order,
 * every id a locale uses must resolve in the metadata maps, and the per-id
 * values must still match what the old index-based arrays produced — so a
 * reorder or a length change can never silently re-label an entry.
 */

const locales = Object.entries(dictionaries);
const [, referenceFaqIds] = locales.map(([name]) => [name, faqIdsOf(name)])[0];

function faqIdsOf(locale: string): string[] {
  return dictionaries[locale as keyof typeof dictionaries].help.faq.items.map(item => item.id);
}

function issueIdsOf(locale: string): string[] {
  return dictionaries[locale as keyof typeof dictionaries].help.guidance.issues.map(issue => issue.id);
}

test("every locale exposes the same FAQ ids in the same order", () => {
  assert.ok(locales.length > 1, "expected more than one locale to compare");
  assert.equal(referenceFaqIds.length, 12, "FAQ count changed — update the ids and this expectation together");
  assert.equal(new Set(referenceFaqIds).size, referenceFaqIds.length, "duplicate FAQ id");

  for (const [name] of locales) {
    assert.deepEqual(faqIdsOf(name), referenceFaqIds, `locale "${name}" has a different FAQ id order`);
  }
});

test("every locale exposes the same guidance issue ids in the same order", () => {
  const [, referenceIssueIds] = locales.map(([name]) => [name, issueIdsOf(name)])[0];
  assert.equal(referenceIssueIds.length, 6, "issue count changed — update the ids and this expectation together");
  assert.equal(new Set(referenceIssueIds).size, referenceIssueIds.length, "duplicate issue id");

  for (const [name] of locales) {
    assert.deepEqual(issueIdsOf(name), referenceIssueIds, `locale "${name}" has a different issue id order`);
  }
});

test("every FAQ id resolves to a category present in each locale", () => {
  for (const [name, dictionary] of locales) {
    for (const item of dictionary.help.faq.items) {
      const category = faqCategoryByItemId[item.id];
      assert.ok(category, `${name}: FAQ "${item.id}" has no category`);
      assert.ok(
        dictionary.help.faq.categories[category],
        `${name}: category "${category}" of FAQ "${item.id}" is missing from the dictionary`,
      );
    }
  }
});

test("every issue id resolves to a severity present in each locale", () => {
  for (const [name, dictionary] of locales) {
    for (const issue of dictionary.help.guidance.issues) {
      const severity = guidanceIssueSeverityById[issue.id];
      assert.ok(severity, `${name}: issue "${issue.id}" has no severity`);
      assert.ok(
        dictionary.help.guidance.severity[severity],
        `${name}: severity "${severity}" of issue "${issue.id}" is missing from the dictionary`,
      );
    }
  }
});

test("the metadata maps contain no ids the dictionaries do not use", () => {
  const usedFaqIds = new Set(faqIdsOf(locales[0][0]));
  assert.deepEqual(
    Object.keys(faqCategoryByItemId).filter(id => !usedFaqIds.has(id)),
    [],
    "faqCategoryByItemId has entries for ids that no longer exist",
  );

  const usedIssueIds = new Set(issueIdsOf(locales[0][0]));
  assert.deepEqual(
    Object.keys(guidanceIssueSeverityById).filter(id => !usedIssueIds.has(id)),
    [],
    "guidanceIssueSeverityById has entries for ids that no longer exist",
  );
});

test("the per-id metadata reproduces the previous index-based assignment", () => {
  // The arrays each component used to index into, in the order they were
  // written. Equality here is what proves this refactor changed no label.
  const legacyFaqCategoriesByIndex = [
    "gettingStarted",
    "gettingStarted",
    "security",
    "security",
    "transactions",
    "transactions",
    "transactions",
    "assets",
    "assets",
    "staking",
    "staking",
    "support",
  ];
  const legacyIssueSeveritiesByIndex = ["medium", "high", "high", "medium", "medium", "low"];

  for (const [name, dictionary] of locales) {
    assert.deepEqual(
      dictionary.help.faq.items.map(item => faqCategoryByItemId[item.id]),
      legacyFaqCategoriesByIndex,
      `${name}: FAQ categories no longer match the pre-refactor assignment`,
    );
    assert.deepEqual(
      dictionary.help.guidance.issues.map(issue => guidanceIssueSeverityById[issue.id]),
      legacyIssueSeveritiesByIndex,
      `${name}: issue severities no longer match the pre-refactor assignment`,
    );
  }
});
