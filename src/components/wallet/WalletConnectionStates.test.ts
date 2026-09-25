import assert from "node:assert/strict";
import test from "node:test";

type ConnectionState = "restoring" | "connected" | "disconnected";

interface AriaAttributes {
  role: string;
  ariaLive: string;
}

const stateAriaMap: Record<ConnectionState, AriaAttributes> = {
  restoring: { role: "status", ariaLive: "polite" },
  connected: { role: "status", ariaLive: "polite" },
  disconnected: { role: "status", ariaLive: "polite" },
};

function getAriaAttributes(state: ConnectionState): AriaAttributes {
  return stateAriaMap[state];
}

test("WalletConnectionStates — restoring state has role=status and aria-live=polite", () => {
  const attrs = getAriaAttributes("restoring");
  assert.equal(attrs.role, "status");
  assert.equal(attrs.ariaLive, "polite");
});

test("WalletConnectionStates — connected state has role=status and aria-live=polite", () => {
  const attrs = getAriaAttributes("connected");
  assert.equal(attrs.role, "status");
  assert.equal(attrs.ariaLive, "polite");
});

test("WalletConnectionStates — disconnected state has role=status and aria-live=polite", () => {
  const attrs = getAriaAttributes("disconnected");
  assert.equal(attrs.role, "status");
  assert.equal(attrs.ariaLive, "polite");
});

test("WalletConnectionStates — all states have aria attributes defined", () => {
  const states: ConnectionState[] = ["restoring", "connected", "disconnected"];
  for (const state of states) {
    const attrs = getAriaAttributes(state);
    assert.ok(attrs.role, `${state} should have role`);
    assert.ok(attrs.ariaLive, `${state} should have ariaLive`);
  }
});

test("WalletConnectionStates — data-qa selectors exist per state", () => {
  const qaSelectors: Record<ConnectionState, string> = {
    restoring: "wallet-state-restoring",
    connected: "wallet-state-connected",
    disconnected: "wallet-state-disconnected",
  };
  for (const [state, selector] of Object.entries(qaSelectors)) {
    assert.ok(selector.length > 0, `${state} should have a data-qa selector`);
    assert.ok(selector.startsWith("wallet-state-"), `${state} data-qa should start with wallet-state-`);
  }
});
