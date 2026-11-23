import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderHook, act } from "@/test-utils/render-hook";
import { I18nProvider } from "@/contexts/I18nContext";
import { dictionaries } from "@/lib/i18n/messages";
import { useTransactionFlow, type RouteSearchParams, type FlowRouter } from "./useTransactionFlow";

function makeSearchParams(params: Record<string, string> = {}): RouteSearchParams {
  const url = new URLSearchParams(params);
  return {
    get: (key: string) => url.get(key),
    toString: () => url.toString(),
  };
}

function makeRouter(): FlowRouter {
  return {
    replace: () => {},
  };
}

const tDomainEn = dictionaries.en.transactions.domain;
const tDomainFr = dictionaries.fr.transactions.domain;

test("useTransactionFlow — updates preview snapshot copy when locale / tDomain changes", () => {
  const searchParams = makeSearchParams({ kind: "deposit", preview: "validation" });
  const router = makeRouter();

  const { result, rerender } = renderHook(
    ({ tDomain }) =>
      useTransactionFlow({
        searchParams,
        router,
        isSandboxMode: false,
        scenario: "success",
        tDomain,
      }),
    {
      wrapper: ({ children }) => React.createElement(I18nProvider, null, children),
      initialProps: { tDomain: tDomainEn },
    },
  );

  // Initially in English
  assert.equal(result.current.fieldErrors.amount, tDomainEn.validation.enterAmount);
  assert.equal(
    result.current.fieldErrors.walletConnected,
    tDomainEn.validation.connectFunding,
  );

  // Switch locale / tDomain to French while preview is displayed
  act(() => {
    rerender({ tDomain: tDomainFr });
  });

  // Snapshot must refresh to French
  assert.equal(result.current.fieldErrors.amount, tDomainFr.validation.enterAmount);
  assert.equal(
    result.current.fieldErrors.walletConnected,
    tDomainFr.validation.connectFunding,
  );
});
