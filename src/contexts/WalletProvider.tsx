"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Networks,
  Asset,
  Memo,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";
import { kit } from "../lib/stellar-wallet-kit";
import {
  clearPersistedWalletState,
  persistWalletState,
  readPersistedWalletState,
} from "@/lib/wallet-persistence";
import {
  detectWalletNetworkMismatch,
  type WalletNetworkStatus,
} from "@/lib/wallet-network-detection";
import { formatConfiguredNetworkLabel } from "@/lib/stellar-network";
import { logger } from "@/lib/logger";
import {
  attemptWalletRestore,
  type Balance,
} from "@/lib/wallet-restore";

export type { Balance };

const Server = Horizon.Server;

export interface PaymentOptions {
  to: string;
  amount: string;
  asset?: "XLM" | { code: string; issuer: string };
  memo?: string;
  secret?: string;
}

interface WalletContextState {
  connected: boolean;
  isRestoring: boolean;
  publicKey?: string;
  walletName?: string;
  walletProviderId?: string;
  networkStatus: WalletNetworkStatus;
  balances: Balance[];
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  sendPayment?: (
    opts: PaymentOptions,
  ) => Promise<Horizon.HorizonApi.SubmitTransactionResponse>;
}

interface WalletConfigContextState {
  horizonUrl: string;
  network: string;
}

interface WalletProviderProps {
  children: ReactNode;
  horizonUrl?: string;
  network?: string;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

const WalletConfigContext = createContext<WalletConfigContextState | undefined>(undefined);

/**
 * Stellar network configuration.
 * Uses NEXT_PUBLIC_STELLAR_NETWORK and NEXT_PUBLIC_STELLAR_HORIZON_URL env vars.
 * Defaults to testnet. Mainnet is out of scope for the current phase.
 */
export function WalletProvider({
  children,
  horizonUrl = "https://horizon-testnet.stellar.org",
  network = Networks.TESTNET,
}: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [publicKey, setPublicKey] = useState<string>();
  const [walletName, setWalletName] = useState<string>();
  const [walletProviderId, setWalletProviderId] = useState<string>();
  const [networkStatus, setNetworkStatus] = useState<WalletNetworkStatus>(
    () => ({
      hasMismatch: false,
      appNetworkLabel: formatConfiguredNetworkLabel(),
    }),
  );
  const [balances, setBalances] = useState<Balance[]>([]);
  const [server] = useState(() => new Server(horizonUrl));

  const refreshNetworkStatus = useCallback(async (providerId?: string) => {
    const status = await detectWalletNetworkMismatch(providerId);
    setNetworkStatus(status);
    return status;
  }, []);

  const connect = useCallback(async () => {
    try {
      const currentKit = kit();

      await currentKit.openModal({
        modalTitle: "Connect to your favorite wallet",
        onWalletSelected: async (option: ISupportedWallet) => {
          currentKit.setWallet(option.id);

          const { address } = await currentKit.getAddress();
          const { name } = option;

          setPublicKey(address);
          setWalletName(name);
          setWalletProviderId(option.id);
          setConnected(true);
          await refreshNetworkStatus(option.id);

          persistWalletState({
            connected: true,
            providerId: option.id,
            publicKey: address,
            displayName: name,
            networkPassphrase: network,
          });

          try {
            const account = await server.accounts().accountId(address).call();
            setBalances(account.balances);
          } catch (error: unknown) {
            if (
              error &&
              typeof error === "object" &&
              "response" in error &&
              (error as { response?: { status?: number } }).response?.status ===
                404
            ) {
              logger.info(`Account ${address} not found. Fund it with XLM.`);
              setBalances([]);
            } else {
              logger.error("Failed to load balances", error);
              setBalances([]);
            }
          }
        },
      });
    } catch (error) {
      logger.error("Failed to connect wallet", error);
      throw error;
    }
  }, [server, network, refreshNetworkStatus]);

  const disconnect = useCallback(async () => {
    try {
      await kit().disconnect();
      setConnected(false);
      setPublicKey(undefined);
      setWalletName(undefined);
      setWalletProviderId(undefined);
      setBalances([]);
      await refreshNetworkStatus();

      clearPersistedWalletState();
    } catch (error) {
      logger.error("Failed to disconnect wallet", error);
    }
  }, [refreshNetworkStatus]);

  const refreshBalances = useCallback(async () => {
    if (!publicKey) return;

    try {
      const account = await server.accounts().accountId(publicKey).call();
      setBalances(account.balances);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        logger.info(
          `Account ${publicKey} not found on testnet. Fund it with XLM to activate it.`,
        );
        setBalances([]);
      } else {
        logger.error("Failed to load balances", error);
        setBalances([]);
      }
    }
  }, [publicKey, server]);

