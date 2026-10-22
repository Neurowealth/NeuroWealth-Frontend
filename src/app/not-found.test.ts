import assert from "node:assert/strict";
import test from "node:test";
import React, { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";
import { dictionaries } from "@/lib/i18n/messages";
import NotFound from "./not-found";

setupDomGlobals();
// tsx compiles JSX with the classic runtime, which expects a global React.
Object.assign(globalThis, { React });

test("not-found: en dictionary has all four notFound keys as non-empty strings", () => {
  const m = dictionaries.en.notFound;
  assert.equal(typeof m.title, "string");
  assert.ok(m.title.trim().length > 0, "title must not be empty");
  assert.equal(typeof m.description, "string");
  assert.ok(m.description.trim().length > 0, "description must not be empty");
  assert.equal(typeof m.primaryAction, "string");
  assert.ok(m.primaryAction.trim().length > 0, "primaryAction must not be empty");
  assert.equal(typeof m.secondaryAction, "string");
  assert.ok(m.secondaryAction.trim().length > 0, "secondaryAction must not be empty");
});

test("not-found: fr dictionary has all four notFound keys as non-empty strings", () => {
  const m = dictionaries.fr.notFound;
  assert.equal(typeof m.title, "string");
  assert.ok(m.title.trim().length > 0, "title must not be empty");
  assert.equal(typeof m.description, "string");
  assert.ok(m.description.trim().length > 0, "description must not be empty");
  assert.equal(typeof m.primaryAction, "string");
  assert.ok(m.primaryAction.trim().length > 0, "primaryAction must not be empty");
  assert.equal(typeof m.secondaryAction, "string");
  assert.ok(m.secondaryAction.trim().length > 0, "secondaryAction must not be empty");
});

test("not-found: en and fr notFound keys are distinct (translated, not identical copies)", () => {
  const en = dictionaries.en.notFound;
  const fr = dictionaries.fr.notFound;
  assert.notEqual(en.title, fr.title, "en and fr titles should differ");
  assert.notEqual(en.primaryAction, fr.primaryAction, "en and fr primaryAction should differ");
  assert.notEqual(en.secondaryAction, fr.secondaryAction, "en and fr secondaryAction should differ");
});

test("not-found: renders en title and action labels from the i18n dictionary", () => {
  const m = dictionaries.en.notFound;
  const { getByRole, getByText } = render(
    createElement(I18nProvider, null, createElement(NotFound)),
  );

  // Title is rendered inside an <h1>
  getByRole("heading", { level: 1, name: m.title });

  // Both action links are rendered
  getByText(m.primaryAction);
  getByText(m.secondaryAction);

  cleanup();
});

test("not-found: 404 status code is visible in the page", () => {
  const { getByText } = render(
    createElement(I18nProvider, null, createElement(NotFound)),
  );

  getByText("404");
  cleanup();
});
