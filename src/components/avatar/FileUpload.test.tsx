import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import React from "react";
import { setupDomGlobals } from "@/test-setup";
import FileUpload from "./FileUpload";

setupDomGlobals();
Object.assign(globalThis, { React });

let created: string[] = [];
let revoked: string[] = [];

function makeFile(name: string, type = "image/png") {
  return new window.File(["avatar-bytes"], name, { type });
}

function selectFiles(container: HTMLElement, files: File[]) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  act(() => {
    fireEvent.change(input, { target: { files } });
  });
}

function revokeCount(url: string) {
  return revoked.filter((u) => u === url).length;
}

describe("FileUpload object-URL lifecycle", () => {
  beforeEach(() => {
    created = [];
    revoked = [];
    let next = 0;
    mock.method(URL, "createObjectURL", () => {
      const url = `blob:http://localhost/preview-${next++}`;
      created.push(url);
      return url;
    });
    mock.method(URL, "revokeObjectURL", (url: string) => {
      revoked.push(url);
    });
  });

  afterEach(() => {
    cleanup();
    mock.restoreAll();
  });

  it("creates one preview URL per uploaded image and none for non-images, without revoking", () => {
    const view = render(<FileUpload accept="*/*" />);
    selectFiles(view.container, [
      makeFile("a.png"),
      makeFile("b.jpg", "image/jpeg"),
      makeFile("notes.txt", "text/plain"),
    ]);

    assert.equal(created.length, 2);
    assert.deepEqual(revoked, []);
    assert.ok(view.getByText("a.png"));
    assert.ok(view.getByText("notes.txt"));
  });

  it("revokes a file's preview URL exactly once when it is removed, and not again on unmount", () => {
    // A tiny limit sends files straight to the error state, which renders the Remove button.
    const view = render(<FileUpload maxSizeMB={0.000001} />);
    selectFiles(view.container, [makeFile("a.png"), makeFile("b.png")]);
    const [urlA, urlB] = created;

    act(() => {
      fireEvent.click(view.getByRole("button", { name: "Remove a.png" }));
    });
    assert.equal(revokeCount(urlA), 1);
    assert.equal(revokeCount(urlB), 0);
    assert.equal(view.queryByText("a.png"), null);

    view.unmount();
    assert.equal(revokeCount(urlA), 1, "removed URL must not be revoked a second time on unmount");
    assert.equal(revokeCount(urlB), 1);
  });

  it("revokes a cancelled upload's preview URL exactly once when it is removed", () => {
    const view = render(<FileUpload />);
    selectFiles(view.container, [makeFile("a.png")]);
    const [url] = created;

    act(() => {
      fireEvent.click(view.getByRole("button", { name: "Cancel upload of a.png" }));
    });
    assert.equal(revokeCount(url), 0, "cancelling keeps the preview visible");

    act(() => {
      fireEvent.click(view.getByRole("button", { name: "Remove a.png" }));
    });
    view.unmount();
    assert.equal(revokeCount(url), 1);
  });

  it("revokes every outstanding preview URL exactly once on unmount", () => {
    const view = render(<FileUpload maxSizeMB={0.000001} />);
    selectFiles(view.container, [makeFile("a.png"), makeFile("b.png"), makeFile("c.png")]);
    assert.equal(created.length, 3);
    assert.deepEqual(revoked, []);

    view.unmount();
    assert.equal(revoked.length, 3);
    for (const url of created) {
      assert.equal(revokeCount(url), 1, `${url} should be revoked exactly once`);
    }
  });
});
