/**
 * Withdrawal service - handles vault contract interactions
 */

import { logger } from "../utils/logger";
import { decryptSecretKey } from "../utils/stellar";

const MIN_WITHDRAWAL = 10;

export interface WithdrawalResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Execute withdrawal from Soroban vault contract
 * In production: call actual vault.withdraw() with Stellar SDK
 * For now: simulate with delay
 */
export async function executeVaultWithdrawal(
  encryptedPrivateKey: string,
  walletAddress: string,
  amount: number,
): Promise<WithdrawalResult> {
  try {
    logger.info({ walletAddress, amount }, "Executing vault withdrawal");

    // Decrypt private key for signing
    const secretKey = decryptSecretKey(encryptedPrivateKey);

    // TODO: Replace with actual Soroban vault contract call
    // const server = new StellarSdk.Server('https://horizon.stellar.org');
    // const account = await server.loadAccount(walletAddress);
    // const transaction = new StellarSdk.TransactionBuilder(account, {...})
    //   .addOperation(vaultContract.withdraw(amount))
    //   .build();
    // transaction.sign(StellarSdk.Keypair.fromSecret(secretKey));
    // const result = await server.submitTransaction(transaction);

    // Simulate blockchain delay (skip in tests for faster verification and stability)
    if (process.env.NODE_ENV !== "test") {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    const mockTxHash = `TX${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

    logger.info({ walletAddress, amount, txHash: mockTxHash }, "Withdrawal successful");

    return { success: true, txHash: mockTxHash };
  } catch (error: any) {
    logger.error({ error: error.message, walletAddress, amount }, "Withdrawal failed");
    return { success: false, error: error.message };
  }
}

export function validateWithdrawalAmount(amount: number, balance: number): string | null {
  if (isNaN(amount) || amount <= 0) {
    return "Please enter a valid amount greater than 0.";
  }
  if (amount < MIN_WITHDRAWAL) {
    return `Minimum withdrawal is ${MIN_WITHDRAWAL} USDC.`;
  }
  if (amount > balance) {
    return `Insufficient balance. You have ${balance.toFixed(2)} USDC available.`;
  }
  return null;
}

export function getStellarExpertLink(txHash: string): string {
  return `https://stellar.expert/explorer/public/tx/${txHash}`;
}
