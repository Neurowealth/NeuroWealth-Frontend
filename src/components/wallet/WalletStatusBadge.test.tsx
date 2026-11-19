import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { WalletStatusBadge } from "./WalletStatusBadge";
import { WalletContext, type WalletContextState } from "@/contexts";

setupDomGlobals();
Object.assign(globalThis, { React });

import { truncateWalletAddress } from "@/lib/user";

const TEST_PUBLIC_KEY = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const expectedTruncated = truncateWalletAddress(TEST_PUBLIC_KEY);

const defaultConnectedWallet: WalletContextState = {
  connected: true,
  isRestoring: false,
  publicKey: TEST_PUBLIC_KEY,
  walletName: "Freighter",
  walletProviderId: "freighter",
  networkStatus: { hasMismatch: false, appNetworkLabel: "Testnet" },
  balances: [],
  connect: async () => {},
  disconnect: () => {},
  refreshBalances: async () => {},
};

function renderWithWallet(
  ui: React.ReactElement,
  walletValue: WalletContextState = defaultConnectedWallet,
) {
  return render(
    <WalletContext.Provider value={walletValue}>
      {ui}
    </WalletContext.Provider>,
  );
}

describe("WalletStatusBadge component rendering", () => {
  afterEach(cleanup);

  it("returns null when wallet is disconnected or publicKey is missing", () => {
    const { container: disconnectedContainer } = renderWithWallet(
      <WalletStatusBadge />,
      { ...defaultConnectedWallet, connected: false },
    );
    assert.equal(disconnectedContainer.firstChild, null);

    const { container: noKeyContainer } = renderWithWallet(
      <WalletStatusBadge />,
      { ...defaultConnectedWallet, publicKey: undefined },
    );
    assert.equal(noKeyContainer.firstChild, null);
  });

  it("renders compact mode with badge, check icon, and truncated address", () => {
    const { container, getByText } = renderWithWallet(
      <WalletStatusBadge compact={true} />,
    );

    const badge = container.querySelector('[data-qa="wallet-status-badge"]');
    assert.ok(badge, "expected element with data-qa='wallet-status-badge'");
    assert.ok(badge.classList.contains("gap-2"));
    assert.ok(getByText(expectedTruncated));

    const svg = container.querySelector("svg");
    assert.ok(svg, "expected check icon svg");
    assert.ok(svg.classList.contains("w-4") && svg.classList.contains("h-4"));
  });

  it("applies iconSizeClasses in compact mode across sm, md, and lg sizes", () => {
    const sizes = [
      { size: "sm" as const, expectedClass: "w-3.5" },
      { size: "md" as const, expectedClass: "w-4" },
      { size: "lg" as const, expectedClass: "w-5" },
    ];

    for (const { size, expectedClass } of sizes) {
      const { container } = renderWithWallet(
        <WalletStatusBadge compact={true} size={size} />,
      );
      const svg = container.querySelector("svg");
      assert.ok(svg, `expected svg icon for size ${size}`);
      assert.ok(
        svg.classList.contains(expectedClass),
        `expected ${expectedClass} for compact size ${size}`,
      );
      cleanup();
    }
  });

  it("renders full non-compact mode with wallet name, full and truncated key, and network", () => {
    const { container, getByText } = renderWithWallet(
      <WalletStatusBadge compact={false} />,
    );

    const badge = container.querySelector('[data-qa="wallet-status-badge"]');
    assert.ok(badge, "expected element with data-qa='wallet-status-badge'");
    assert.ok(getByText("Freighter"));
    assert.ok(getByText(TEST_PUBLIC_KEY));
    assert.ok(getByText(expectedTruncated));
    assert.ok(getByText("Testnet"));
  });

  it("applies distinct sizeClasses on container in non-compact mode", () => {
    const expectations = [
      { size: "sm" as const, classCheck: "px-2.5" },
      { size: "md" as const, classCheck: "px-3.5" },
      { size: "lg" as const, classCheck: "px-4" },
    ];

    for (const { size, classCheck } of expectations) {
      const { container } = renderWithWallet(
        <WalletStatusBadge compact={false} size={size} />,
      );
      const badge = container.querySelector('[data-qa="wallet-status-badge"]');
      assert.ok(badge, `expected badge container for size ${size}`);
      assert.ok(
        badge.classList.contains(classCheck),
        `expected ${classCheck} on container for size ${size}`,
      );
      cleanup();
    }
  });

  it("renders network mismatch warning state when hasMismatch is true", () => {
    const { container, getByText } = renderWithWallet(
      <WalletStatusBadge showNetwork={true} />,
      {
        ...defaultConnectedWallet,
        networkStatus: { hasMismatch: true, appNetworkLabel: "Testnet" },
      },
    );

    assert.ok(getByText("Mismatch"));
    const networkRow = container.querySelector(".text-warning");
    assert.ok(networkRow, "expected element with text-warning class for network mismatch");
  });

  it("omits network status section when showNetwork is false", () => {
    const { queryByText } = renderWithWallet(
      <WalletStatusBadge showNetwork={false} />,
    );

    assert.equal(queryByText("Network"), null);
    assert.equal(queryByText("Testnet"), null);
  });
});
