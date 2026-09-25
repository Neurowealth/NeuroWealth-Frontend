import assert from "node:assert/strict";
import test from "node:test";

import { renderHook, act } from "@/test-utils/render-hook";
import { useTransactionAPI } from "./useTransactionAPI";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockErrorResponse(details: Record<string, string | string[]>) {
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_FAILED",
          message: "Invalid payload",
          details,
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
}

function mockSuccessQuote() {
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
            reference: "NW-DEP-TEST",
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
}

test("requestQuote returns fieldErrors from API details instead of discarding them", async () => {
  mockErrorResponse({
    amount: ["Amount exceeds available balance"],
    "values.walletConnected": "Connect a funding wallet",
  });

  const { result } = renderHook(() => useTransactionAPI());

  let quoteResult: Awaited<ReturnType<typeof result.current.requestQuote>> | undefined;

  await act(async () => {
    quoteResult = await result.current.requestQuote("deposit", {
      amount: "999999",
      walletAddress: "",
      walletConnected: false,
    });
  });

  assert.equal(quoteResult?.status, "error");
  if (quoteResult?.status !== "error") {
    throw new Error("Expected error result");
  }

  assert.equal(quoteResult.fieldErrors.amount, "Amount exceeds available balance");
  assert.equal(quoteResult.fieldErrors.walletConnected, "Connect a funding wallet");
  assert.equal(result.current.isSubmitting, false);
  assert.ok(result.current.recovery);
  assert.equal(result.current.fieldErrors.amount, "Amount exceeds available balance");
  assert.equal(result.current.fieldErrors.walletConnected, "Connect a funding wallet");
});

test("submitTransaction returns fieldErrors from API details instead of discarding them", async () => {
  mockErrorResponse({
    "values.walletAddress": "Use a valid Stellar public address",
  });

  const { result } = renderHook(() => useTransactionAPI());

  let submitResult:
    | Awaited<ReturnType<typeof result.current.submitTransaction>>
    | undefined;

  await act(async () => {
    submitResult = await result.current.submitTransaction(
      "withdrawal",
      {
        amount: "100",
        walletAddress: "BAD",
        walletConnected: true,
      },
      "NW-WDR-REF",
    );
  });

  assert.equal(submitResult?.status, "error");
  if (submitResult?.status !== "error") {
    throw new Error("Expected error result");
  }

  assert.equal(
    submitResult.fieldErrors.walletAddress,
    "Use a valid Stellar public address",
  );
  assert.equal(result.current.lastErrorReference, "NW-WDR-REF");
  assert.ok(result.current.recovery);
  assert.equal(
    result.current.fieldErrors.walletAddress,
    "Use a valid Stellar public address",
  );
});

test("a successful request clears field errors left by a previous failure", async () => {
  mockErrorResponse({ amount: "Amount exceeds available balance" });

  const { result } = renderHook(() => useTransactionAPI());

  await act(async () => {
    await result.current.requestQuote("deposit", {
      amount: "999999",
      walletAddress: "",
      walletConnected: true,
    });
  });

  assert.equal(result.current.fieldErrors.amount, "Amount exceeds available balance");

  mockSuccessQuote();

  await act(async () => {
    await result.current.requestQuote("deposit", {
      amount: "100",
      walletAddress: "",
      walletConnected: true,
    });
  });

  assert.deepEqual(result.current.fieldErrors, {});
});

test("requestQuote returns the quote on success", async () => {
  mockSuccessQuote();

  const { result } = renderHook(() => useTransactionAPI());

  let quoteResult: Awaited<ReturnType<typeof result.current.requestQuote>> | undefined;

  await act(async () => {
    quoteResult = await result.current.requestQuote("deposit", {
      amount: "100",
      walletAddress: "",
      walletConnected: true,
    });
  });

  assert.equal(quoteResult?.status, "success");
  if (quoteResult?.status !== "success") {
    throw new Error("Expected success result");
  }

  assert.equal(quoteResult.quote.reference, "NW-DEP-TEST");
  assert.equal(result.current.isSubmitting, false);
  assert.equal(result.current.recovery, null);
});
