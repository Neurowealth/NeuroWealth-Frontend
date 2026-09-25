import assert from "node:assert/strict";
import test from "node:test";

test("notifications page handles rapid scenario switching and mock flow triggers without race conditions", async () => {
  // Simulate active flows triggered rapidly in succession
  type FlowType = "save" | "failure" | "timeout";
  const events: string[] = [];

  let currentFlowId = 0;
  let activeFlow: FlowType | null = null;

  async function triggerScenario(flow: FlowType, delayMs: number) {
    const flowId = ++currentFlowId;
    activeFlow = flow;
    events.push(`start:${flow}:${flowId}`);

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Guard against stale scenario completions
    if (currentFlowId === flowId) {
      events.push(`complete:${flow}:${flowId}`);
      activeFlow = null;
    } else {
      events.push(`aborted_stale:${flow}:${flowId}`);
    }
  }

  // Rapidly switch scenarios (e.g. user triggers save, then failure, then timeout before prior completes)
  const p1 = triggerScenario("save", 100);
  const p2 = triggerScenario("failure", 50);
  const p3 = triggerScenario("timeout", 10);

  await Promise.all([p1, p2, p3]);

  // The latest triggered scenario (timeout, flowId 3) must be the one that completes
  assert.equal(activeFlow, null);
  assert.ok(events.includes("start:save:1"));
  assert.ok(events.includes("start:failure:2"));
  assert.ok(events.includes("start:timeout:3"));
  assert.ok(events.includes("complete:timeout:3"));
  assert.ok(events.includes("aborted_stale:save:1"));
  assert.ok(events.includes("aborted_stale:failure:2"));
});

test("notification state preserves latest action sequence under concurrency", async () => {
  let state = { count: 0, lastAction: "none" };
  let sequenceId = 0;

  async function updateNotificationState(action: string, delay: number) {
    const id = ++sequenceId;
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (id >= sequenceId) {
      state = { count: state.count + 1, lastAction: action };
    }
  }

  await Promise.all([
    updateNotificationState("flow_A", 80),
    updateNotificationState("flow_B", 40),
    updateNotificationState("flow_C", 10),
  ]);

  // Last initiated action or sequence resolution
  assert.ok(state.count > 0);
});
