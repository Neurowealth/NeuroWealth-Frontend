import { useState, useCallback } from "react";
import { useAsyncState } from "@/hooks/useAsyncState";
import type { ToastInput } from "@/components/notifications/ToastProvider";

type MockFlowKey = "save" | "failure" | "timeout";

interface MockFlowStep {
  toast: ToastInput;
  delayBefore?: number;
}

const MOCK_FLOWS: Record<MockFlowKey, MockFlowStep[]> = {
  save: [
    { toast: { variant: "info", title: "Saving changes", description: "We are syncing your latest notification rules now.", duration: 3000 } },
    { delayBefore: 700, toast: { variant: "success", title: "Preferences saved", description: "All notification changes were applied successfully.", duration: 4000 } },
  ],
  failure: [
    { toast: { variant: "error", title: "Delivery failed", description: "The server rejected this request. Check your connection and try again.", duration: 6000 } },
  ],
  timeout: [
    { toast: { variant: "warning", title: "Session timeout warning", description: "Your review session will expire soon unless activity resumes.", duration: 6000 } },
  ],
};

export async function runMockFlow(key: MockFlowKey, pushToast: (t: ToastInput) => void): Promise<void> {
  for (const step of MOCK_FLOWS[key]) {
    if (step.delayBefore) await new Promise((r) => setTimeout(r, step.delayBefore));
    pushToast(step.toast);
  }
}

/**
 * Reusable React hook to manage mock flows using useAsyncState.
 * Encapsulates triggering flow and tracking the active flow key.
 */
export function useMockFlows(pushToast: (t: ToastInput) => void) {
  const { run } = useAsyncState<MockFlowKey>();
  const [activeFlow, setActiveFlow] = useState<MockFlowKey | null>(null);

  const triggerMockFlow = useCallback(async (flow: MockFlowKey) => {
    setActiveFlow(flow);
    await run(async () => {
      await runMockFlow(flow, pushToast);
      // Small visual delay to show loading state cleanly
      await new Promise((r) => setTimeout(r, 1000));
      return flow;
    });
    setActiveFlow(null);
  }, [run, pushToast]);

  return {
    activeFlow,
    triggerMockFlow,
  };
}

export type { MockFlowKey, MockFlowStep };
export { MOCK_FLOWS };
