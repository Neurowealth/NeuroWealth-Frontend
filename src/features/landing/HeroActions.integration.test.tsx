import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { HeroActions } from "./HeroActions";
import { NavWalletStatus } from "@/components/navbar/NavWalletStatus";
import {
  WalletContext,
  type WalletContextState,
} from "@/contexts/WalletProvider";
import { I18nProvider } from "@/contexts/I18nContext";

setupDomGlobals();
Object.assign(globalThis, { React });

const TEST_PUBLIC_KEY =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

describe("HeroActions + NavWalletStatus integration (#1307)", () => {
  afterEach(cleanup);

  it("navbar shows connected state after hero connects wallet", async () => {
    let walletState: WalletContextState = {
      connected: false,
      isRestoring: false,
      publicKey: undefined,
      walletName: undefined,
      walletProviderId: undefined,
      networkStatus: { hasMismatch: false, appNetworkLabel: "Testnet" },
      balances: [],
      connect: mock.fn(async () => {
        // Simulate successful connection
        walletState = {
          ...walletState,
          connected: true,
          publicKey: TEST_PUBLIC_KEY,
          walletName: "Freighter",
          walletProviderId: "freighter",
        };
      }),
      disconnect: () => {},
      refreshBalances: async () => {},
    };

    const { getByText, rerender, container } = render(
      <I18nProvider>
        <WalletContext.Provider value={walletState}>
          <div>
            <NavWalletStatus />
            <HeroActions />
          </div>
        </WalletContext.Provider>
      </I18nProvider>,
    );

    // Initially, navbar should not show wallet status (disconnected)
    const initialNavContent = container.querySelector(
      '[data-qa="wallet-status-badge"]',
    );
    assert.equal(initialNavContent, null);

    // Hero should show Connect Wallet button
    const connectButton = getByText("Connect Wallet");
    assert.ok(connectButton);

    // Click connect button
    fireEvent.click(connectButton);

    // Wait for connection to complete
    await waitFor(() => {
      assert.equal((walletState.connect as ReturnType<typeof mock.fn>).mock.calls.length, 1);
    });

    // Re-render with updated wallet state
    rerender(
      <I18nProvider>
        <WalletContext.Provider value={walletState}>
          <div>
            <NavWalletStatus />
            <HeroActions />
          </div>
        </WalletContext.Provider>
      </I18nProvider>,
    );

    // Navbar should now show connected state with public key
    const navBadge = container.querySelector('[data-qa="wallet-status-badge"]');
    assert.ok(navBadge, "navbar should display wallet status badge after connection");
    assert.ok(navBadge.textContent?.includes("GBBD…FLA5"));

    // Hero should show Open Dashboard button
    const dashboardButton = getByText("Open Dashboard →");
    assert.ok(dashboardButton);
  });

  it("both hero and navbar reflect the same disconnected state", () => {
    const walletState: WalletContextState = {
      connected: false,
      isRestoring: false,
      publicKey: undefined,
      walletName: undefined,
      walletProviderId: undefined,
      networkStatus: { hasMismatch: false, appNetworkLabel: "Testnet" },
      balances: [],
      connect: async () => {},
      disconnect: () => {},
      refreshBalances: async () => {},
    };

    const { getByText, container } = render(
      <I18nProvider>
        <WalletContext.Provider value={walletState}>
          <div>
            <NavWalletStatus />
            <HeroActions />
          </div>
        </WalletContext.Provider>
      </I18nProvider>,
    );

    // Navbar should not show wallet status
    const navBadge = container.querySelector('[data-qa="wallet-status-badge"]');
    assert.equal(navBadge, null);

    // Hero should show Connect Wallet button
    const connectButton = getByText("Connect Wallet");
    assert.ok(connectButton);
  });

  it("both hero and navbar reflect the same connected state", () => {
    const walletState: WalletContextState = {
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

    const { getByText, container } = render(
      <I18nProvider>
        <WalletContext.Provider value={walletState}>
          <div>
            <NavWalletStatus />
            <HeroActions />
          </div>
        </WalletContext.Provider>
      </I18nProvider>,
    );

    // Navbar should show connected state
    const navBadge = container.querySelector('[data-qa="wallet-status-badge"]');
    assert.ok(navBadge, "navbar should display wallet status badge");
    assert.ok(navBadge.textContent?.includes("GBBD…FLA5"));

    // Hero should show Open Dashboard button
    const dashboardButton = getByText("Open Dashboard →");
    assert.ok(dashboardButton);
  });

  it("hero does not revert to 'Connect Wallet' after navigation simulation", () => {
    const walletState: WalletContextState = {
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

    const { getByText, queryByText, rerender } = render(
      <I18nProvider>
        <WalletContext.Provider value={walletState}>
          <HeroActions />
        </WalletContext.Provider>
      </I18nProvider>,
    );

    // Initial connected state
    assert.ok(getByText("Open Dashboard →"));
    assert.equal(queryByText("Connect Wallet"), null);

    // Simulate navigation by unmounting and remounting
    // (which would happen in a real app when navigating between pages)
    rerender(
      <I18nProvider>
        <WalletContext.Provider value={walletState}>
          <HeroActions />
        </WalletContext.Provider>
      </I18nProvider>,
    );

    // Should still show connected state
    assert.ok(getByText("Open Dashboard →"));
    assert.equal(queryByText("Connect Wallet"), null);
  });
});
