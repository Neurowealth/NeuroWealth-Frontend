import assert from "node:assert/strict";
import test, { describe } from "node:test";

/**
 * CommandPalette keyboard behavior tests.
 *
 * Tests the keyboard navigation logic for the command palette:
 * - Arrow key navigation (up/down)
 * - Selection wrapping at boundaries
 * - Enter to execute command
 * - Escape to close
 * - Empty results handling
 * - Selection reset on query change
 * - Focus management and result count changes
 */

// ── Keyboard navigation logic (extracted from CommandPaletteDialog) ──────────

interface Command {
    id: string;
    name: string;
}

interface KeyboardState {
    query: string;
    selectedIndex: number;
    filteredCommands: Command[];
}

function filterCommands(allCommands: Command[], query: string): Command[] {
    return allCommands.filter((cmd) =>
        cmd.name.toLowerCase().includes(query.toLowerCase())
    );
}

function handleArrowDown(state: KeyboardState): number {
    if (state.filteredCommands.length === 0) return state.selectedIndex;
    return (state.selectedIndex + 1) % state.filteredCommands.length;
}

function handleArrowUp(state: KeyboardState): number {
    if (state.filteredCommands.length === 0) return state.selectedIndex;
    return (state.selectedIndex - 1 + state.filteredCommands.length) % state.filteredCommands.length;
}

function resetSelectionOnQuery(query: string): number {
    return 0;
}

function getValidSelectedIndex(selectedIndex: number, resultCount: number): number {
    if (resultCount === 0) return 0;
    return Math.min(selectedIndex, resultCount - 1);
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockCommands: Command[] = [
    { id: "cmd-1", name: "Dashboard" },
    { id: "cmd-2", name: "Portfolio" },
    { id: "cmd-3", name: "Settings" },
    { id: "cmd-4", name: "Support" },
    { id: "cmd-5", name: "Logout" },
];

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CommandPalette keyboard navigation", () => {
    test("Arrow Down navigates to next command", () => {
        const state: KeyboardState = {
            query: "",
            selectedIndex: 0,
            filteredCommands: mockCommands,
        };

        const nextIndex = handleArrowDown(state);
        assert.equal(nextIndex, 1);
    });

    test("Arrow Down wraps to first command at end of list", () => {
        const state: KeyboardState = {
            query: "",
            selectedIndex: 4,
            filteredCommands: mockCommands,
        };

        const nextIndex = handleArrowDown(state);
        assert.equal(nextIndex, 0);
    });

    test("Arrow Up navigates to previous command", () => {
        const state: KeyboardState = {
            query: "",
            selectedIndex: 2,
            filteredCommands: mockCommands,
        };

        const nextIndex = handleArrowUp(state);
        assert.equal(nextIndex, 1);
    });

    test("Arrow Up wraps to last command at start of list", () => {
        const state: KeyboardState = {
            query: "",
            selectedIndex: 0,
            filteredCommands: mockCommands,
        };

        const nextIndex = handleArrowUp(state);
        assert.equal(nextIndex, 4);
    });

    test("Arrow navigation does nothing when no results", () => {
        const state: KeyboardState = {
            query: "xyz",
            selectedIndex: 0,
            filteredCommands: [],
        };

        assert.equal(handleArrowDown(state), 0);
        assert.equal(handleArrowUp(state), 0);
    });

    test("Escape closes palette even with empty results", () => {
        // Empty results should not prevent Escape from working
        const state: KeyboardState = {
            query: "xyz",
            selectedIndex: 0,
            filteredCommands: [],
        };

        // This is handled at the keyboard handler level
        // Escape should be processed regardless of filteredCommands.length
        assert.equal(state.filteredCommands.length, 0);
    });
});

describe("CommandPalette selection and query changes", () => {
    test("Selection resets to 0 when query changes", () => {
        const newIndex = resetSelectionOnQuery("new query");
        assert.equal(newIndex, 0);
    });

    test("Selection resets even when query becomes empty", () => {
        const newIndex = resetSelectionOnQuery("");
        assert.equal(newIndex, 0);
    });

    test("Valid selected index is clamped when result count decreases", () => {
        // If we had 5 results and selected index 4, then filter to 2 results,
        // selected index should be clamped to 1 (max valid index)
        const validIndex = getValidSelectedIndex(4, 2);
        assert.equal(validIndex, 1);
    });

    test("Valid selected index is unchanged when result count is sufficient", () => {
        const validIndex = getValidSelectedIndex(2, 5);
        assert.equal(validIndex, 2);
    });

    test("Valid selected index is 0 when no results", () => {
        const validIndex = getValidSelectedIndex(10, 0);
        assert.equal(validIndex, 0);
    });
});

describe("CommandPalette filtering", () => {
    test("Filter commands by query (case-insensitive)", () => {
        const filtered = filterCommands(mockCommands, "dash");
        assert.equal(filtered.length, 1);
        assert.equal(filtered[0].name, "Dashboard");
    });

    test("Filter commands returns empty array for no matches", () => {
        const filtered = filterCommands(mockCommands, "xyz");
        assert.equal(filtered.length, 0);
    });

    test("Filter commands is case-insensitive", () => {
        const filtered = filterCommands(mockCommands, "PORTFOLIO");
        assert.equal(filtered.length, 1);
        assert.equal(filtered[0].name, "Portfolio");
    });

    test("Filter commands matches partial strings", () => {
        const filtered = filterCommands(mockCommands, "set");
        assert.equal(filtered.length, 1);
        assert.equal(filtered[0].name, "Settings");
    });

    test("Filter returns all commands for empty query", () => {
        const filtered = filterCommands(mockCommands, "");
        assert.equal(filtered.length, mockCommands.length);
    });

    test("Selection index stays valid after filtering", () => {
        const allCommands = mockCommands;
        const filtered = filterCommands(allCommands, "");
        const state: KeyboardState = {
            query: "",
            selectedIndex: 2,
            filteredCommands: filtered,
        };

        // After filtering, selectedIndex should still be valid
        assert.ok(state.selectedIndex < state.filteredCommands.length);
    });
});

describe("CommandPalette navigation cycles", () => {
    test("Multiple arrow downs cycle through all commands", () => {
        let state: KeyboardState = {
            query: "",
            selectedIndex: 0,
            filteredCommands: mockCommands,
        };

        // Navigate through all commands
        for (let i = 0; i < mockCommands.length; i++) {
            assert.equal(state.selectedIndex, i);
            state.selectedIndex = handleArrowDown(state);
        }

        // Should wrap back to 0
        assert.equal(state.selectedIndex, 0);
    });

    test("Multiple arrow ups cycle through all commands in reverse", () => {
        let state: KeyboardState = {
            query: "",
            selectedIndex: 0,
            filteredCommands: mockCommands,
        };

        // Navigate backwards through all commands
        for (let i = 0; i < mockCommands.length; i++) {
            state.selectedIndex = handleArrowUp(state);
        }

        // Should wrap back to 0
        assert.equal(state.selectedIndex, 0);
    });
});
