declare module "@creit.tech/stellar-wallets-kit" {
  export interface ISupportedWallet {
    id: string;
    name: string;
    icon: string;
    type: string;
  }

  export const FREIGHTER_ID: string;

  export class StellarWalletsKit {
    constructor(options: {
      network: WalletNetwork;
      selectedWalletId?: string;
      modules: unknown[];
    });
    openModal(options?: {
      modalTitle?: string;
      onWalletSelected?: (wallet: ISupportedWallet) => void;
    }): Promise<void>;
    closeModal(): void;
    setWallet(id: string): void;
    getSelectedWallet(): Promise<ISupportedWallet | null>;
    disconnect(): Promise<void>;
    getAddress(): Promise<{ address: string; name: string }>;
    signTransaction(
      xdr: string,
      opts?: { network?: string; account?: string; address?: string },
    ): Promise<{ signedTxXdr: string }>;
  }

  export class FreighterModule {
    constructor();
  }
  export class AlbedoModule {
    constructor();
  }
  export class LobstrModule {
    constructor();
  }
  export class xBullModule {
    constructor();
  }
  export class HanaModule {
    constructor();
  }

  export enum WalletNetwork {
    PUBLIC = "PUBLIC",
    TESTNET = "TESTNET",
    FUTURENET = "FUTURENET",
  }
}
