import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

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
