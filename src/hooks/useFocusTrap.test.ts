import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { createFocusTrap } from "@/hooks/focusTrap";

class FakeElement {
  children: FakeElement[] = [];
  focusCalls = 0;
  private keydownListener: ((event: KeyboardEvent) => void) | null = null;

  constructor(private readonly setActiveElement: (element: FakeElement) => void) {}

  focus() {
    this.focusCalls += 1;
    this.setActiveElement(this);
  }

  querySelectorAll() {
    return this.children;
  }

  addEventListener(type: string, listener: EventListener) {
    if (type === "keydown") {
      this.keydownListener = listener as (event: KeyboardEvent) => void;
    }
  }

  removeEventListener(type: string, listener: EventListener) {
    if (type === "keydown" && this.keydownListener === listener) {
      this.keydownListener = null;
    }
  }

  dispatchTab(shiftKey = false) {
    let defaultPrevented = false;
    this.keydownListener?.({
      key: "Tab",
      shiftKey,
      preventDefault: () => {
        defaultPrevented = true;
      },
    } as KeyboardEvent);
    return defaultPrevented;
  }
}

const nativeHTMLElement = globalThis.HTMLElement;

test.after(() => {
  globalThis.HTMLElement = nativeHTMLElement;
});

function setupFocusTrapElements() {
  let activeElement: FakeElement | null = null;
  const connectedElements = new Set<FakeElement>();
  const setActiveElement = (element: FakeElement) => {
    activeElement = element;
  };

  const trigger = new FakeElement(setActiveElement);
  const container = new FakeElement(setActiveElement);
  const first = new FakeElement(setActiveElement);
  const last = new FakeElement(setActiveElement);
  container.children = [first, last];

  [trigger, container, first, last].forEach((element) => connectedElements.add(element));
  activeElement = trigger;
  globalThis.HTMLElement = FakeElement as unknown as typeof HTMLElement;

  const ownerDocument = {
    get activeElement() {
      return activeElement;
    },
    contains(element: FakeElement) {
      return connectedElements.has(element);
    },
  } as unknown as Document;

  return {
    connectedElements,
    container: container as unknown as HTMLElement,
    first,
    last,
    ownerDocument,
    trigger,
    get activeElement() {
      return activeElement;
    },
  };
}

test("createFocusTrap restores focus to the triggering control on cleanup", () => {
  const setup = setupFocusTrapElements();

  const cleanup = createFocusTrap(setup.container, setup.ownerDocument);
  assert.equal(setup.activeElement, setup.first);

  cleanup();

  assert.equal(setup.activeElement, setup.trigger);
  assert.equal(setup.trigger.focusCalls, 1);
});

test("createFocusTrap does not restore focus when the trigger is no longer connected", () => {
  const setup = setupFocusTrapElements();

  const cleanup = createFocusTrap(setup.container, setup.ownerDocument);
  setup.connectedElements.delete(setup.trigger);

  cleanup();

  assert.equal(setup.activeElement, setup.first);
  assert.equal(setup.trigger.focusCalls, 0);
});

test("createFocusTrap keeps Tab focus inside the container", () => {
  const setup = setupFocusTrapElements();

  const cleanup = createFocusTrap(setup.container, setup.ownerDocument);

  const fakeContainer = setup.container as unknown as FakeElement;

  setup.last.focus();
  assert.equal(fakeContainer.dispatchTab(), true);
  assert.equal(setup.activeElement, setup.first);

  setup.first.focus();
  assert.equal(fakeContainer.dispatchTab(true), true);
  assert.equal(setup.activeElement, setup.last);

  cleanup();
});

test("useFocusTrap delegates active cleanup to the shared focus trap controller", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/hooks/useFocusTrap.ts"),
    "utf8",
  );

  assert.match(source, /import \{ createFocusTrap \} from "@\/hooks\/focusTrap";/);
  assert.match(source, /return createFocusTrap\(ref\.current\);/);
});
