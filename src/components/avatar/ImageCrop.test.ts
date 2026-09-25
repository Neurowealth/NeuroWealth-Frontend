import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import ImageCrop from "./ImageCrop";
import { setupDomGlobals } from "@/test-setup";

setupDomGlobals();

const SRC = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function renderCrop(onCropChange?: (crop: { x: number; y: number; size: number }) => void) {
  return render(
    createElement(ImageCrop, {
      src: SRC,
      onCropChange,
      onCancel: () => {},
    }),
  );
}

function markImageReady(utils: Pick<ReturnType<typeof render>, "getByRole">) {
  const img = utils.getByRole("img", { name: "Crop preview" }) as HTMLImageElement;
  Object.defineProperty(img, "naturalWidth", { value: 400, configurable: true });
  Object.defineProperty(img, "naturalHeight", { value: 400, configurable: true });
  fireEvent.load(img);
}

test("ImageCrop — move region is keyboard focusable with group role", () => {
  const utils = renderCrop();
  markImageReady(utils);
  const { getByRole } = utils;

  const moveRegion = getByRole("group", {
    name: /arrow keys move the crop area/i,
  });
  assert.equal(moveRegion.getAttribute("tabindex"), "0");
  cleanup();
});

test("ImageCrop — corner handles are sliders with tabIndex", () => {
  const utils = renderCrop();
  markImageReady(utils);
  const { getAllByRole } = utils;

  const sliders = getAllByRole("slider");
  assert.equal(sliders.length, 4);
  for (const handle of sliders) {
    assert.equal(handle.getAttribute("tabindex"), "0");
    assert.ok(handle.getAttribute("aria-valuenow"));
  }
  cleanup();
});

test("ImageCrop — arrow keys on move region call onCropChange", () => {
  const changes: Array<{ x: number; y: number; size: number }> = [];
  const utils = renderCrop((crop) => changes.push(crop));
  markImageReady(utils);
  const { getByRole } = utils;

  const moveRegion = getByRole("group", {
    name: /arrow keys move the crop area/i,
  });
  moveRegion.focus();
  fireEvent.keyDown(moveRegion, { key: "ArrowRight" });

  assert.ok(changes.length >= 1);
  assert.ok(changes[changes.length - 1]!.x > 0.1, "ArrowRight should increase x from default 0.1");
  cleanup();
});

test("ImageCrop — arrow keys on south-east handle resize crop", () => {
  const changes: Array<{ x: number; y: number; size: number }> = [];
  const utils = renderCrop((crop) => changes.push(crop));
  markImageReady(utils);
  const { getByRole } = utils;

  const seHandle = getByRole("slider", {
    name: /south-east corner/i,
  });
  seHandle.focus();
  fireEvent.keyDown(seHandle, { key: "ArrowRight" });

  assert.ok(changes.length >= 1);
  assert.ok(
    changes[changes.length - 1]!.size > 0.8,
    "ArrowRight on SE handle should increase crop size from default 0.8",
  );
  cleanup();
});

test("ImageCrop — non-arrow keys on move region do not change crop", () => {
  const changes: Array<{ x: number; y: number; size: number }> = [];
  const utils = renderCrop((crop) => changes.push(crop));
  markImageReady(utils);
  const { getByRole } = utils;

  const moveRegion = getByRole("group", {
    name: /arrow keys move the crop area/i,
  });
  moveRegion.focus();
  fireEvent.keyDown(moveRegion, { key: "Tab" });

  assert.equal(changes.length, 0);
  cleanup();
});
