import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { getStorageKey, STORAGE_KEYS } from "./storage-keys";

// Regression coverage for #581: OnboardingSettings previously hardcoded raw
// localStorage key string literals ("user-strategy", "first-deposit") instead
// of reading them from this registry. It has since been migrated to use
// STORAGE_KEYS directly — these tests guard against that regressing.

test("getStorageKey returns the registered value for onboarding keys", () => {
  assert.equal(getStorageKey("ONBOARDING_USER_STRATEGY"), "user-strategy");
  assert.equal(getStorageKey("ONBOARDING_FIRST_DEPOSIT"), "first-deposit");
  assert.equal(getStorageKey("ONBOARDING_STATE"), "onboarding-state");
});

test("OnboardingSettings.tsx sources its localStorage keys from STORAGE_KEYS, not string literals", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/components/settings/OnboardingSettings.tsx"),
    "utf8",
  );

  assert.match(source, /STORAGE_KEYS\.ONBOARDING_USER_STRATEGY/);
  assert.match(source, /STORAGE_KEYS\.ONBOARDING_FIRST_DEPOSIT/);

  // Guard against re-introducing the raw literals the registry replaced.
  assert.doesNotMatch(source, /localStorage\.\w+\(\s*["']user-strategy["']/);
  assert.doesNotMatch(source, /localStorage\.\w+\(\s*["']first-deposit["']/);
});

test("STORAGE_KEYS values are unique — no accidental key collisions", () => {
  const values = Object.values(STORAGE_KEYS);
  assert.equal(new Set(values).size, values.length);
});
