import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import React from "react";
import { setupDomGlobals } from "@/test-setup";
import ImageCrop from "./ImageCrop";

setupDomGlobals();
Object.assign(globalThis, { React });

describe("ImageCrop keyboard controls", () => {
  afterEach(cleanup);

  it("moves the crop area with arrow keys", () => {
    const view = render(<ImageCrop src="test-image.jpg" />);
    fireEvent.load(view.getByAltText("Crop preview"));

    const moveRegion = view.getByRole("group", { name: "Move crop area" });
    assert.equal(moveRegion.getAttribute("tabindex"), "0");
    fireEvent.keyDown(moveRegion, { key: "ArrowRight" });

    assert.ok(Math.abs(Number.parseFloat((moveRegion as HTMLElement).style.left) - 12) < 0.01);
  });

  it("resizes from a keyboard-operable corner handle", () => {
    const view = render(<ImageCrop src="test-image.jpg" />);
    fireEvent.load(view.getByAltText("Crop preview"));

    const northwestHandle = view.getByRole("slider", { name: /north-west corner/i });
    const moveRegion = view.getByRole("group", { name: "Move crop area" });
    assert.equal(northwestHandle.getAttribute("tabindex"), "0");
    fireEvent.keyDown(northwestHandle, { key: "ArrowLeft" });

    assert.equal(northwestHandle.getAttribute("aria-valuenow"), "82");
    assert.ok(Math.abs(Number.parseFloat((moveRegion as HTMLElement).style.left) - 8) < 0.01);
    assert.ok(Math.abs(Number.parseFloat((moveRegion as HTMLElement).style.width) - 82) < 0.01);
  });

  it("provides at least 44px hit area for corner resize handles to support touch", () => {
    const { handle } = setup();
    const se = handle(/south-east corner/i);
    assert.equal(se.style.width, "44px");
    assert.equal(se.style.height, "44px");
  });

  function setup() {
    const view = render(<ImageCrop src="test-image.jpg" />);
    fireEvent.load(view.getByAltText("Crop preview"));
    const moveRegion = view.getByRole("group", { name: "Move crop area" }) as HTMLElement;
    const handle = (name: RegExp) => view.getByRole("slider", { name });
    return { view, moveRegion, handle };
  }

  function assertCrop(region: HTMLElement, expected: { left: number; top: number; size: number }) {
    const near = (actual: string, want: number, label: string) =>
      assert.ok(Math.abs(Number.parseFloat(actual) - want) < 0.01, `${label}: expected ${want}, got ${actual}`);
    near(region.style.left, expected.left, "left");
    near(region.style.top, expected.top, "top");
    near(region.style.width, expected.size, "width");
    near(region.style.height, expected.size, "height");
  }

  it("grows the south-east handle with ArrowRight/ArrowDown and shrinks it with ArrowLeft/ArrowUp, anchored top-left", () => {
    const { moveRegion, handle } = setup();
    const se = handle(/south-east corner/i);

    fireEvent.keyDown(se, { key: "ArrowRight" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 82 });
    fireEvent.keyDown(se, { key: "ArrowUp" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 80 });
    fireEvent.keyDown(se, { key: "ArrowDown" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 82 });
    fireEvent.keyDown(se, { key: "ArrowLeft" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 80 });
    assert.equal(se.getAttribute("aria-valuenow"), "80");
  });

  it("resizes the north-east handle only along the x axis, matching its pointer-drag math", () => {
    const { moveRegion, handle } = setup();
    const ne = handle(/north-east corner/i);

    fireEvent.keyDown(ne, { key: "ArrowRight" });
    assertCrop(moveRegion, { left: 10, top: 8, size: 82 });
    fireEvent.keyDown(ne, { key: "ArrowLeft" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 80 });

    // Dragging the ne handle vertically has no effect, so neither do Up/Down.
    fireEvent.keyDown(ne, { key: "ArrowUp" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 80 });
    fireEvent.keyDown(ne, { key: "ArrowDown" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 80 });
    assert.equal(ne.getAttribute("aria-valuenow"), "80");
  });

  it("resizes the south-west handle only along the y axis, matching its pointer-drag math", () => {
    const { moveRegion, handle } = setup();
    const sw = handle(/south-west corner/i);

    fireEvent.keyDown(sw, { key: "ArrowDown" });
    assertCrop(moveRegion, { left: 8, top: 10, size: 82 });
    fireEvent.keyDown(sw, { key: "ArrowUp" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 80 });

    // Dragging the sw handle horizontally has no effect, so neither do Left/Right.
    fireEvent.keyDown(sw, { key: "ArrowLeft" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 80 });
    fireEvent.keyDown(sw, { key: "ArrowRight" });
    assertCrop(moveRegion, { left: 10, top: 10, size: 80 });
    assert.equal(sw.getAttribute("aria-valuenow"), "80");
  });

  it("uses the larger Shift step for both moving and resizing", () => {
    const { moveRegion, handle } = setup();

    fireEvent.keyDown(moveRegion, { key: "ArrowLeft", shiftKey: true });
    assertCrop(moveRegion, { left: 2, top: 10, size: 80 });

    const se = handle(/south-east corner/i);
    fireEvent.keyDown(se, { key: "ArrowUp", shiftKey: true });
    assertCrop(moveRegion, { left: 2, top: 10, size: 72 });
    assert.equal(se.getAttribute("aria-valuenow"), "72");

    const ne = handle(/north-east corner/i);
    fireEvent.keyDown(ne, { key: "ArrowRight", shiftKey: true });
    assertCrop(moveRegion, { left: 2, top: 2, size: 80 });
  });
});
