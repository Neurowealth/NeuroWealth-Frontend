import assert from "node:assert/strict";
import test, { afterEach, beforeEach, mock } from "node:test";
import type { RefObject } from "react";

import { renderHook } from "@/test-utils/render-hook";
import { useOnClickOutside } from "./useOnClickOutside";

type ClickEvent = MouseEvent | TouchEvent;

let inside: HTMLElement;
let child: HTMLElement;
let outside: HTMLElement;

beforeEach(() => {
  inside = document.createElement("div");
  child = document.createElement("button");
  outside = document.createElement("div");
  inside.appendChild(child);
  document.body.append(inside, outside);
});

afterEach(() => {
  mock.restoreAll();
  inside.remove();
  outside.remove();
});

function fire(target: Element, type: "mousedown" | "touchstart") {
  target.dispatchEvent(new Event(type, { bubbles: true }));
}

function refTo(el: HTMLElement | null): RefObject<HTMLElement> {
  return { current: el } as RefObject<HTMLElement>;
}

function spyOnDocumentListeners() {
  const added: Array<[string, unknown]> = [];
  const removed: Array<[string, unknown]> = [];
  const nativeAdd = document.addEventListener.bind(document);
  const nativeRemove = document.removeEventListener.bind(document);
  mock.method(document, "addEventListener", (type: string, listener: EventListenerOrEventListenerObject, options?: unknown) => {
    added.push([type, listener]);
    nativeAdd(type, listener, options as AddEventListenerOptions);
  });
  mock.method(document, "removeEventListener", (type: string, listener: EventListenerOrEventListenerObject, options?: unknown) => {
    removed.push([type, listener]);
    nativeRemove(type, listener, options as EventListenerOptions);
  });
  return { added, removed };
}

test("does not call handler for mousedown or touchstart inside the ref element", () => {
  const calls: ClickEvent[] = [];
  const { unmount } = renderHook(() => useOnClickOutside(refTo(inside), (e) => calls.push(e)));

  fire(inside, "mousedown");
  fire(inside, "touchstart");
  fire(child, "mousedown");
  fire(child, "touchstart");

  assert.equal(calls.length, 0);
  unmount();
});

test("calls handler with the event for outside mousedown and touchstart", () => {
  const calls: ClickEvent[] = [];
  const { unmount } = renderHook(() => useOnClickOutside(refTo(inside), (e) => calls.push(e)));

  fire(outside, "mousedown");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].type, "mousedown");
  assert.equal(calls[0].target, outside);

  fire(outside, "touchstart");
  assert.equal(calls.length, 2);
  assert.equal(calls[1].type, "touchstart");
  unmount();
});

test("does not call handler when ref.current is null", () => {
  const calls: ClickEvent[] = [];
  const { unmount } = renderHook(() => useOnClickOutside(refTo(null), (e) => calls.push(e)));

  fire(outside, "mousedown");
  fire(outside, "touchstart");

  assert.equal(calls.length, 0);
  unmount();
});

test("registers mousedown and touchstart on document and removes exactly those on unmount", () => {
  const { added, removed } = spyOnDocumentListeners();
  const calls: ClickEvent[] = [];
  const { unmount } = renderHook(() => useOnClickOutside(refTo(inside), (e) => calls.push(e)));

  assert.deepEqual(added.map(([type]) => type).sort(), ["mousedown", "touchstart"]);
  assert.equal(removed.length, 0);

  unmount();

  assert.equal(removed.length, 2);
  assert.deepEqual(removed.map(([type]) => type).sort(), ["mousedown", "touchstart"]);
  for (const [type, listener] of added) {
    assert.ok(
      removed.some(([t, l]) => t === type && l === listener),
      `listener for ${type} was not removed`
    );
  }

  fire(outside, "mousedown");
  fire(outside, "touchstart");
  assert.equal(calls.length, 0, "handler fired after unmount");
});

test("re-subscribes when the handler reference changes and only the latest handler fires", () => {
  const { added, removed } = spyOnDocumentListeners();
  const first: ClickEvent[] = [];
  const second: ClickEvent[] = [];
  const ref = refTo(inside);
  const handlerA = (e: ClickEvent) => first.push(e);
  const handlerB = (e: ClickEvent) => second.push(e);

  const { rerender, unmount } = renderHook(
    ({ handler }: { handler: (e: ClickEvent) => void }) => useOnClickOutside(ref, handler),
    { initialProps: { handler: handlerA } }
  );
  assert.equal(added.length, 2);

  rerender({ handler: handlerB });

  assert.equal(removed.length, 2, "old listeners should be removed");
  assert.equal(added.length, 4, "new listeners should be added");

  fire(outside, "mousedown");
  assert.equal(first.length, 0);
  assert.equal(second.length, 1);

  unmount();
  assert.equal(removed.length, 4);
});

test("does not re-subscribe when rerendered with the same handler and ref", () => {
  const { added, removed } = spyOnDocumentListeners();
  const ref = refTo(inside);
  const handler = () => {};

  const { rerender, unmount } = renderHook(() => useOnClickOutside(ref, handler));
  rerender();
  rerender();

  assert.equal(added.length, 2);
  assert.equal(removed.length, 0);
  unmount();
});
