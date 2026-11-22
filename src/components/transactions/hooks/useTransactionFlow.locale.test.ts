import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderHook, act } from "@/test-utils/render-hook";
import { I18nProvider } from "@/contexts/I18nContext";
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

const tDomainEn = {
  validation: {
    enterAmount: "Please enter a deposit amount.",
    connectFunding: "Connect your funding wallet before requesting a quote.",
    withdrawAvailable: (avail: string) => `Withdrawal amount cannot exceed available balance of ${avail} USDC.`,
    validStellarAddress: "Enter a valid Stellar address starting with G.",
  },
  context: {
    depositTitle: "Deposit USDC",
    withdrawTitle: "Withdraw USDC",
  },
  pending: {},
  receipt: {},
};

const tDomainFr = {
  validation: {
    enterAmount: "Veuillez entrer un montant de dépôt.",
    connectFunding: "Connectez votre portefeuille de financement avant de demander un devis.",
    withdrawAvailable: (avail: string) => `Le montant du retrait ne peut pas dépasser le solde disponible de ${avail} USDC.`,
    validStellarAddress: "Entrez une adresse Stellar valide commençant par G.",
  },
  context: {
    depositTitle: "Déposer des USDC",
    withdrawTitle: "Retirer des USDC",
  },
  pending: {},
  receipt: {},
};

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
  assert.equal(result.current.fieldErrors.amount, "Please enter a deposit amount.");
  assert.equal(
    result.current.fieldErrors.walletConnected,
    "Connect your funding wallet before requesting a quote.",
  );

  // Switch locale / tDomain to French while preview is displayed
  act(() => {
    rerender({ tDomain: tDomainFr });
  });

  // Snapshot must refresh to French
  assert.equal(result.current.fieldErrors.amount, "Veuillez entrer un montant de dépôt.");
  assert.equal(
    result.current.fieldErrors.walletConnected,
    "Connectez votre portefeuille de financement avant de demander un devis.",
  );
});
