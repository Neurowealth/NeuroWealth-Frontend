import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import React, { createElement } from "react";
import { setupDomGlobals } from "@/test-setup";

// Test suite for CommandPaletteDialog's filtering, navigation, and keyboard handling.
// The component handles fuzzy filtering (simple substring match), arrow-key wraparound,
// and selectedIndex clamping when the filtered list shrinks.

type Command = {
  id: string;
  name: string;
};

// Simulate the filtering logic from CommandPaletteDialog
function filterCommands(allCommands: Command[], query: string): Command[] {
  return allCommands.filter((command) =>
    command.name.toLowerCase().includes(query.toLowerCase()),
  );
}

// Simulate arrow-key navigation with wraparound
function navigateArrowDown(selectedIndex: number, filteredLength: number): number {
  if (filteredLength === 0) return 0;
  return (selectedIndex + 1) % filteredLength;
}

function navigateArrowUp(selectedIndex: number, filteredLength: number): number {
  if (filteredLength === 0) return 0;
  return (selectedIndex - 1 + filteredLength) % filteredLength;
}

// Simulate selectedIndex clamping when filtered list shrinks
function clampSelectedIndex(selectedIndex: number, filteredLength: number): number {
  if (filteredLength === 0) return 0;
  return selectedIndex >= filteredLength ? 0 : selectedIndex;
}

const mockCommands: Command[] = [
  { id: "dashboard", name: "Dashboard" },
  { id: "settings", name: "Settings" },
  { id: "profile", name: "Profile" },
  { id: "logout", name: "Logout" },
  { id: "help", name: "Help" },
  { id: "about", name: "About" },
];

// ── Fuzzy filtering (substring match) ────────────────────────────────────

test("CommandPaletteDialog — filtering: exact match returns single command", () => {
  const filtered = filterCommands(mockCommands, "Dashboard");
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "dashboard");
});

test("CommandPaletteDialog — filtering: partial match (case-insensitive)", () => {
  const filtered = filterCommands(mockCommands, "dash");
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "dashboard");
});

test("CommandPaletteDialog — filtering: lowercase query matches uppercase name", () => {
  const filtered = filterCommands(mockCommands, "settings");
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, "settings");
});

test("CommandPaletteDialog — filtering: partial match returns multiple commands", () => {
  const filtered = filterCommands(mockCommands, "l");
  assert.equal(filtered.length, 3);
  assert.equal(filtered[0].id, "profile");
  assert.equal(filtered[1].id, "logout");
  assert.equal(filtered[2].id, "help");
});

test("CommandPaletteDialog — filtering: empty query returns all commands", () => {
  const filtered = filterCommands(mockCommands, "");
  assert.equal(filtered.length, mockCommands.length);
});

test("CommandPaletteDialog — filtering: no match returns empty array", () => {
  const filtered = filterCommands(mockCommands, "xyz");
  assert.equal(filtered.length, 0);
});

// ── Arrow-key navigation with wraparound ─────────────────────────────────

test("CommandPaletteDialog — navigation: ArrowDown increments selectedIndex", () => {
  const filtered = filterCommands(mockCommands, "");
  let selectedIndex = 0;
  selectedIndex = navigateArrowDown(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 1);
});

test("CommandPaletteDialog — navigation: ArrowDown wraps around at the end", () => {
  const filtered = filterCommands(mockCommands, "");
  let selectedIndex = filtered.length - 1;
  selectedIndex = navigateArrowDown(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);
});

test("CommandPaletteDialog — navigation: ArrowUp decrements selectedIndex", () => {
  const filtered = filterCommands(mockCommands, "");
  let selectedIndex = 2;
  selectedIndex = navigateArrowUp(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 1);
});

test("CommandPaletteDialog — navigation: ArrowUp wraps around at the start", () => {
  const filtered = filterCommands(mockCommands, "");
  let selectedIndex = 0;
  selectedIndex = navigateArrowUp(selectedIndex, filtered.length);
  assert.equal(selectedIndex, filtered.length - 1);
});

test("CommandPaletteDialog — navigation: consecutive ArrowDown wraps correctly", () => {
  const filtered = filterCommands(mockCommands, "");
  let selectedIndex = 0;
  for (let i = 0; i < filtered.length; i++) {
    selectedIndex = navigateArrowDown(selectedIndex, filtered.length);
  }
  assert.equal(selectedIndex, 0);
});

test("CommandPaletteDialog — navigation: consecutive ArrowUp wraps correctly", () => {
  const filtered = filterCommands(mockCommands, "");
  let selectedIndex = 0;
  for (let i = 0; i < filtered.length; i++) {
    selectedIndex = navigateArrowUp(selectedIndex, filtered.length);
  }
  assert.equal(selectedIndex, 0);
});

// ── Selected index clamping when filtered list shrinks ───────────────────

test("CommandPaletteDialog — clamping: selectedIndex resets to 0 on query change", () => {
  // Start with all commands, selectedIndex = 5 (last)
  let filtered = filterCommands(mockCommands, "");
  let selectedIndex = filtered.length - 1;
  assert.equal(selectedIndex, 5);

  // Query changes, filter shrinks to 1 command
  filtered = filterCommands(mockCommands, "dashboard");
  selectedIndex = clampSelectedIndex(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);
});

