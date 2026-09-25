/**
 * Characterization tests for useTransactionFlow, written ahead of extracting
 * it from TransactionFlow.tsx (#334). This hook owns the orchestration layer
 * that was previously tangled directly into the 595-line component: theme/
 * kind/preview <-> route sync, sandbox-scenario simulation, and the
 * quote -> confirm -> submit -> pending -> receipt state machine (including
 * error-recovery retries). These tests pin down that state machine so the
 * extraction (and any future change to it) can be verified against a
 * regression baseline instead of by manual QA alone.
 */
import assert from "node:assert/strict";
import test from "node:test";

import { renderHook, act } from "@/test-utils/render-hook";
import { useTransactionFlow, type RouteSearchParams, type FlowRouter } from "./useTransactionFlow";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

function makeSearchParams(params: Record<string, string> = {}): RouteSearchParams {
  const url = new URLSearchParams(params);
  return {
    get: (key: string) => url.get(key),
    toString: () => url.toString(),
  };
}

function makeRouter(): FlowRouter & { replaceCalls: Array<{ href: string; options?: { scroll?: boolean } }> } {
  const replaceCalls: Array<{ href: string; options?: { scroll?: boolean } }> = [];
  return {
    replaceCalls,
    replace: (href, options) => {
      replaceCalls.push({ href, options });
    },
  };
}

function mockSuccessQuote(reference = "NW-DEP-TEST") {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: true,
        data: {
          quote: {
            kind: "deposit",
            amount: 100,
            fee: 1,
            totalDebit: 101,
            netAmount: 100,
            strategyLabel: "Balanced",
            estimatedSettlement: "Instant",
            reference,
          },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
}

function mockSuccessSubmit(overrides: Record<string, unknown> = {}) {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: true,
        data: {
          pending: {
            kind: "deposit",
            reference: "NW-DEP-TEST",
            nextStatus: "success",
            completionDelayMs: 1600,
            quote: {
              kind: "deposit",
              amount: 100,
              fee: 1,
              totalDebit: 101,
              netAmount: 100,
              strategyLabel: "Balanced",
              estimatedSettlement: "Instant",
              reference: "NW-DEP-TEST",
            },
            ...overrides,
          },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
}

function mockErrorResponse(details: Record<string, string | string[]>) {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: false,
        error: { code: "VALIDATION_FAILED", message: "Invalid payload", details },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
}

test("useTransactionFlow — derives theme/kind/preview from search params on mount", () => {
  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "dark", kind: "withdrawal" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  assert.equal(result.current.theme, "dark");
  assert.equal(result.current.kind, "withdrawal");
  assert.equal(result.current.preview, "interactive");
  assert.equal(result.current.stage, "form");
});

test("useTransactionFlow — changing kind syncs the route with the new kind", () => {
  const router = makeRouter();
  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router,
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  act(() => {
    result.current.handleKindChange("withdrawal");
  });

  assert.equal(result.current.kind, "withdrawal");
  assert.equal(router.replaceCalls.length, 1);
  assert.match(router.replaceCalls[0].href, /kind=withdrawal/);
  assert.equal(router.replaceCalls[0].options?.scroll, false);
});

test("useTransactionFlow — submitting a valid review moves to the confirm stage with a quote", async () => {
  mockSuccessQuote();

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  act(() => {
    result.current.updateField("amount", "100");
  });

  await act(async () => {
    await result.current.submitReview?.();
  });

  assert.equal(result.current.stage, "confirm");
  assert.equal(result.current.quote?.reference, "NW-DEP-TEST");
});

test("useTransactionFlow — an invalid amount fails validation before any request is sent", async () => {
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("fetch should not be called for a client-side validation failure");
  };

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  act(() => {
    result.current.updateField("amount", "");
  });

  await act(async () => {
    await result.current.submitReview?.();
  });

  assert.equal(fetchCalled, false);
  assert.equal(result.current.stage, "form");
  assert.ok(result.current.fieldErrors.amount);
});

test("useTransactionFlow — a failed quote request moves to the error stage with recovery info", async () => {
  mockErrorResponse({ amount: ["Amount exceeds available balance"] });

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  act(() => {
    result.current.updateField("amount", "100");
  });

  await act(async () => {
    await result.current.submitReview?.();
  });

  assert.equal(result.current.stage, "error");
  assert.ok(result.current.recovery, "recovery UI info is populated on failure");
  assert.equal(result.current.fieldErrors.amount, "Amount exceeds available balance");
});

test("useTransactionFlow — confirming a quote moves to pending, then to success once the completion timer fires", async (t) => {
  mockSuccessQuote();

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  act(() => {
    result.current.updateField("amount", "100");
  });
  await act(async () => {
    await result.current.submitReview?.();
  });
  assert.equal(result.current.stage, "confirm");

  mockSuccessSubmit();
  const timers = t.mock.timers;
  timers.enable({ apis: ["setTimeout"] });

  await act(async () => {
    await result.current.handleConfirm?.();
  });
  assert.equal(result.current.stage, "pending");
  assert.equal(result.current.pending?.reference, "NW-DEP-TEST");

  act(() => {
    timers.tick(1600);
  });

  assert.equal(result.current.stage, "success");
  assert.equal(result.current.receipt?.reference, "NW-DEP-TEST");
});

test("useTransactionFlow — recovery 'edit' returns to the form stage and clears the failure", async () => {
  mockErrorResponse({ amount: ["Amount exceeds available balance"] });

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  act(() => {
    result.current.updateField("amount", "100");
  });
  await act(async () => {
    await result.current.submitReview?.();
  });
  assert.equal(result.current.stage, "error");

  act(() => {
    result.current.handleRecoveryAction("edit");
  });

  assert.equal(result.current.stage, "form");
  assert.equal(result.current.recovery, null);
});

test("useTransactionFlow — recovery 'retry' after a failed review re-submits the review", async () => {
  mockErrorResponse({ amount: ["Amount exceeds available balance"] });

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  act(() => {
    result.current.updateField("amount", "100");
  });
  await act(async () => {
    await result.current.submitReview?.();
  });
  assert.equal(result.current.stage, "error");

  mockSuccessQuote();
  await act(async () => {
    result.current.handleRecoveryAction("retry");
    // retry fires an async submitReview internally; flush microtasks
    await Promise.resolve();
    await Promise.resolve();
  });

  assert.equal(result.current.stage, "confirm");
});

test("useTransactionFlow — a non-interactive preview short-circuits to its snapshot stage without any request", () => {
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("preview snapshots must not hit the network");
  };

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit", preview: "confirm" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  assert.equal(fetchCalled, false);
  assert.equal(result.current.preview, "confirm");
  assert.equal(result.current.stage, "confirm");
  assert.ok(result.current.quote, "confirm preview snapshot includes a quote");
});

