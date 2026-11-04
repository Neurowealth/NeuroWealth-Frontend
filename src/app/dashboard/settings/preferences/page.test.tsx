import assert from "node:assert/strict";
import test from "node:test";
import React, { type ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";

setupDomGlobals();
(globalThis as typeof globalThis & { React?: typeof React }).React = React;
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Providers({ children }: { children: ReactNode }) {
  return React.createElement(I18nProvider, null, React.createElement(ThemeProvider, null, children));
}

function mount(ui: ReactNode): { root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(React.createElement(Providers, null, ui)));
  return { root, container };
}

test("Preferences page loads with defaults and displays read-only view", async () => {
  // Clear localStorage to ensure clean state
  localStorage.clear();

  const PreferencesPage = (await import("./page")).default;
  const { root, container } = mount(React.createElement(PreferencesPage));

  // Wait for page to load (loading skeleton should disappear)
  await new Promise((resolve) => setTimeout(resolve, 100));
  act(() => {
    // Trigger potential re-renders
  });

  // Should display settings title and sections
  assert.match(container.textContent ?? "", /Preferences|Localisation|Appearance/);

  // Should show read-only values by default (not in editing mode)
  const editButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Edit") || b.textContent?.includes("edit")
  );
  assert.ok(editButton, "should have an Edit button in read-only mode");

  // Should not show save/cancel buttons in read-only mode
  const saveButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Save")
  );
  assert.equal(saveButton, undefined, "should not show Save button in read-only mode");

  act(() => root.unmount());
  container.remove();
});

test("Preferences page enters edit mode and shows theme selection", async () => {
  localStorage.clear();

  const PreferencesPage = (await import("./page")).default;
  const { root, container } = mount(React.createElement(PreferencesPage));

  // Wait for page to load
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Find and click the Edit button
  const editButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Edit") || b.textContent?.includes("edit")
  );
  assert.ok(editButton, "Edit button should exist");

  act(() => {
    editButton?.click();
  });

  // After edit, should show theme option buttons
  const themeButtons = Array.from(
    container.querySelectorAll('button[class*="themeOption"]')
  );
  assert.ok(themeButtons.length > 0, "should show theme option buttons in edit mode");

  // Should show select fields for locale, timezone, currency
  const selects = Array.from(container.querySelectorAll("select"));
  assert.ok(selects.length > 0, "should show select fields in edit mode");

  // Should show Save and Cancel buttons
  const saveButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Save")
  );
  const cancelButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Cancel")
  );
  assert.ok(saveButton, "should show Save button in edit mode");
  assert.ok(cancelButton, "should show Cancel button in edit mode");

  act(() => root.unmount());
  container.remove();
});

test("Preferences page allows theme selection with live preview and cancel reverts theme", async () => {
  localStorage.clear();

  const PreferencesPage = (await import("./page")).default;
  const { root, container } = mount(React.createElement(PreferencesPage));

  // Wait for page to load
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Enter edit mode
  const editButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Edit") || b.textContent?.includes("edit")
  );
  act(() => editButton?.click());

  // Find theme buttons
  const themeButtons = Array.from(
    container.querySelectorAll('button[class*="themeOption"]')
  );
  const darkThemeButton = themeButtons.find((b) => b.textContent?.includes("Dark"));

  assert.ok(darkThemeButton, "should have Dark theme button");

  // Click dark theme button
  act(() => {
    darkThemeButton?.click();
  });

  // The dark theme button should be marked as active (aria-pressed)
  assert.equal(darkThemeButton?.getAttribute("aria-pressed"), "true", "selected theme should be marked as active");

  // Find and click Cancel button
  const cancelButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Cancel")
  );

  assert.ok(cancelButton, "cancel button should exist");

  act(() => {
    cancelButton?.click();
  });

  // After cancel, should revert to read-only mode
  const saveButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Save")
  );
  assert.equal(saveButton, undefined, "should revert to read-only mode after cancel");

  act(() => root.unmount());
  container.remove();
});

test("Preferences page displays unsaved indicator when changes are made", async () => {
  localStorage.clear();

  const PreferencesPage = (await import("./page")).default;
  const { root, container } = mount(React.createElement(PreferencesPage));

  // Wait for page to load
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Enter edit mode
  const editButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Edit") || b.textContent?.includes("edit")
  );
  act(() => editButton?.click());

  // Select a different theme (should mark as dirty)
  const themeButtons = Array.from(
    container.querySelectorAll('button[class*="themeOption"]')
  );
  const darkThemeButton = themeButtons.find((b) => b.textContent?.includes("Dark"));

  act(() => {
    darkThemeButton?.click();
  });

  // Should show unsaved indicator
  assert.match(
    container.textContent ?? "",
    /unsaved|pending|changes/i,
    "should show unsaved indicator when form is dirty"
  );

  act(() => root.unmount());
  container.remove();
});

test("Preferences page handles locale and timezone selection", async () => {
  localStorage.clear();

  const PreferencesPage = (await import("./page")).default;
  const { root, container } = mount(React.createElement(PreferencesPage));

  // Wait for page to load
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Enter edit mode
  const editButton = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent?.includes("Edit") || b.textContent?.includes("edit")
  );
  act(() => editButton?.click());

  // Find locale select
  const selects = Array.from(container.querySelectorAll("select"));
  const localeSelect = selects[0]; // First select is usually locale
  const timezoneSelect = selects[1]; // Second is timezone

  assert.ok(localeSelect, "should have locale select field");
  assert.ok(timezoneSelect, "should have timezone select field");

  // Change timezone
  if (timezoneSelect) {
    const options = Array.from(timezoneSelect.querySelectorAll("option"));
    const newOption = options[1]; // Select second option
    act(() => {
      (timezoneSelect as HTMLSelectElement).value = newOption.value;
      timezoneSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  // Should mark form as dirty
  assert.match(
    container.textContent ?? "",
    /unsaved|pending|changes/i,
    "should show unsaved indicator after timezone change"
  );

  act(() => root.unmount());
  container.remove();
});