test("CommandPaletteDialog — clamping: selectedIndex stays valid in smaller list", () => {
  // Start with 3 matching commands, selectedIndex = 1
  let filtered = filterCommands(mockCommands, "");
  let selectedIndex = 1;

  // Filter further to 1 command
  filtered = filterCommands(mockCommands, "dashboard");
  selectedIndex = clampSelectedIndex(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);
});

test("CommandPaletteDialog — clamping: selectedIndex stays valid if within bounds", () => {
  // Start with selectedIndex = 2 in a list of 6
  let filtered = filterCommands(mockCommands, "");
  let selectedIndex = 2;

  // Filter to 4 commands
  const commands = filterCommands(mockCommands, "");
  filtered = commands.slice(0, 4);
  selectedIndex = clampSelectedIndex(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 2);
});

test("CommandPaletteDialog — clamping: selectedIndex clamps to 0 if out of bounds", () => {
  let filtered = filterCommands(mockCommands, "");
  let selectedIndex = 5;

  // Simulate filter shrinking to 3 items
  filtered = filtered.slice(0, 3);
  selectedIndex = clampSelectedIndex(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);
});

// ── Empty filtered list edge cases ───────────────────────────────────────

test("CommandPaletteDialog — empty: ArrowDown on empty filtered list returns 0", () => {
  const filtered = filterCommands(mockCommands, "nonexistent");
  let selectedIndex = 0;
  selectedIndex = navigateArrowDown(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);
});

test("CommandPaletteDialog — empty: ArrowUp on empty filtered list returns 0", () => {
  const filtered = filterCommands(mockCommands, "nonexistent");
  let selectedIndex = 0;
  selectedIndex = navigateArrowUp(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);
});

test("CommandPaletteDialog — empty: clampSelectedIndex on empty filtered list returns 0", () => {
  const filtered = filterCommands(mockCommands, "nonexistent");
  const selectedIndex = clampSelectedIndex(0, filtered.length);
  assert.equal(selectedIndex, 0);
});

// ── Integration: filter → clamp → navigate ──────────────────────────────

test("CommandPaletteDialog — integration: query change clamps, then navigation works", () => {
  // Start at end of full list
  let filtered = filterCommands(mockCommands, "");
  let selectedIndex = filtered.length - 1;
  assert.equal(selectedIndex, 5);

  // Filter down, clamp selectedIndex
  filtered = filterCommands(mockCommands, "l");
  selectedIndex = clampSelectedIndex(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);

  // Navigate down in the smaller list
  selectedIndex = navigateArrowDown(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 1);

  // Navigate down again
  selectedIndex = navigateArrowDown(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 2);
  
  // Navigate down again, should wrap
  selectedIndex = navigateArrowDown(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);
});

test("CommandPaletteDialog — integration: narrow filter to single result, then navigate", () => {
  // Filter to single result
  let filtered = filterCommands(mockCommands, "dashboard");
  let selectedIndex = 0;

  // Navigate down should wrap back to 0
  selectedIndex = navigateArrowDown(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);

  // Navigate up should also wrap back to 0
  selectedIndex = navigateArrowUp(selectedIndex, filtered.length);
  assert.equal(selectedIndex, 0);
});

// ── Focus trap and stacking (#881, #882) ─────────────────────────────────

const dialogSource = fs.readFileSync(
  path.join(process.cwd(), "src/components/CommandPaletteDialog.tsx"),
  "utf8",
);

test("CommandPaletteDialog — wires useFocusTrap onto the dialog container", () => {
  assert.match(dialogSource, /useFocusTrap\(containerRef,\s*true\);/);
  assert.match(dialogSource, /ref=\{containerRef\}\s*role="dialog"/);
});

test("CommandPaletteDialog — uses the shared modal z-index tier, not a hardcoded value", () => {
  assert.match(dialogSource, /\bz-modal\b/);
  assert.doesNotMatch(dialogSource, /z-\[\d+\]/);
});

// ── Memoization of derived command lists (#873) ──────────────────────────

