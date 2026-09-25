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

    assert.equal(Number.parseFloat((moveRegion as HTMLElement).style.left), 11);
  });

  it("resizes from a keyboard-operable corner handle", () => {
    const view = render(<ImageCrop src="test-image.jpg" />);
    fireEvent.load(view.getByAltText("Crop preview"));

    const northwestHandle = view.getByRole("slider", { name: "nw resize handle" });
    const moveRegion = view.getByRole("group", { name: "Move crop area" });
    assert.equal(northwestHandle.getAttribute("tabindex"), "0");
    fireEvent.keyDown(northwestHandle, { key: "ArrowLeft" });

    assert.equal(northwestHandle.getAttribute("aria-valuenow"), "81");
    assert.equal(Number.parseFloat((moveRegion as HTMLElement).style.left), 9);
    assert.equal(Number.parseFloat((moveRegion as HTMLElement).style.width), 81);
  });
});