import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { loadOnboardingState, saveOnboardingState } from "@/lib/onboarding-state";
import { useOnboardingFlow } from "./useOnboardingFlow";

// #953 — a per-step "Skip for Now" / "Decide Later" must advance the flow
// instead of completing it. Only the bottom "Skip All" completes from any step.

const STORAGE_KEY = STORAGE_KEYS.ONBOARDING_STATE;

function readPersisted(): { lastStep?: number; completed?: boolean; timestamp?: number } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw
    ? (JSON.parse(raw) as { lastStep?: number; completed?: boolean; timestamp?: number })
    : null;
}

describe("useOnboardingFlow handleStepSkip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("advances currentStep and leaves isCompleted false on the first step", () => {
    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));

    act(() => {
      result.current.handleStepSkip();
    });

    assert.equal(result.current.currentStep, 1);
    assert.equal(result.current.isCompleted, false);
  });

  it("persists the advanced step as not completed", () => {
    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));

    act(() => {
      result.current.handleStepSkip();
    });

    const persisted = readPersisted();
    assert.equal(persisted?.lastStep, 1);
    assert.equal(persisted?.completed, false);
  });

  it("advances repeatedly without completing until the final step", () => {
    let completes = 0;
    let skips = 0;
    const { result } = renderHook(() =>
      useOnboardingFlow({
        totalSteps: 3,
        onComplete: () => {
          completes += 1;
        },
        onSkip: () => {
          skips += 1;
        },
      }),
    );

    act(() => {
      result.current.handleStepSkip();
    });
    act(() => {
      result.current.handleStepSkip();
    });

    assert.equal(result.current.currentStep, 2);
    assert.equal(result.current.isCompleted, false);
    assert.equal(completes, 0);
    assert.equal(skips, 0);
  });

  it("completes the flow only when the final step is skipped", () => {
    let completes = 0;
    const { result } = renderHook(() =>
      useOnboardingFlow({
        totalSteps: 3,
        initialStep: 2,
        onComplete: () => {
          completes += 1;
        },
      }),
    );

    act(() => {
      result.current.handleStepSkip();
    });

    assert.equal(result.current.isCompleted, true);
    assert.equal(completes, 1);
    assert.equal(readPersisted()?.completed, true);
  });

  it("keeps Skip All completing unconditionally from the first step", () => {
    let skips = 0;
    const { result } = renderHook(() =>
      useOnboardingFlow({
        totalSteps: 3,
        onSkip: () => {
          skips += 1;
        },
      }),
    );

    act(() => {
      result.current.handleSkip();
    });

    assert.equal(result.current.isCompleted, true);
    assert.equal(skips, 1);
    assert.equal(readPersisted()?.completed, true);
  });
});

// #1040 — the hook reads/writes through onboarding-state.ts, so state saved by
// OnboardingGate/OnboardingSettings and state saved by the flow stay in step.
describe("useOnboardingFlow persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("resumes from a step saved via saveOnboardingState", () => {
    saveOnboardingState({ completed: false, lastStep: 2, timestamp: 1 });

    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 4 }));

    assert.equal(result.current.currentStep, 2);
    assert.equal(result.current.isCompleted, false);
  });

  it("starts completed when saveOnboardingState marked it complete", () => {
    saveOnboardingState({ completed: true, timestamp: 1 });

    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 4 }));

    assert.equal(result.current.isCompleted, true);
  });

  it("ignores stored state that onboarding-state.ts rejects as invalid", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastStep: 2 }));

    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 4 }));

    assert.equal(result.current.currentStep, 0);
    assert.equal(result.current.isCompleted, false);
  });

  // #1054 — values written by the flow hook must round-trip through the shared adapter.
  it("reads back via loadOnboardingState the same shape saved by useOnboardingFlow", () => {
    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));

    act(() => {
      result.current.handleNext();
    });

    const loaded = loadOnboardingState();
    const raw = readPersisted();

    assert.ok(loaded);
    assert.ok(raw);
    assert.deepEqual(loaded, raw);
    assert.equal(loaded.completed, false);
    assert.equal(loaded.lastStep, 1);
    assert.equal(typeof loaded.timestamp, "number");
  });

  it("handleStepSkip shares handleNext's persistence path", () => {
    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));

    act(() => {
      result.current.handleStepSkip();
    });

    const loaded = loadOnboardingState();
    assert.equal(loaded?.lastStep, 1);
    assert.equal(loaded?.completed, false);
    assert.equal(result.current.currentStep, 1);
  });
});

// #954 — resetFlow (the "Review Onboarding" action) used to reset only
// currentStep/isCompleted, leaving the strategy and deposit records written by
// StrategyOverviewStep/FirstDepositStep behind. It must now clear them via the
// same shared reset OnboardingSettings uses.
describe("useOnboardingFlow resetFlow", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("clears the step-scoped strategy and deposit records", () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY, "balanced");
    localStorage.setItem(
      STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT,
      JSON.stringify({ amount: "250", submittedAt: 1 }),
    );

    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));

    act(() => {
      result.current.resetFlow();
    });

    assert.equal(localStorage.getItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY), null);
    assert.equal(localStorage.getItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT), null);
  });

  it("resets a completed flow back to step 0 and keeps it restartable", () => {
    saveOnboardingState({ completed: true, lastStep: 2, timestamp: 1 });
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY, "balanced");
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT, JSON.stringify({ amount: "250" }));

    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));
    assert.equal(result.current.isCompleted, true);

    act(() => {
      result.current.resetFlow();
    });

    assert.equal(result.current.currentStep, 0);
    assert.equal(result.current.isCompleted, false);

    const persisted = readPersisted();
    assert.equal(persisted?.lastStep, 0);
    assert.equal(persisted?.completed, false);
    assert.equal(localStorage.getItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY), null);
    assert.equal(localStorage.getItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT), null);

    // The restart must still work: advancing re-persists step 1 as incomplete.
    act(() => {
      result.current.handleNext();
    });
    assert.equal(result.current.currentStep, 1);
    assert.equal(readPersisted()?.lastStep, 1);
    assert.equal(readPersisted()?.completed, false);
  });
});
