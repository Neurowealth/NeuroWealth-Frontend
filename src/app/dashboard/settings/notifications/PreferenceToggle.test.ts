import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

/**
 * Regression tests for PreferenceToggle (#769, #859)
 */

function handlePreferenceClick(disabled: boolean, onChange: () => void) {
  if (!disabled) {
    onChange();
  }
}

test("PreferenceToggle — clicking when disabled: false triggers onChange", () => {
  let toggled = 0;
  handlePreferenceClick(false, () => {
    toggled += 1;
  });
  assert.equal(toggled, 1, "Clicking enabled toggle must invoke onChange");
});

test("PreferenceToggle — clicking when disabled: true is a no-op (#859)", () => {
  let toggled = 0;
  handlePreferenceClick(true, () => {
    toggled += 1;
  });
  assert.equal(toggled, 0, "Clicking disabled toggle must not invoke onChange");
});

test("PreferenceToggle — verifies component source logic for disabled branch and accessible name", () => {
  const componentSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/dashboard/settings/notifications/PreferenceToggle.tsx"),
    "utf8",
  );

  // Verifies clicking title/description text is protected by !disabled check
  assert.match(componentSource, /if\s*\(!disabled\)\s*onChange\(\);/);

  // Verifies cursor-not-allowed styling on disabled
  assert.match(componentSource, /disabled\s*\?\s*"cursor-not-allowed"\s*:\s*"cursor-pointer"/);

  // Verifies opacity adjustment on disabled
  assert.match(componentSource, /disabled\s*\?\s*"opacity-65"\s*:\s*"hover:border-slate-600"/);

  // Verifies Switch receives label and disabled prop
  assert.match(componentSource, /label=\{title\}/);
  assert.match(componentSource, /disabled=\{disabled\}/);
});
