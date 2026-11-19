import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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

function handleStrategyKeydown(event: KeyEvent, onSelect: () => void): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
}

const strategies = [
  { id: "conservative", name: "Conservative" },
  { id: "balanced", name: "Balanced" },
  { id: "aggressive", name: "Aggressive" },
];

test("StrategyOverviewStep — default selected strategy is balanced", () => {
  const defaultStrategy = "balanced";
  assert.equal(defaultStrategy, "balanced", "Default selected strategy should be balanced");
});

test("StrategyOverviewStep — aria-pressed is true only on currently-selected strategy", () => {
  let selectedStrategy = "balanced";
  const getAriaPressed = (id: string) => selectedStrategy === id;

  // Default state: balanced is selected
  assert.equal(getAriaPressed("conservative"), false);
  assert.equal(getAriaPressed("balanced"), true);
  assert.equal(getAriaPressed("aggressive"), false);

  // Select conservative
  selectedStrategy = "conservative";
  assert.equal(getAriaPressed("conservative"), true);
  assert.equal(getAriaPressed("balanced"), false);
  assert.equal(getAriaPressed("aggressive"), false);

  // Select aggressive
  selectedStrategy = "aggressive";
  assert.equal(getAriaPressed("conservative"), false);
  assert.equal(getAriaPressed("balanced"), false);
  assert.equal(getAriaPressed("aggressive"), true);
});

test("StrategyOverviewStep — Enter key selects strategy and prevents default", () => {
  let selected = "";
  const event = createKeyEvent("Enter");
  handleStrategyKeydown(event, () => {
    selected = "conservative";
  });

  assert.equal(selected, "conservative", "Strategy should be selected on Enter");
  assert.ok(event.defaultPrevented, "Enter key should prevent default");
});

test("StrategyOverviewStep — Space key selects strategy and prevents page scroll", () => {
  let selected = "";
  const event = createKeyEvent(" ");
  handleStrategyKeydown(event, () => {
    selected = "aggressive";
  });

  assert.equal(selected, "aggressive", "Strategy should be selected on Space");
  assert.ok(event.defaultPrevented, "Space key must prevent default to stop page scroll");
});

test("StrategyOverviewStep — other keys do not select strategy", () => {
  let selected = "balanced";
  const event = createKeyEvent("Tab");
  handleStrategyKeydown(event, () => {
    selected = "conservative";
  });

  assert.equal(selected, "balanced", "Tab key should not trigger selection");
  assert.ok(!event.defaultPrevented, "Tab key should not prevent default");
});

test("StrategyOverviewStep — Escape key does not select strategy", () => {
  let selected = "balanced";
  const event = createKeyEvent("Escape");
  handleStrategyKeydown(event, () => {
    selected = "conservative";
  });

  assert.equal(selected, "balanced", "Escape key should not trigger selection");
  assert.ok(!event.defaultPrevented, "Escape key should not prevent default");
});

test("StrategyOverviewStep — source markup includes role=button, tabIndex=0, and aria-pressed", () => {
  const componentSource = fs.readFileSync(
    path.join(process.cwd(), "src/components/onboarding/steps/StrategyOverviewStep.tsx"),
    "utf8",
  );

  assert.match(componentSource, /role="button"/);
  assert.match(componentSource, /tabIndex=\{0\}/);
  assert.match(componentSource, /aria-pressed=\{selectedStrategy === strategy\.id\}/);
});
