import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
// Must be imported before `@testing-library/user-event` — see jsdom-setup.ts.
import "@/test-utils/jsdom-setup";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingFlow from "./OnboardingFlow";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { I18nProvider } from "@/contexts/I18nContext";

Object.assign(globalThis, { React });

function renderFlow() {
  return render(<I18nProvider><OnboardingFlow /></I18nProvider>);
}

// #953 — the per-step skip button is wired to handleStepSkip, while the bottom
// "Skip All" button keeps completing the whole flow via handleSkip.
describe("OnboardingFlow per-step skip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("advances to the next step without completing the flow", async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.click(screen.getByRole("button", { name: "Skip for Now" }));

    assert.ok(
      screen.getByRole("heading", { name: "Choose Your Investment Strategy" }),
      "step 2 should be visible after skipping step 1",
    );
    assert.equal(screen.queryByText("Welcome to NeuroWealth!"), null);
    assert.equal(
      (JSON.parse(localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE)!) as { completed: boolean })
        .completed,
      false,
    );
  });

  it("keeps the bottom Skip All button completing the whole flow", async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.click(screen.getByRole("button", { name: "Skip All" }));

    assert.ok(screen.getByText("Welcome to NeuroWealth!"));
  });
});
