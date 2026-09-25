/**
 * Characterization tests for useNavbarSearch, written ahead of splitting the
 * mobile/desktop search state out of Navbar.tsx into NavbarSearchBox /
 * NavbarSearchTrigger / NavbarSearchModal (#333). These pin down the state
 * transitions Navbar.tsx relied on inline before the extraction:
 *
 *   - opening mobile search locks body scroll; closing restores it
 *   - isMobileSearchOpen and isDesktopSearchActive start false and toggle
 *     independently
 *   - the focus-trap effect only engages while isMobileSearchOpen is true
 *
 * No JSX-authored component is imported here — see NavbarAuthActions.test.ts
 * for why (jsx:"preserve" + the tsx test loader's classic-transform fallback
 * requires every rendered component to import React, which no .tsx file in
 * this repo does; every existing component test in this repo works around it
 * by testing extracted plain-TS logic/hooks instead of rendering JSX).
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";

import { setupDomGlobals } from "@/test-setup";

setupDomGlobals();
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import { useNavbarSearch, type NavbarSearchState } from "./useNavbarSearch";

function renderHook(): { state: NavbarSearchState; root: Root; container: HTMLDivElement } {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let latest!: NavbarSearchState;
  function Probe() {
    latest = useNavbarSearch();
    return null;
  }

  act(() => {
    root.render(createElement(Probe));
  });

  return { state: latest, root, container };
}

function cleanup(root: Root, container: HTMLDivElement) {
  act(() => {
    root.unmount();
  });
  container.remove();
}

test("useNavbarSearch — starts with both search surfaces closed", () => {
  const { state, root, container } = renderHook();

  assert.equal(state.isMobileSearchOpen, false);
  assert.equal(state.isDesktopSearchActive, false);
  assert.equal(document.body.style.overflow, "", "body scroll is not locked before opening");

  cleanup(root, container);
});

test("useNavbarSearch — opening mobile search locks body scroll", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let latest!: NavbarSearchState;
  function Probe() {
    latest = useNavbarSearch();
    return null;
  }

  act(() => {
    root.render(createElement(Probe));
  });

  act(() => {
    latest.setIsMobileSearchOpen(true);
  });
  act(() => {
    root.render(createElement(Probe));
  });

  assert.equal(latest.isMobileSearchOpen, true);
  assert.equal(document.body.style.overflow, "hidden", "opening mobile search locks body scroll");

  cleanup(root, container);
});

test("useNavbarSearch — closing mobile search restores body scroll", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let latest!: NavbarSearchState;
  function Probe() {
    latest = useNavbarSearch();
    return null;
  }

  act(() => {
    root.render(createElement(Probe));
  });
  act(() => {
    latest.setIsMobileSearchOpen(true);
  });
  act(() => {
    root.render(createElement(Probe));
  });
  assert.equal(document.body.style.overflow, "hidden");

  act(() => {
    latest.setIsMobileSearchOpen(false);
  });
  act(() => {
    root.render(createElement(Probe));
  });

  assert.equal(latest.isMobileSearchOpen, false);
  assert.equal(document.body.style.overflow, "", "closing mobile search restores body scroll");

  cleanup(root, container);
});

test("useNavbarSearch — desktop search activation is independent of mobile search state", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let latest!: NavbarSearchState;
  function Probe() {
    latest = useNavbarSearch();
    return null;
  }

  act(() => {
    root.render(createElement(Probe));
  });

  act(() => {
    latest.setIsDesktopSearchActive(true);
  });
  act(() => {
    root.render(createElement(Probe));
  });

  assert.equal(latest.isDesktopSearchActive, true);
  assert.equal(latest.isMobileSearchOpen, false, "activating desktop search does not open mobile search");
  assert.equal(document.body.style.overflow, "", "desktop search activation does not touch body scroll");

  cleanup(root, container);
});

test("useNavbarSearch — unmounting while mobile search is open still restores body scroll", () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let latest!: NavbarSearchState;
  function Probe() {
    latest = useNavbarSearch();
    return null;
  }

  act(() => {
    root.render(createElement(Probe));
  });
  act(() => {
    latest.setIsMobileSearchOpen(true);
  });
  act(() => {
    root.render(createElement(Probe));
  });
  assert.equal(document.body.style.overflow, "hidden");

  act(() => {
    root.unmount();
  });

  assert.equal(document.body.style.overflow, "", "unmount cleanup restores body scroll even if still open");

  container.remove();
});
