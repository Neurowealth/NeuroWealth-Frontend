import assert from "node:assert/strict";
import test from "node:test";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
}

function getNextTheme(state: ThemeState): ThemeMode {
  if (state.theme === "light") return "dark";
  if (state.theme === "dark") return "light";
  return state.resolvedTheme === "light" ? "dark" : "light";
}

function getAriaLabel(resolvedTheme: ResolvedTheme): string {
  return resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

test("ThemeToggle — toggle from light to dark", () => {
  const next = getNextTheme({ theme: "light", resolvedTheme: "light" });
  assert.equal(next, "dark");
});

test("ThemeToggle — toggle from dark to light", () => {
  const next = getNextTheme({ theme: "dark", resolvedTheme: "dark" });
  assert.equal(next, "light");
});

test("ThemeToggle — toggle from system with dark resolved", () => {
  const next = getNextTheme({ theme: "system", resolvedTheme: "dark" });
  assert.equal(next, "light");
});

test("ThemeToggle — toggle from system with light resolved", () => {
  const next = getNextTheme({ theme: "system", resolvedTheme: "light" });
  assert.equal(next, "dark");
});

test("ThemeToggle — aria label for dark resolved says switch to light", () => {
  const label = getAriaLabel("dark");
  assert.equal(label, "Switch to light mode");
});

test("ThemeToggle — aria label for light resolved says switch to dark", () => {
  const label = getAriaLabel("light");
  assert.equal(label, "Switch to dark mode");
});

test("ThemeToggle — aria labels are different for each mode", () => {
  const darkLabel = getAriaLabel("dark");
  const lightLabel = getAriaLabel("light");
  assert.notEqual(darkLabel, lightLabel);
});
