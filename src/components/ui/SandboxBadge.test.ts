import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { SandboxBadge } from "./SandboxBadge";
import { setupDomGlobals } from "@/test-setup";

setupDomGlobals();

test("SandboxBadge — renders scenario and default label", () => {
  const { container } = render(createElement(SandboxBadge, { scenario: "Test scenario" }));
  assert.ok(container.textContent?.includes("Sandbox: Test scenario"));
  cleanup();
});

test("SandboxBadge — renders custom label and includes dark-mode classes", () => {
  const { container } = render(
    createElement(SandboxBadge, { scenario: "Test scenario", label: "Custom Label" })
  );
  
  assert.ok(container.textContent?.includes("Custom Label: Test scenario"));
  
  const span = container.querySelector("span");
  assert.ok(span, "Span element should be rendered");
  
  const classes = span.className.split(" ");
  assert.ok(classes.includes("dark:bg-green-500/20"), "Missing dark mode background class");
  assert.ok(classes.includes("dark:text-green-400"), "Missing dark mode text class");
  
  cleanup();
});
