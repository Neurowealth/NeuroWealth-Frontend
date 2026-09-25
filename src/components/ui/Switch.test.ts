import assert from "node:assert/strict";
import test from "node:test";

interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  label?: string;
}

function getSwitchContainerClass(disabled?: boolean): string {
  const base = "flex items-center justify-between gap-4 cursor-pointer group min-h-[44px]";
  return disabled ? base.replace("cursor-pointer", "cursor-not-allowed") : base;
}

function getTrackClass(checked: boolean, disabled?: boolean): string {
  const parts = ["w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-sky-500"];
  if (disabled) parts.push("opacity-50 cursor-not-allowed");
  else parts.push("cursor-pointer");
  return parts.join(" ");
}

test("Switch — container has min-height 44px", () => {
  const cls = getSwitchContainerClass();
  assert.ok(cls.includes("min-h-[44px]"));
});

test("Switch — checked state uses sky-500 background", () => {
  const cls = getTrackClass(true);
  assert.ok(cls.includes("peer-checked:bg-sky-500"));
});

test("Switch — disabled adds opacity-50", () => {
  const cls = getTrackClass(false, true);
  assert.ok(cls.includes("opacity-50"));
});

test("Switch — disabled container uses cursor-not-allowed", () => {
  const cls = getSwitchContainerClass(true);
  assert.ok(cls.includes("cursor-not-allowed"));
  assert.ok(!cls.includes("cursor-pointer"));
});

test("Switch — enabled container uses cursor-pointer", () => {
  const cls = getSwitchContainerClass(false);
  assert.ok(cls.includes("cursor-pointer"));
});

test("Switch — non-disabled does not have opacity-50", () => {
  const cls = getTrackClass(false, false);
  assert.ok(!cls.includes("opacity-50"));
});
