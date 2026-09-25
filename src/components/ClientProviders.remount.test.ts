/**
 * Verifies the #640 remount fix used by ClientProviders:
 * composeProviders() must not run inside a component body, or React treats the
 * result as a new component type every render and remounts the whole subtree.
 *
 * Full ClientProviders mount is skipped here — WalletProvider pulls Albedo which
 * needs a browser FetchAPI polyfill. These tests cover the exact remount
 * mechanism ClientProviders had/fixed.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  createElement,
  useEffect,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";

import { setupDomGlobals } from "@/test-setup";
import { composeProviders } from "@/lib/composeProviders";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

setupDomGlobals();
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function Passthrough({ children }: { children: ReactNode }) {
  return createElement("div", { "data-testid": "passthrough" }, children);
}

function MountProbe({ onMount }: { onMount: () => void }) {
  useEffect(() => {
    onMount();
  }, [onMount]);
  return createElement("span", { "data-testid": "probe" }, "mounted");
}

function renderToContainer(ui: ReactNode): {
  root: Root;
  container: HTMLDivElement;
} {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { root, container };
}

function cleanup(root: Root, container: HTMLDivElement) {
  act(() => {
    root.unmount();
  });
  container.remove();
}

test("composing providers inside render remounts children on parent re-render", () => {
  let mountCount = 0;
  const onMount = () => {
    mountCount += 1;
  };

  function BrokenParent({ tick }: { tick: number }) {
    // Bug pattern (pre-#640 ClientProviders): new ComposedProviders identity every render
    const Providers = composeProviders([Passthrough]);
    return createElement(
      Providers,
      null,
      createElement(MountProbe, { onMount }),
      createElement("span", null, String(tick)),
    );
  }

  const { root, container } = renderToContainer(
    createElement(BrokenParent, { tick: 0 }),
  );
  assert.equal(mountCount, 1);

  act(() => {
    root.render(createElement(BrokenParent, { tick: 1 }));
  });
  assert.equal(
    mountCount,
    2,
    "unstable composeProviders identity must remount children",
  );

  cleanup(root, container);
});

test("module-scoped composeProviders keeps children mounted across parent re-renders", () => {
  let mountCount = 0;
  const onMount = () => {
    mountCount += 1;
  };

  // Fix pattern used by ClientProviders: stable identity at module scope
  const Providers = composeProviders([Passthrough]);

  function StableParent({ tick }: { tick: number }) {
    return createElement(
      Providers,
      null,
      createElement(MountProbe, { onMount }),
      createElement("span", null, String(tick)),
    );
  }

  const { root, container } = renderToContainer(
    createElement(StableParent, { tick: 0 }),
  );
  assert.equal(mountCount, 1);

  act(() => {
    root.render(createElement(StableParent, { tick: 1 }));
  });
  act(() => {
    root.render(createElement(StableParent, { tick: 2 }));
  });
  assert.equal(
    mountCount,
    1,
    "stable composeProviders identity must not remount children",
  );

  cleanup(root, container);
});

test("ClientProviders hoists composeProviders and resolveStellarConfig to module scope", () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(dir, "ClientProviders.tsx"), "utf8");

  const componentBody = source.slice(
    source.indexOf("export function ClientProviders"),
  );

  assert.match(
    source,
    /const stellarConfig = resolveStellarConfig\(\)/,
    "resolveStellarConfig must be called once at module scope",
  );
  assert.match(
    source,
    /const Providers = composeProviders\(\[/,
    "composeProviders must be called once at module scope",
  );
  assert.doesNotMatch(
    componentBody,
    /composeProviders\(/,
    "ClientProviders body must not call composeProviders",
  );
  assert.doesNotMatch(
    componentBody,
    /resolveStellarConfig\(/,
    "ClientProviders body must not call resolveStellarConfig",
  );
});