  const sendPayment = useCallback(
    async (
      opts: PaymentOptions,
    ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> => {
      if (!publicKey || !connected) {
        throw new Error("Wallet not connected");
      }

      try {
        const account = await server.loadAccount(publicKey);
        const asset =
          opts.asset === "XLM" || !opts.asset
            ? Asset.native()
            : new Asset(opts.asset.code, opts.asset.issuer);

        const txBuilder = new TransactionBuilder(account, {
          fee: BASE_FEE,
          networkPassphrase: network,
        }).addOperation(
          Operation.payment({
            destination: opts.to,
            asset,
            amount: opts.amount,
          }),
        );

        if (opts.memo) {
          txBuilder.addMemo(Memo.text(opts.memo));
        }

        const transaction = txBuilder.setTimeout(30).build();

        let signedTxXdr: string;
        if (opts.secret) {
          const { Keypair } = await import("@stellar/stellar-sdk");
          const keypair = Keypair.fromSecret(opts.secret);
          transaction.sign(keypair);
          signedTxXdr = transaction.toXDR();
        } else {
          const { signTransaction } = await import("../lib/stellar-wallet-kit");
          signedTxXdr = await signTransaction({
            unsignedTransaction: transaction.toXDR(),
            address: publicKey,
          });
        }

        const signedTransaction = TransactionBuilder.fromXDR(
          signedTxXdr,
          network,
        );
        const result = await server.submitTransaction(signedTransaction);

        await refreshBalances();
        return result;
      } catch (error) {
        logger.error("Payment failed", error);
        throw error;
      }
    },
    [publicKey, connected, server, network, refreshBalances],
  );

  useEffect(() => {
    const autoReconnect = async () => {
      if (typeof window === "undefined") return;

      const outcome = await attemptWalletRestore({
        readPersisted: readPersistedWalletState,
        resolveKitAddress: async (providerId) => {
          const currentKit = kit();
          currentKit.setWallet(providerId);
          const { address } = await currentKit.getAddress();
          return address;
        },
        loadBalances: async (publicKey) => {
          const account = await server.accounts().accountId(publicKey).call();
          return account.balances;
        },
        persist: persistWalletState,
        clear: clearPersistedWalletState,
        networkPassphrase: network,
      });

      if (outcome.kind === "restored") {
        setPublicKey(outcome.publicKey);
        setWalletName(outcome.displayName);
        setWalletProviderId(outcome.providerId);
        setConnected(true);
        await refreshNetworkStatus(outcome.providerId);
        setBalances(outcome.balances);
        if (outcome.accountNotFound) {
          logger.info(
            `Account ${outcome.publicKey} not found. Fund it to activate.`,
          );
        }
      } else if (outcome.kind === "kit-error") {
        logger.warn("Auto-reconnect failed");
      }

      setIsRestoring(false);
    };

    autoReconnect();
  }, [server, network, refreshNetworkStatus]);

  useEffect(() => {
    if (!connected || !walletProviderId) return;
    void refreshNetworkStatus(walletProviderId);
  }, [connected, walletProviderId, refreshNetworkStatus]);

  const walletValue: WalletContextState = {
    connected,
    isRestoring,
    publicKey,
    walletName,
    walletProviderId,
    networkStatus,
    balances,
    connect,
    disconnect,
    refreshBalances,
    sendPayment: connected ? sendPayment : undefined,
  };

  const configValue: WalletConfigContextState = {
    horizonUrl,
    network,
  };

  return (
    <WalletConfigContext.Provider value={configValue}>
      <WalletContext.Provider value={walletValue}>
        {children}
      </WalletContext.Provider>
    </WalletConfigContext.Provider>
  );
}
export function useWallet(): WalletContextState {
  const context = useContext(WalletContext);
  if (context === undefined) {
    return {
      connected: false,
      isRestoring: false,
      publicKey: undefined,
      walletName: undefined,
      walletProviderId: undefined,
      networkStatus: { hasMismatch: false, appNetworkLabel: "" },
      balances: [],
      connect: async () => {},
      disconnect: async () => {},
      refreshBalances: async () => {},
    };
  }
  return context;
}
export function useWalletConfig(): WalletConfigContextState | undefined {
  return useContext(WalletConfigContext);
}
