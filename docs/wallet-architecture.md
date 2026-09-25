# Stellar Wallet Integration & Architecture

This document describes how NeuroWealth manages wallet connections, persistence, and the distinction between wallet-level "connection" and application-level "authentication".

## Metadata Dictionary (LocalStorage)

The `WalletProvider` (via `src/lib/wallet-persistence.ts`) owns and manages minimal connection metadata in `localStorage`. All keys are centrally defined in `src/lib/storage-keys.ts`.

**Lifecycle:**
- **Created**: When a user successfully connects their wallet via the `WalletProvider.connect` method.
- **Cleared**: When a user disconnects their wallet (`WalletProvider.disconnect`) or if auto-reconnect fails on mount (e.g., wallet locked, extension uninstalled).
- **Logout Behavior**: Disconnecting the wallet clears these keys. However, logging out of an application *session* (if session auth is implemented) should also trigger wallet disconnect to ensure connection state doesn't leak across users.

| Key (`STORAGE_KEYS`) | localStorage value | Description |
|:---|:---|:---|
| `WALLET_CONNECTED` | `"true" \| undefined` | Boolean flag indicating if a wallet was previously connected. |
| `WALLET_PROVIDER` | `string` | Wallet provider ID (e.g., `"freighter"`, `"albedo"`). Matches `@creit.tech/stellar-wallets-kit` IDs. |
| `WALLET_PUBLIC_KEY` | `string` | Public G-address of the connected account. |
| `WALLET_DISPLAY_NAME` | `string` | Human-readable wallet name (e.g., `"Freighter"`). |
| `WALLET_NETWORK` | `string` | Stellar network passphrase the app used when the wallet was connected. |

Legacy `stellar_wallet_*` keys are migrated automatically on first read.

> [!IMPORTANT]
> These keys ONLY track the UI connection state. They do not represent a secure session.

## Connection vs. Session Auth

It is critical to explicitly distinguish between the **Wallet Connection**, **Application Authentication**, and **Cookie Storage**:

1.  **Wallet Connection State (Frontend-only, LocalStorage)**:
    - Facilitated by `WalletProvider`.
    - Allows the frontend to request transaction signatures via the user's browser extension.
    - Status is stored in the `localStorage` keys listed above.
    - **Security**: Low. LocalStorage can be read by any script on the origin. This only gives the app the user's *public* address.

2.  **Session / Authentication State (Cookie/Auth Storage)**:
    - To perform actions on the user's behalf or access private data, a proper Auth session (JWT or secure HTTP-only Cookie) is required.
    - This typically involves the user signing a "Challenge" (SEP-10 standard) to prove ownership of the private key.
    - Cookie storage is distinct from localStorage and should be used for persistent, secure session identifiers.
    - NeuroWealth currently uses the wallet connection primarily for triggering on-chain transactions from the browser.

## WalletProvider Behavior

### Auto-Reconnect Logic
On mount, the `WalletProvider` calls `readPersistedWalletState()`. If a saved connection exists, it attempts to:
1.  Initialize the `stellar-wallets-kit` with the saved `WALLET_PROVIDER`.
2.  Silently request the address from the extension.
3.  If the address matches the saved `WALLET_PUBLIC_KEY`, the connection is restored and network mismatch is re-checked.
4.  If any step fails (e.g., wallet locked, extension uninstalled), persisted wallet keys are cleared.

### Network mismatch warnings
When Freighter is the active provider, the app compares the extension network to `NEXT_PUBLIC_STELLAR_NETWORK` and surfaces a warning in the navbar and connect button if they differ.

### Transaction Signing
When `sendPayment` is called:
- It builds a transaction using `@stellar/stellar-sdk`.
- If a `secret` is provided (internal use), it signs with the Keypair.
- Otherwise, it invokes the `stellar-wallets-kit` modal/extension to request a user signature.
- Submits the resulting XDR to the configured Horizon endpoint.
