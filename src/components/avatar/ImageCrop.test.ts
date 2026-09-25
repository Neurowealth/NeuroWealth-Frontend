import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import ImageCrop, { CropResult } from "./ImageCrop";
import { setupDomGlobals } from "@/test-setup";

setupDomGlobals();

/**
 * Regression tests for issue #970: the crop box could only be resized or moved
 * with the pointer. The four corner handles and the move region had no
 * tabIndex, role or key handling, so a keyboard-only user could not adjust the
 * crop at all.
 */

const START = { x: 0.1, y: 0.1, size: 0.8 };

function renderCrop() {
  const changes: CropResult[] = [];
  const utils = render(
    createElement(ImageCrop, {
      src: "data:image/png;base64,AAAA",
      onCropChange: (crop: CropResult) => changes.push(crop),
    }),
  );
  // The overlay (and therefore the handles) only renders once the image loads.
  fireEvent.load(utils.container.querySelector("img")!);
  return { ...utils, changes };
}

const handle = (container: HTMLElement, corner: string) =>
  container.querySelector(`[data-testid="crop-handle-${corner}"]`) as HTMLElement;

const moveRegion = (container: HTMLElement) =>
  container.querySelector('[role="group"]') as HTMLElement;

test("every resize handle is focusable, has a role and a descriptive name", () => {
  const { container } = renderCrop();

  for (const corner of ["nw", "ne", "sw", "se"]) {
    const el = handle(container, corner);
    assert.ok(el, `expected a handle for the ${corner} corner`);
    assert.equal(el.getAttribute("tabindex"), "0", `${corner} handle must be tabbable`);
    assert.equal(el.getAttribute("role"), "button", `${corner} handle needs a role`);
    assert.match(
      el.getAttribute("aria-label") ?? "",
      /arrow keys/,
      `${corner} handle must explain its keyboard controls`,
    );
  }

  const region = moveRegion(container);
  assert.ok(region, "expected the crop region to be present");
  assert.equal(region.getAttribute("tabindex"), "0", "crop region must be tabbable");
  assert.match(region.getAttribute("aria-label") ?? "", /arrow keys/);

  cleanup();
});

test("arrow keys on a corner handle resize the crop box", () => {
  const { container, changes } = renderCrop();

  // Bottom-right grows on Right/Down, anchored at the top-left corner.
  fireEvent.keyDown(handle(container, "se"), { key: "ArrowRight" });
  const grown = changes.at(-1)!;
  assert.equal(Math.round(grown.size * 100), Math.round((START.size + 0.02) * 100));
  assert.equal(grown.x, START.x, "growing from se must keep x");
  assert.equal(grown.y, START.y, "growing from se must keep y");

  // Top-left grows on Left/Up and drags its origin along with it.
  fireEvent.keyDown(handle(container, "nw"), { key: "ArrowLeft" });
  const nwGrown = changes.at(-1)!;
  assert.ok(nwGrown.size > grown.size, "ArrowLeft on nw must grow the crop");
  assert.ok(nwGrown.x < grown.x && nwGrown.y < grown.y, "nw growth moves the origin up-left");

  // The opposite direction shrinks.
  const beforeShrink = changes.at(-1)!;
  fireEvent.keyDown(handle(container, "nw"), { key: "ArrowRight" });
  assert.ok(changes.at(-1)!.size < beforeShrink.size, "ArrowRight on nw must shrink the crop");

  cleanup();
});

test("Shift+arrow uses the larger step", () => {
  const { container, changes } = renderCrop();

  fireEvent.keyDown(handle(container, "se"), { key: "ArrowRight" });
  const small = changes.at(-1)!.size - START.size;

  fireEvent.keyDown(handle(container, "se"), { key: "ArrowRight", shiftKey: true });
  const big = changes.at(-1)!.size - (START.size + small);

  assert.ok(big > small, "Shift must take a larger step than a plain arrow");
  assert.equal(Math.round(big * 100), 10);

  cleanup();
});

test("arrow keys on the crop region move it and clamp at the edges", () => {
  const { container, changes } = renderCrop();

  fireEvent.keyDown(moveRegion(container), { key: "ArrowRight" });
  assert.equal(Math.round(changes.at(-1)!.x * 100), Math.round((START.x + 0.02) * 100));
  assert.equal(changes.at(-1)!.size, START.size, "moving must not change the size");

  for (let i = 0; i < 50; i++) {
    fireEvent.keyDown(moveRegion(container), { key: "ArrowRight" });
    fireEvent.keyDown(moveRegion(container), { key: "ArrowDown" });
  }
  const last = changes.at(-1)!;
  assert.ok(last.x <= 1 - last.size + 1e-9, "x must stay inside the image");
  assert.ok(last.y <= 1 - last.size + 1e-9, "y must stay inside the image");

  cleanup();
});

test("resizing cannot exceed the image or collapse the crop box", () => {
  const { container, changes } = renderCrop();

  for (let i = 0; i < 40; i++) {
    fireEvent.keyDown(handle(container, "se"), { key: "ArrowRight", shiftKey: true });
  }
  const biggest = changes.at(-1)!;
  assert.ok(biggest.size <= 1 + 1e-9, "size must never exceed the image");
  assert.ok(biggest.x >= 0 && biggest.y >= 0, "the box must stay in frame");

  for (let i = 0; i < 40; i++) {
    fireEvent.keyDown(handle(container, "se"), { key: "ArrowLeft", shiftKey: true });
  }
  assert.ok(changes.at(-1)!.size >= 0.1 - 1e-9, "size must not collapse below the 0.1 minimum");

  cleanup();
});

test("non-arrow keys are ignored and pointer resizing still works", () => {
  const { container, changes } = renderCrop();

  fireEvent.keyDown(handle(container, "se"), { key: "Enter" });
  assert.equal(changes.length, 0, "Enter must not change the crop");

  // Pointer path unchanged: a drag on se still resizes.
  const se = handle(container, "se");
  fireEvent.mouseDown(se, { clientX: 100, clientY: 100 });
  fireEvent.mouseMove(window, { clientX: 140, clientY: 140 });
  fireEvent.mouseUp(window);
  assert.ok(changes.length > 0, "pointer resizing must keep working");

  cleanup();
});
