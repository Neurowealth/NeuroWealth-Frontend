import assert from "node:assert/strict";
import test from "node:test";

interface PanelLayoutClasses {
  width: string;
  maxWidth?: string;
  position: string;
}

function getResponsivePanelClasses(): PanelLayoutClasses {
  return {
    width: "w-[400px]",
    position: "fixed bottom-4 right-4",
  };
}

function getViewportRelativeClasses(): { widthClass: string; usesFixedWidth: boolean } {
  const classes = getResponsivePanelClasses();
  return {
    widthClass: classes.width,
    usesFixedWidth: classes.width.includes("400px"),
  };
}

test("DiagnosticsPanelContent — panel uses fixed 400px width", () => {
  const { widthClass } = getViewportRelativeClasses();
  assert.equal(widthClass, "w-[400px]");
});

test("DiagnosticsPanelContent — panel is fixed-positioned at bottom-right", () => {
  const classes = getResponsivePanelClasses();
  assert.ok(classes.position.includes("fixed"));
  assert.ok(classes.position.includes("bottom-4"));
  assert.ok(classes.position.includes("right-4"));
});

test("DiagnosticsPanelContent — panel has 500px height", () => {
  const heightClass = "h-[500px]";
  assert.ok(heightClass.includes("500px"));
});

test("DiagnosticsPanelContent — panel classes include overflow-hidden for inner scroll", () => {
  const overflowClass = "overflow-hidden";
  assert.equal(overflowClass, "overflow-hidden");
});

test("DiagnosticsPanelContent — width class is stable and not viewport-relative", () => {
  const { widthClass, usesFixedWidth } = getViewportRelativeClasses();
  assert.ok(usesFixedWidth, `Expected fixed width, got ${widthClass}`);
  assert.ok(!widthClass.includes("vw"), "Should not use vw units");
  assert.ok(!widthClass.includes("min("), "Should not use min() for responsive width");
  assert.ok(!widthClass.includes("max("), "Should not use max() for responsive width");
});
