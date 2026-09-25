import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("theme swatches apply a live preview via setAppTheme", () => {
  assert.match(source, /setTheme: setAppTheme/);
  assert.match(source, /setAppTheme\(theme\)/);
});

test("Cancel reverts both the form draft and the applied theme to the saved value", () => {
  assert.match(source, /handleCancel: revertForm/);
  assert.match(source, /const handleCancel = \(\) => \{/);
  assert.match(source, /revertForm\(\)/);
  assert.match(source, /setAppTheme\(saved\.theme\)/);
});

test("Save commits the draft theme through onSaveSuccess", () => {
  assert.match(source, /onSaveSuccess: \(savedData\) => \{/);
  assert.match(source, /setAppTheme\(savedData\.theme\)/);
});
