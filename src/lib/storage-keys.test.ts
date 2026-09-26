import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { getStorageKey, STORAGE_KEYS } from "./storage-keys";

// Regression coverage for #581 + #954.
// #581: the step-scoped onboarding keys must come from this registry, never raw
// string literals. #954: both reset entry points must go through the shared
// reset so the flow state and the step-scoped records are cleared together.

test("getStorageKey returns the registered value for onboarding keys", () => {
  assert.equal(getStorageKey("ONBOARDING_USER_STRATEGY"), "user-strategy");
  assert.equal(getStorageKey("ONBOARDING_FIRST_DEPOSIT"), "first-deposit");
  assert.equal(getStorageKey("ONBOARDING_STATE"), "onboarding-state");
});

test("onboarding-state.ts sources the step-scoped keys from STORAGE_KEYS, not string literals", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/lib/onboarding-state.ts"),
    "utf8",
  );

  assert.match(source, /STORAGE_KEYS\.ONBOARDING_USER_STRATEGY/);
  assert.match(source, /STORAGE_KEYS\.ONBOARDING_FIRST_DEPOSIT/);

  // Guard against re-introducing the raw literals the registry replaced.
  assert.doesNotMatch(source, /localStorage\.\w+\(\s*["']user-strategy["']/);
  assert.doesNotMatch(source, /localStorage\.\w+\(\s*["']first-deposit["']/);
});

test("both onboarding reset entry points call the shared reset helper", () => {
  const settingsSource = fs.readFileSync(
    path.join(process.cwd(), "src/components/settings/OnboardingSettings.tsx"),
    "utf8",
  );
  const flowHookSource = fs.readFileSync(
    path.join(process.cwd(), "src/hooks/useOnboardingFlow.ts"),
    "utf8",
  );

  // #954 — a partial clear in either path is the regression this guards.
  assert.match(settingsSource, /resetOnboardingState\(\)/);
  assert.match(flowHookSource, /resetOnboardingState\(\)/);
  assert.doesNotMatch(settingsSource, /localStorage\.removeItem/);
});

test("STORAGE_KEYS values are unique — no accidental key collisions", () => {
  const values = Object.values(STORAGE_KEYS);
  assert.equal(new Set(values).size, values.length);
});
