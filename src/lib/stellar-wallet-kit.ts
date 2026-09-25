import {
  StellarWalletsKit,
  FREIGHTER_ID,
  FreighterModule,
  AlbedoModule,
  LobstrModule,
  xBullModule,
  HanaModule,
  WalletNetwork,
} from "@creit.tech/stellar-wallets-kit";


export { FREIGHTER_ID };

const INJECTED_WALLETS = ["freighter", "albedo", "lobstr"] as unknown as string[];
const RAW_NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet").toLowerCase();
const KIT_NETWORK =
  RAW_NETWORK === "mainnet" || RAW_NETWORK === "public"
    ? WalletNetwork.PUBLIC
    : WalletNetwork.TESTNET;

let kitInstance: StellarWalletsKit | null = null;

export const getKit = (): StellarWalletsKit => {
  if (typeof window === "undefined") {
    return {} as StellarWalletsKit;
  }

  if (!kitInstance) {
    const modules: Array<
      FreighterModule | AlbedoModule | LobstrModule | xBullModule | HanaModule
    > = [];
    const walletList = Array.isArray(INJECTED_WALLETS)
      ? INJECTED_WALLETS
      : ["freighter", "albedo", "lobstr"];

    if (walletList.includes("freighter")) modules.push(new FreighterModule());
    if (walletList.includes("albedo")) modules.push(new AlbedoModule());
    if (walletList.includes("lobstr")) modules.push(new LobstrModule());
    if (walletList.includes("xbull")) modules.push(new xBullModule());
    if (walletList.includes("hana")) modules.push(new HanaModule());

    kitInstance = new StellarWalletsKit({
      network: KIT_NETWORK,
      selectedWalletId: FREIGHTER_ID,
      modules:
        modules.length > 0
          ? modules
          : [new FreighterModule(), new AlbedoModule(), new LobstrModule()],
    });
  }

  return kitInstance;
};

export const kit = () => getKit();

interface signTransactionProps {
  unsignedTransaction: string;
  address: string;
}

export const signTransaction = async ({
  unsignedTransaction,
  address,
}: signTransactionProps): Promise<string> => {
  const { signedTxXdr } = await getKit().signTransaction(unsignedTransaction, {
    address,
  });

  return signedTxXdr;
};

/**
 * Freighter network passphrase for mismatch detection.
 * freighter-api is imported only in this module so all Freighter call sites
 * share one integration path with StellarWalletsKit (#655). Kit does not
 * expose getNetwork, so this thin wrapper is intentional.
 */
export const freighterAPI = {
  async getFreighterNetworkPassphrase(): Promise<string | undefined> {
    if (typeof window === "undefined") return undefined;

    try {
      const { getNetwork: getFreighterNetwork } = await import("@stellar/freighter-api");
      const { networkPassphrase, error } = await getFreighterNetwork();
      if (error || !networkPassphrase) return undefined;
      return networkPassphrase;
    } catch {
      return undefined;
    }
  }
};

/**
 * Landing/quick Freighter connect via the shared kit path (setWallet + getAddress).
 * Uses freighter-api only for the isConnected probe; address comes from the kit.
 */
export async function connectFreighter(): Promise<{ address: string }> {
  if (typeof window === "undefined") {
    throw new Error("Freighter connect requires a browser environment");
  }

  const { isConnected: getFreighterIsConnected } = await import("@stellar/freighter-api");
  const { isConnected, error: connectedError } = await getFreighterIsConnected();
  if (connectedError || !isConnected) {
    throw new Error("Freighter is not installed or not available");
  }

  const currentKit = getKit();
  currentKit.setWallet(FREIGHTER_ID);
  const { address } = await currentKit.getAddress();
  if (!address) {
    throw new Error("Freighter did not return an address");
  }

  return { address };
}
