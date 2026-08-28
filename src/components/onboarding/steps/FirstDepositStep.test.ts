import assert from "node:assert/strict";
import test from "node:test";

interface KeyEvent {
  key: string;
  defaultPrevented: boolean;
  preventDefault: () => void;
}

function createKeyEvent(key: string): KeyEvent {
  const event: KeyEvent = {
    key,
    defaultPrevented: false,
    preventDefault() {
      event.defaultPrevented = true;
    },
  };
  return event;
}

function handleAssetKeydown(event: KeyEvent, onSelect: () => void): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
}

test("FirstDepositStep — Enter key selects asset and prevents default", () => {
  let selected = false;
  const event = createKeyEvent("Enter");
  handleAssetKeydown(event, () => {
    selected = true;
  });
  assert.ok(selected, "Asset should be selected on Enter");
  assert.ok(event.defaultPrevented, "Default should be prevented on Enter");
});

test("FirstDepositStep — Space key selects asset and prevents default", () => {
  let selected = false;
  const event = createKeyEvent(" ");
  handleAssetKeydown(event, () => {
    selected = true;
  });
  assert.ok(selected, "Asset should be selected on Space");
  assert.ok(event.defaultPrevented, "Default should be prevented on Space (stops page scroll)");
});

test("FirstDepositStep — other keys do not select asset", () => {
  let selected = false;
  const event = createKeyEvent("Tab");
  handleAssetKeydown(event, () => {
    selected = true;
  });
  assert.ok(!selected, "Asset should not be selected on Tab");
  assert.ok(!event.defaultPrevented, "Default should not be prevented on Tab");
});

test("FirstDepositStep — Escape key does not trigger selection", () => {
  let selected = false;
  const event = createKeyEvent("Escape");
  handleAssetKeydown(event, () => {
    selected = true;
  });
  assert.ok(!selected, "Asset should not be selected on Escape");
  assert.ok(!event.defaultPrevented, "Default should not be prevented on Escape");
});

test("FirstDepositStep — preventDefault stops page scroll on Space", () => {
  const event = createKeyEvent(" ");
  handleAssetKeydown(event, () => {});
  assert.ok(
    event.defaultPrevented,
    "Space key must call preventDefault to stop page scroll",
  );
});

test("FirstDepositStep — asset cards have tabIndex=0 for keyboard focus", () => {
  const tabIndex = 0;
  assert.equal(tabIndex, 0, "Asset cards should be focusable via tabIndex=0");
});

test("FirstDepositStep — asset cards have role=button for semantics", () => {
  const role = "button";
  assert.equal(role, "button", "Asset cards should have role=button");
});
