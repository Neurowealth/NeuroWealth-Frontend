import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import { setupDomGlobals } from "@/test-setup";
import { I18nProvider } from "@/contexts/I18nContext";
import { StrategySelector } from "./StrategySelector";

setupDomGlobals();
// tsx compiles the component's JSX with the classic runtime, which expects a global React.
Object.assign(globalThis, { React });

function createJsonResponse<T>(payload: T): Response {
  return new Response(JSON.stringify({ success: true, data: payload }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function renderSelector() {
  return render(
    React.createElement(I18nProvider, null, React.createElement(StrategySelector)),
  );
}

describe("StrategySelector load and retry flow", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    setupDomGlobals();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    globalThis.fetch = originalFetch;
  });

  it("shows the load-error banner and retries the fetch", async () => {
    let callCount = 0;

    globalThis.fetch = (async () => {
      callCount += 1;
      if (callCount === 1) {
        throw new TypeError("network down");
      }
      return createJsonResponse({ strategy: "balanced" });
    }) as typeof fetch;

    const view = renderSelector();

    await waitFor(() => {
      assert.ok(view.getByRole("alert"));
    });

    fireEvent.click(view.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      assert.equal(callCount, 2);
    });

    await waitFor(() => {
      assert.ok(view.getByRole("article", { name: /balanced strategy \(current\)/i }));
    });
    assert.equal(view.queryByRole("alert"), null);
  });

  it("hides Retry while the retried request is in flight, then applies its result", async () => {
    let callCount = 0;
    let resolveRetry!: (response: Response) => void;

    globalThis.fetch = (async () => {
      callCount += 1;
      if (callCount === 1) {
        throw new TypeError("network down");
      }
      return new Promise<Response>((resolve) => {
        resolveRetry = resolve;
      });
    }) as typeof fetch;

    const view = renderSelector();

    await waitFor(() => {
      assert.ok(view.getByRole("alert"));
    });

    fireEvent.click(view.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      assert.equal(callCount, 2);
    });
    // The banner (and its Retry button) is gone, so a second overlapping retry can't be fired.
    assert.equal(view.queryByRole("button", { name: /retry/i }), null);

    await act(async () => {
      resolveRetry(createJsonResponse({ strategy: "conservative" }));
    });

    await waitFor(() => {
      assert.ok(view.getByRole("article", { name: /conservative strategy \(current\)/i }));
    });
    assert.equal(callCount, 2);
  });
});