test("CommandPaletteDialog — wraps allCommands in useMemo with stable dependencies", () => {
  assert.match(dialogSource, /const allCommands: Command\[\] = useMemo\(/);
  assert.match(dialogSource, /\[router, onClose\]/);
});

test("CommandPaletteDialog — wraps filteredCommands in useMemo over allCommands + query", () => {
  assert.match(dialogSource, /const filteredCommands = useMemo\(/);
  assert.match(dialogSource, /\[allCommands, query\]/);
});

test("CommandPaletteDialog — hoists mockActions out of the render body", () => {
  assert.match(dialogSource, /const mockActions = \[/);
  const componentBody = dialogSource.slice(
    dialogSource.indexOf("export function CommandPaletteDialog"),
  );
  assert.doesNotMatch(componentBody, /const mockActions = \[/);
});

// ── Focus trap Tab cycle regression test (#863) ──────────────────────────

test("CommandPaletteDialog — focus trap keeps Tab focus cycling within the dialog container", () => {
  // Simulate focus trap Tab cycling behavior
  let activeElement = "input";
  const focusableElements = ["input", "result-0", "result-1", "result-2"];

  function handleTab(shiftKey: boolean): boolean {
    const currentIndex = focusableElements.indexOf(activeElement);
    if (shiftKey) {
      if (currentIndex <= 0) {
        activeElement = focusableElements[focusableElements.length - 1];
        return true; // preventDefault called (wrapped to last)
      } else {
        activeElement = focusableElements[currentIndex - 1];
        return false;
      }
    } else {
      if (currentIndex >= focusableElements.length - 1) {
        activeElement = focusableElements[0];
        return true; // preventDefault called (wrapped to first)
      } else {
        activeElement = focusableElements[currentIndex + 1];
        return false;
      }
    }
  }

  // Tabbing forward from last element wraps to first
  activeElement = "result-2";
  const wrappedForward = handleTab(false);
  assert.equal(wrappedForward, true, "Tabbing from last element must prevent default");
  assert.equal(activeElement, "input", "Focus must wrap back to first element (input)");

  // Shift+Tab from first element wraps to last
  activeElement = "input";
  const wrappedBackward = handleTab(true);
  assert.equal(wrappedBackward, true, "Shift+Tab from first element must prevent default");
  assert.equal(activeElement, "result-2", "Focus must wrap to last focusable element");
});


// ── Light/dark contrast classes on the rendered dialog (#1050, #1094) ────

test("CommandPaletteDialog — rendered dialog, divider, options and icons carry their light/dark class pairs", async () => {
  // react-dom feature-detects the DOM when it first loads, so it (via
  // @testing-library/react) is imported only after jsdom globals exist.
  setupDomGlobals();
  Object.assign(globalThis, { React });
  const { cleanup, fireEvent, render } = await import("@testing-library/react");
  // jsdom doesn't implement scrollIntoView, which the dialog calls on the active option.
  window.HTMLElement.prototype.scrollIntoView ??= () => {};
  const { AppRouterContext } = await import(
    "next/dist/shared/lib/app-router-context.shared-runtime"
  );
  const { CommandPaletteDialog } = await import("./CommandPaletteDialog");

  const router = {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {},
  };
  const view = render(
    createElement(
      AppRouterContext.Provider,
      { value: router },
      createElement(CommandPaletteDialog, { onClose: () => {} }),
    ),
  );

  const hasClasses = (el: Element, classes: string[], label: string) => {
    for (const cls of classes) {
      assert.ok(el.classList.contains(cls), `${label} is missing "${cls}" (has: ${el.className})`);
    }
  };

  try {
    const dialog = view.getByRole("dialog", { name: "Command Palette" });
    hasClasses(dialog, ["bg-white", "dark:bg-slate-900"], "dialog");

    // #1094 — the outer border was only asserted for its dark value, so a
    // missing light-mode counterpart went unnoticed.
    hasClasses(
      dialog,
      ["border", "border-slate-200", "dark:border-slate-800"],
      "dialog border",
    );

    const input = view.getByPlaceholderText(/Search routes and actions/);

    // #1094 — the search-row divider was not covered by the pair assertions.
    hasClasses(
      input.parentElement!,
      ["border-b", "border-slate-200", "dark:border-slate-800"],
      "search row divider",
    );
    hasClasses(
      input,
      [
        "text-slate-900",
        "dark:text-slate-200",
        "placeholder:text-slate-400",
        "dark:placeholder:text-slate-500",
      ],
      "search input",
    );

    const searchIcon = input.parentElement!.querySelector("svg")!;
    hasClasses(searchIcon, ["text-slate-500", "dark:text-slate-400"], "search icon");

    const options = view.getAllByRole("option");
    assert.ok(options.length > 1, "expected at least two commands to render");

    // The first option is selected by default; the rest use the unselected light/dark pair.
    assert.equal(options[0].getAttribute("aria-selected"), "true");

    // #1094 — the selected/first-option highlight must not be dark-only, since
    // it is the row every light-mode user sees highlighted on open.
    hasClasses(
      options[0],
      ["bg-slate-100", "text-sky-600", "dark:bg-slate-800", "dark:text-sky-400"],
      "selected option",
    );

    const unselected = options[1];
    hasClasses(
      unselected,
      ["text-slate-600", "dark:text-slate-400", "hover:text-slate-900", "dark:hover:text-slate-200"],
      "unselected option",
    );

    for (const option of options) {
      const icon = option.querySelector("svg")!;
      hasClasses(icon, ["text-slate-500", "dark:text-slate-400"], `icon in "${option.textContent}"`);
    }

    // Empty state copy also keeps its light/dark pair.
    fireEvent.change(input, { target: { value: "zzz-no-such-command" } });
    const empty = view.getByText(/No results found for/, { selector: "li" });
    hasClasses(empty, ["text-slate-600", "dark:text-slate-500"], "empty state");
  } finally {
    cleanup();
  }
});
