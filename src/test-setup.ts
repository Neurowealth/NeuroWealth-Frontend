import { JSDOM } from "jsdom";
process.env.TZ = "UTC";

if (typeof require !== "undefined" && require.extensions) {
  const cssProxy: Record<string, unknown> = new Proxy({}, {
    get: (_target, prop) => {
      if (prop === "__esModule") return true;
      if (prop === "default") return cssProxy;
      return typeof prop === "string" ? prop : undefined;
    },
  });
  require.extensions[".css"] = (module) => {
    module.exports = cssProxy;
  };
}

let initialized = false;

export function setupDomGlobals() {
  if (initialized) return;
  initialized = true;

  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost",
    pretendToBeVisual: true,
  });

  Object.defineProperty(globalThis, "window", { value: dom.window, writable: true, configurable: true });
  Object.defineProperty(globalThis, "self", { value: dom.window, writable: true, configurable: true });
  Object.defineProperty(globalThis, "document", { value: dom.window.document, writable: true, configurable: true });
  Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, writable: true, configurable: true });
  Object.defineProperty(globalThis, "HTMLElement", { value: dom.window.HTMLElement, writable: true, configurable: true });
  Object.defineProperty(globalThis, "Node", { value: dom.window.Node, writable: true, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: dom.window.localStorage, writable: true, configurable: true });
  Object.defineProperty(globalThis, "StorageEvent", { value: dom.window.StorageEvent, writable: true, configurable: true });
  // Node has its own native Event global distinct from jsdom's; without this
  // override, `new Event(...)` constructs a cross-realm instance that jsdom
  // elements reject on dispatchEvent ("parameter 1 is not of type 'Event'").
  Object.defineProperty(globalThis, "Event", { value: dom.window.Event, writable: true, configurable: true });
  Object.defineProperty(globalThis, "MutationObserver", {
    value: dom.window.MutationObserver ||
      class { observe() {} disconnect() {} takeRecords() { return []; } },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, "self", { value: dom.window, writable: true, configurable: true });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    value: dom.window.IntersectionObserver ||
      class { observe() {} unobserve() {} disconnect() {} },
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, "getComputedStyle", { value: dom.window.getComputedStyle, writable: true, configurable: true });
  // jsdom does not implement matchMedia (it requires a layout engine), so
  // code relying on it (e.g. ThemeProvider's system-theme detection) throws
  // without this stub.
  const matchMediaStub = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
  Object.defineProperty(dom.window, "matchMedia", { value: matchMediaStub, writable: true, configurable: true });
  Object.defineProperty(globalThis, "matchMedia", { value: matchMediaStub, writable: true, configurable: true });
  Object.defineProperty(globalThis, "requestAnimationFrame", {
    value: (cb: FrameRequestCallback) => setTimeout(cb, 0),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, "cancelAnimationFrame", {
    value: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
    writable: true,
    configurable: true,
  });
}
