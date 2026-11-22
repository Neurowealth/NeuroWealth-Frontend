/**
 * Regression test for Issue #684: useMemo was called after an early
 * loading-skeleton return, so the loading -> loaded transition changed the
 * number of hooks React saw between renders ("Rendered more hooks than
 * during the previous render").
 *
 * AuditTrail itself can't be mounted here — it (via Skeleton.tsx) imports a
 * CSS module, which this repo's `node --test` runner has no loader for. So
 * this test reproduces the exact bug shape (AuditTrail's hook sequence: six
 * useState + one useEffect, then a loading-gated early return, then a
 * useMemo) in isolation, and separately pins the fix by asserting useMemo
 * precedes the early return in the component source.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import React, { createElement, useEffect, useMemo, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";

import { setupDomGlobals } from "@/test-setup";
import { AuditTrail } from "./AuditTrail";
import { I18nProvider } from "@/contexts/I18nContext";
import { getAuditService, type AuditEvent } from "@/lib/audit-service";

setupDomGlobals();
(globalThis as any).React = React;
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

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

// Reproduces AuditTrail's pre-#684 hook sequence: 6 useState + 1 useEffect
// that resolves loading via setTimeout, then a loading-gated early return,
// then useMemo called only once loading flips to false.
function BuggyAuditLike() {
  const [events, setEvents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  useState("all");
  useState("desc");
  useState<string | null>(null);
  useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents([1, 2, 3]);
      setLoading(false);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return createElement("span", null, "loading");
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- intentionally reproducing the #684 bug shape
  const filtered = useMemo(() => events.filter(Boolean), [events]);
  return createElement("span", { "data-testid": "result" }, String(filtered.length));
}

// Fix pattern used by AuditTrail: useMemo hoisted above the early return.
function FixedAuditLike() {
  const [events, setEvents] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  useState("all");
  useState("desc");
  useState<string | null>(null);
  useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents([1, 2, 3]);
      setLoading(false);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => events.filter(Boolean), [events]);

  if (loading) {
    return createElement("span", null, "loading");
  }

  return createElement("span", { "data-testid": "result" }, String(filtered.length));
}

test("calling useMemo only after a loading-gated early return crashes on the loading -> loaded transition", async () => {
  const { container } = renderToContainer(createElement(BuggyAuditLike));
  assert.equal(container.textContent, "loading");

  let thrown: Error | null = null;
  try {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
  } catch (err) {
    thrown = err as Error;
  }

  assert.ok(thrown, "expected the loading -> loaded transition to throw");
  assert.match(thrown!.message, /Rendered more hooks than during the previous render/);

  container.remove();
});

test("hoisting useMemo above the early return survives the loading -> loaded transition", async () => {
  const { root, container } = renderToContainer(createElement(FixedAuditLike));
  assert.equal(container.textContent, "loading");

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  assert.equal(container.querySelector('[data-testid="result"]')?.textContent, "3");

  cleanup(root, container);
});

test("AuditTrail calls useMemo before its loading-gated early return", () => {
  const dir = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(dir, "AuditTrail.tsx"), "utf8");

  const useMemoIndex = source.indexOf("useMemo(");
  const earlyReturnIndex = source.indexOf("if (loading)");

  assert.ok(useMemoIndex > -1, "expected a useMemo call in AuditTrail.tsx");
  assert.ok(earlyReturnIndex > -1, "expected a loading-gated early return in AuditTrail.tsx");
  assert.ok(
    useMemoIndex < earlyReturnIndex,
    "useMemo must run before the loading-gated early return, or hook order breaks across the loading -> loaded transition",
  );
});

test("AuditTrail safely unmounts while data fetch is pending without errors (#967)", async () => {
  const { root, container } = renderToContainer(
    createElement(I18nProvider, null, createElement(AuditTrail)),
  );

  // AuditTrail starts in loading state
  assert.ok(container.innerHTML.length > 0, "expected container to render initial loading skeleton");

  // Unmount while fetch timer is still pending
  cleanup(root, container);

  // Advance time past the 800ms fetch delay; aborted signal prevents state updates on unmounted component
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 850));
  });
});

const SAMPLE_EVENT: AuditEvent = {
  id: "evt-test-1",
  eventType: "login",
  timestamp: new Date("2026-01-15T10:30:00.000Z"),
  actor: "alice@neurowealth.io",
  ipAddress: "192.0.2.1",
  metadata: { method: "wallet" },
};

test("AuditTrail renders loaded events on a successful non-empty response", async () => {
  const service = getAuditService();
  const originalGetEvents = service.getEvents.bind(service);
  service.getEvents = async () => [SAMPLE_EVENT];

  const { root, container } = renderToContainer(
    createElement(I18nProvider, null, createElement(AuditTrail)),
  );

  try {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    assert.equal(container.querySelector('[role="alert"]'), null);
    assert.ok(
      container.textContent?.includes("alice@neurowealth.io"),
      "expected loaded audit event actor to be rendered",
    );
    assert.ok(
      !container.textContent?.includes("No events found"),
      "expected empty state not to render when events are present",
    );
  } finally {
    service.getEvents = originalGetEvents;
    cleanup(root, container);
  }
});

test("AuditTrail renders empty state on a successful empty response", async () => {
  const service = getAuditService();
  const originalGetEvents = service.getEvents.bind(service);
  service.getEvents = async () => [];

  const { root, container } = renderToContainer(
    createElement(I18nProvider, null, createElement(AuditTrail)),
  );

  try {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    assert.equal(container.querySelector('[role="alert"]'), null);
    assert.ok(
      container.textContent?.includes("No events found"),
      "expected empty state message for successful empty response",
    );
    assert.ok(
      !container.textContent?.includes("Failed to load audit events"),
      "expected error message not to render for successful empty response",
    );
  } finally {
    service.getEvents = originalGetEvents;
    cleanup(root, container);
  }
});

test("AuditTrail renders localised error state with retry on load failure and recovers on retry", async () => {
  const service = getAuditService();
  const originalGetEvents = service.getEvents.bind(service);
  let attempts = 0;
  service.getEvents = async () => {
    attempts += 1;
    if (attempts === 1) {
      throw new Error("Network error");
    }
    return [SAMPLE_EVENT];
  };

  const { root, container } = renderToContainer(
    createElement(I18nProvider, null, createElement(AuditTrail)),
  );

  try {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    const alert = container.querySelector('[role="alert"]');
    assert.ok(alert, "expected an alert element to render on load failure");
    assert.ok(
      alert.textContent?.includes("Failed to load audit events. Please try again."),
      "expected localised error message in alert",
    );
    assert.ok(
      !container.textContent?.includes("No events found"),
      "expected empty state not to render on load failure",
    );

    const retryButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.trim() === "Retry",
    );
    assert.ok(retryButton, "expected a Retry button in the error state");

    act(() => {
      retryButton.click();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    assert.equal(attempts, 2);
    assert.equal(container.querySelector('[role="alert"]'), null);
    assert.ok(
      container.textContent?.includes("alice@neurowealth.io"),
      "expected retry to load and render audit events",
    );
  } finally {
    service.getEvents = originalGetEvents;
    cleanup(root, container);
  }
});