test("useTransactionFlow — recovery 'support' navigates to a mailto link containing the support address and error reference", async () => {
  // Intercept window.location.href assignments — jsdom rejects mailto: navigation,
  // so we proxy window to capture the value without triggering a real navigation.
  const locationHrefs: string[] = [];
  const realWindow = globalThis.window;
  const mockWindow = new Proxy(realWindow, {
    get(target, prop) {
      if (prop === "location") {
        return new Proxy(target.location, {
          set(_t, p, value) {
            if (p === "href") { locationHrefs.push(value as string); return true; }
            return Reflect.set(_t, p, value);
          },
        });
      }
      return Reflect.get(target, prop);
    },
  });
  Object.defineProperty(globalThis, "window", { value: mockWindow, writable: true, configurable: true });

  try {
    mockErrorResponse({ amount: ["Amount exceeds available balance"] });

    const { result } = renderHook(() =>
      useTransactionFlow({
        searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
        router: makeRouter(),
        isSandboxMode: false,
        scenario: "success",
      }),
    );

    act(() => { result.current.updateField("amount", "100"); });
    await act(async () => { await result.current.submitReview?.(); });
    assert.equal(result.current.stage, "error");

    act(() => { result.current.handleRecoveryAction("support"); });

    assert.equal(locationHrefs.length, 1, "window.location.href was set exactly once");
    const href = locationHrefs[0];
    assert.match(href, /^mailto:/, "link must use the mailto: scheme");
    assert.match(href, /neurowealth\.com/, "link must address the support inbox");
    assert.match(href, /subject=/, "link must include an encoded subject");
    assert.match(href, /Transaction%20issue/, "subject must identify the issue type");
    assert.match(href, /body=/, "link must include an encoded body");
    assert.match(href, /deposit/, "body must include the transaction kind");
  } finally {
    Object.defineProperty(globalThis, "window", { value: realWindow, writable: true, configurable: true });
  }
});

test("useTransactionFlow — submitReview and handleConfirm are no-ops while a non-interactive preview is active", async () => {
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    throw new Error("non-interactive preview must not hit the network");
  };

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit", preview: "success" }),
      router: makeRouter(),
      isSandboxMode: false,
      scenario: "success",
    }),
  );

  const stageBefore = result.current.stage;

  await act(async () => {
    await result.current.submitReview?.();
    await result.current.handleConfirm?.();
  });

  assert.equal(fetchCalled, false);
  assert.equal(result.current.stage, stageBefore);
});

test("useTransactionFlow — sandbox mode 'loading' scenario sets submitting state and message, clearing after 3s", (t) => {
  const timers = t.mock.timers;
  timers.enable({ apis: ["setTimeout"] });

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: true,
      scenario: "loading",
    }),
  );

  assert.equal(result.current.isSubmitting, true);
  assert.equal(result.current.requestMessage, "Loading transaction data...");

  act(() => {
    timers.tick(3000);
  });

  assert.equal(result.current.isSubmitting, false);
  assert.equal(result.current.requestMessage, null);
});

test("useTransactionFlow — sandbox mode 'timeout' scenario sets submitting state and message, updating after 5s", (t) => {
  const timers = t.mock.timers;
  timers.enable({ apis: ["setTimeout"] });

  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: true,
      scenario: "timeout",
    }),
  );

  assert.equal(result.current.isSubmitting, true);
  assert.equal(result.current.requestMessage, "Request timed out. Please try again.");

  act(() => {
    timers.tick(5000);
  });

  assert.equal(result.current.isSubmitting, false);
  assert.equal(
    result.current.requestMessage,
    "Connection timeout. Please check your network and retry.",
  );
});

test("useTransactionFlow — sandbox mode 'partial-failure' scenario sets stage to form and sets warning message", () => {
  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: true,
      scenario: "partial-failure",
    }),
  );

  assert.equal(result.current.stage, "form");
  assert.equal(
    result.current.requestMessage,
    "Partial service degradation. Some features may be unavailable.",
  );
});

test("useTransactionFlow — sandbox mode 'empty' scenario resets form, quote, pending, receipt, and sets empty message", () => {
  const { result } = renderHook(() =>
    useTransactionFlow({
      searchParams: makeSearchParams({ theme: "light", kind: "deposit" }),
      router: makeRouter(),
      isSandboxMode: true,
      scenario: "empty",
    }),
  );

  assert.equal(result.current.stage, "form");
  assert.equal(result.current.quote, null);
  assert.equal(result.current.pending, null);
  assert.equal(result.current.receipt, null);
  assert.equal(result.current.requestMessage, "No transaction data available.");
});
