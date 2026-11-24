import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { HeroActions } from "./HeroActions";
import {
  WalletContext,
  type WalletContextState,
} from "@/contexts/WalletProvider";
import { I18nProvider } from "@/contexts/I18nContext";

setupDomGlobals();
Object.assign(globalThis, { React });

const TEST_PUBLIC_KEY =
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

const defaultDisconnectedWallet: WalletContextState = {
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

function renderWithWallet(walletValue: WalletContextState) {
  return render(
    <I18nProvider>
      <WalletContext.Provider value={walletValue}>
        <HeroActions />
      </WalletContext.Provider>
    </I18nProvider>,
  );
}

describe("HeroActions component with shared wallet state", () => {
  afterEach(cleanup);

  it("displays 'Connect Wallet' button when wallet is disconnected", () => {
    const { getByText, queryByText } = renderWithWallet(
      defaultDisconnectedWallet,
    );

    assert.ok(getByText("Connect Wallet"));
    assert.equal(queryByText("Open Dashboard →"), null);
  });

  it("displays 'Open Dashboard →' button when wallet is connected", () => {
    const { getByText, queryByText } = renderWithWallet(
      defaultConnectedWallet,
    );

    assert.ok(getByText("Open Dashboard →"));
    assert.equal(queryByText("Connect Wallet"), null);
  });

  it("calls the shared wallet connect() when Connect Wallet is clicked", async () => {
    const connectMock = mock.fn(async () => {});

    const { getByText } = renderWithWallet({
      ...defaultDisconnectedWallet,
      connect: connectMock,
    });

    const button = getByText("Connect Wallet");
    fireEvent.click(button);

    await waitFor(() => {
      assert.equal(connectMock.mock.calls.length, 1);
    });
  });

  it("displays 'Connecting…' text while connection is in progress", async () => {
    let resolveConnect: (() => void) | undefined;
    const connectPromise = new Promise<void>((resolve) => {
      resolveConnect = resolve;
    });

    const connectMock = mock.fn(async () => {
      await connectPromise;
    });

    const { getByText } = renderWithWallet({
      ...defaultDisconnectedWallet,
      connect: connectMock,
    });

    const button = getByText("Connect Wallet");
    fireEvent.click(button);

    await waitFor(() => {
      assert.ok(getByText("Connecting…"));
    });

    // Resolve the promise to complete the connection
    if (resolveConnect) resolveConnect();
  });

  it("disables the button when isRestoring is true", () => {
    const { container } = renderWithWallet({
      ...defaultDisconnectedWallet,
      isRestoring: true,
    });

    const button = container.querySelector(
      '[data-qa="landing-primary-cta-button"]',
    ) as HTMLButtonElement;
    assert.ok(button);
    assert.equal(button.disabled, true);
  });

  it("displays error message when connection fails", async () => {
    const connectMock = mock.fn(async () => {
      throw new Error("Connection failed");
    });

    const { getByText, container } = renderWithWallet({
      ...defaultDisconnectedWallet,
      connect: connectMock,
    });

    const button = getByText("Connect Wallet");
    fireEvent.click(button);

    await waitFor(() => {
      const errorElement = container.querySelector(
        '[data-qa="landing-connection-error"]',
      );
      assert.ok(errorElement);
      assert.ok(errorElement.textContent?.includes("Failed to connect"));
    });
  });

  it("displays specific error when wallet is not installed", async () => {
    const connectMock = mock.fn(async () => {
      throw new Error("Wallet not installed");
    });

    const { getByText, container } = renderWithWallet({
      ...defaultDisconnectedWallet,
      connect: connectMock,
    });

    const button = getByText("Connect Wallet");
    fireEvent.click(button);

    await waitFor(() => {
      const errorElement = container.querySelector(
        '[data-qa="landing-connection-error"]',
      );
      assert.ok(errorElement);
      assert.ok(errorElement.textContent?.includes("No wallet detected"));
    });
  });

  it("re-enables button after failed connection attempt", async () => {
    const connectMock = mock.fn(async () => {
      throw new Error("Connection failed");
    });

    const { getByText, container } = renderWithWallet({
      ...defaultDisconnectedWallet,
      connect: connectMock,
    });

    const button = container.querySelector(
      '[data-qa="landing-primary-cta-button"]',
    ) as HTMLButtonElement;
    
    fireEvent.click(button);

    await waitFor(() => {
      const errorElement = container.querySelector(
        '[data-qa="landing-connection-error"]',
      );
      assert.ok(errorElement);
    });

    // Button should be re-enabled after error
    assert.equal(button.disabled, false);
  });

  it("renders Learn More button in both connected and disconnected states", () => {
    const { getByText: getByTextDisconnected } = renderWithWallet(
      defaultDisconnectedWallet,
    );
    assert.ok(getByTextDisconnected("Learn More"));
    cleanup();

    const { getByText: getByTextConnected } = renderWithWallet(
      defaultConnectedWallet,
    );
    assert.ok(getByTextConnected("Learn More"));
  });

  it("renders secondary Open Dashboard button only when disconnected", () => {
    const { getAllByText: getAllByTextDisconnected } = renderWithWallet(
      defaultDisconnectedWallet,
    );
    const dashboardButtons = getAllByTextDisconnected("Open Dashboard");
    assert.ok(dashboardButtons.length > 0);
    cleanup();

    const { queryAllByText: queryAllByTextConnected } = renderWithWallet(
      defaultConnectedWallet,
    );
    const secondaryButtons = queryAllByTextConnected("Open Dashboard");
    // When connected, only "Open Dashboard →" should appear
    assert.equal(secondaryButtons.length, 0);
  });
});

describe("HeroActions integration with global wallet state", () => {
  afterEach(cleanup);

  it("reflects wallet connection state changes from the provider", async () => {
    const connectMock = mock.fn(async () => {});

    const { getByText, rerender } = render(
      <I18nProvider>
        <WalletContext.Provider value={{
          ...defaultDisconnectedWallet,
          connect: connectMock,
        }}>
          <HeroActions />
        </WalletContext.Provider>
      </I18nProvider>,
    );

    // Initially disconnected
    assert.ok(getByText("Connect Wallet"));

    // Simulate successful connection by updating the context
    rerender(
      <I18nProvider>
        <WalletContext.Provider value={defaultConnectedWallet}>
          <HeroActions />
        </WalletContext.Provider>
      </I18nProvider>,
    );

    // Should now show connected state
    assert.ok(getByText("Open Dashboard →"));
  });

  it("persists connected state across component remounts", () => {
    const { getByText, unmount } = renderWithWallet(defaultConnectedWallet);
    
    assert.ok(getByText("Open Dashboard →"));
    
    unmount();
    
    // Remount with the same connected state
    const { getByText: getByTextRemounted } = renderWithWallet(
      defaultConnectedWallet,
    );
    
    assert.ok(getByTextRemounted("Open Dashboard →"));
  });
});
