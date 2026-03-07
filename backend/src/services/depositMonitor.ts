/**
 * Deposit Monitor Service
 * 
 * Monitors Stellar wallet addresses for incoming USDC deposits using Horizon streaming API.
 * Implements connection reliability with exponential backoff and automatic reconnection.
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { logger } from '../utils/logger';
import { eventBus } from './eventBus';
import { getAllUsersWithWallets, findUserByWalletAddress } from '../db/userRepository';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreamConnection {
  walletAddress: string;
  userId: string;
  stream: (() => void) | null; // Stellar SDK stream closer
  reconnectAttempts: number;
  lastError: Error | null;
  lastErrorAt: Date | null;
}

interface StellarPaymentRecord {
  id: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  transaction_hash: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const USDC_ASSET_CODE = 'USDC';
const USDC_ASSET_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'; // Mainnet USDC issuer

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 32000, 60000]; // Exponential backoff in ms
const MAX_RECONNECT_DELAY = 60000; // 60 seconds

// ─── Deposit Monitor Service ──────────────────────────────────────────────────

class DepositMonitorService {
  private server: StellarSdk.Horizon.Server;
  private connections: Map<string, StreamConnection>;
  private isRunning: boolean;

  constructor() {
    const horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
    this.server = new StellarSdk.Horizon.Server(horizonUrl);
    this.connections = new Map();
    this.isRunning = false;

    logger.info({ horizonUrl }, 'Deposit monitor initialized');
  }

  /**
   * Start monitoring all user wallet addresses
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Deposit monitor already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting deposit monitor');

    try {
      // Load all users with wallet addresses
      const users = await getAllUsersWithWallets();
      logger.info({ userCount: users.length }, 'Loaded users with wallets');

      // Establish streaming connection for each wallet
      for (const user of users) {
        if (user.walletAddress) {
          this.addWallet(user.walletAddress, user.id);
        }
      }

      logger.info({ connectionCount: this.connections.size }, 'Deposit monitor started');
    } catch (err) {
      logger.error({ err }, 'Failed to start deposit monitor');
      throw err;
    }
  }

  /**
   * Add monitoring for a new wallet address
   */
  addWallet(walletAddress: string, userId: string): void {
    if (this.connections.has(walletAddress)) {
      logger.debug({ walletAddress }, 'Wallet already being monitored');
      return;
    }

    logger.info({ walletAddress, userId }, 'Adding wallet to monitor');

    const connection: StreamConnection = {
      walletAddress,
      userId,
      stream: null,
      reconnectAttempts: 0,
      lastError: null,
      lastErrorAt: null,
    };

    this.connections.set(walletAddress, connection);
    this.establishConnection(connection);
  }

  /**
   * Remove monitoring for a wallet address
   */
  removeWallet(walletAddress: string): void {
    const connection = this.connections.get(walletAddress);
    if (!connection) {
      logger.debug({ walletAddress }, 'Wallet not being monitored');
      return;
    }

    logger.info({ walletAddress }, 'Removing wallet from monitor');

    if (connection.stream) {
      connection.stream();
    }

    this.connections.delete(walletAddress);
  }

  /**
   * Stop monitoring all wallets
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('Deposit monitor not running');
      return;
    }

    logger.info('Stopping deposit monitor');
    this.isRunning = false;

    // Close all streaming connections
    for (const connection of this.connections.values()) {
      if (connection.stream) {
        connection.stream();
      }
    }

    this.connections.clear();
    logger.info('Deposit monitor stopped');
  }

  /**
   * Process a payment event
   */
  private async handlePayment(payment: StellarPaymentRecord, connection: StreamConnection): Promise<void> {
    // Validate it's a USDC payment
    if (!this.isUSDCPayment(payment)) {
      logger.debug(
        { txHash: payment.transaction_hash, assetCode: payment.asset_code },
        'Ignoring non-USDC payment'
      );
      return;
    }

    // Validate amount > 0
    const amount = parseFloat(payment.amount);
    if (amount <= 0) {
      logger.warn(
        { txHash: payment.transaction_hash, amount: payment.amount },
        'Ignoring payment with zero or negative amount'
      );
      return;
    }

    // Extract payment data
    const txHash = payment.transaction_hash;
    const timestamp = new Date(payment.created_at);
    const walletAddress = payment.to;

    logger.info(
      { txHash, amount: payment.amount, walletAddress, userId: connection.userId },
      'USDC deposit detected'
    );

    // Emit deposit detected event
    eventBus.emitDepositDetected({
      userId: connection.userId,
      walletAddress,
      amount: payment.amount, // Keep as string for precision
      txHash,
      timestamp,
      assetCode: USDC_ASSET_CODE,
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private scheduleReconnect(connection: StreamConnection): void {
    if (!this.isRunning) {
      logger.debug({ walletAddress: connection.walletAddress }, 'Not reconnecting - monitor stopped');
      return;
    }

    // Calculate delay using exponential backoff
    const delayIndex = Math.min(connection.reconnectAttempts, RECONNECT_DELAYS.length - 1);
    const delay = RECONNECT_DELAYS[delayIndex];

    connection.reconnectAttempts++;

    logger.info(
      {
        walletAddress: connection.walletAddress,
        attempt: connection.reconnectAttempts,
        delayMs: delay,
      },
      'Scheduling reconnection'
    );

    setTimeout(() => {
      if (this.isRunning && this.connections.has(connection.walletAddress)) {
        logger.info({ walletAddress: connection.walletAddress }, 'Attempting reconnection');
        this.establishConnection(connection);
      }
    }, delay);
  }
    try {
      logger.info({ walletAddress: connection.walletAddress }, 'Establishing Horizon streaming connection');

      // Create payment stream for this wallet address
      const closer = this.server
        .payments()
        .forAccount(connection.walletAddress)
        .cursor('now') // Start from current ledger
        .stream({
          onmessage: async (payment) => {
            try {
              await this.handlePayment(payment as any, connection);
            } catch (err) {
              logger.error(
                { err, walletAddress: connection.walletAddress, txHash: (payment as any).transaction_hash },
                'Error handling payment'
              );
            }
          },
          onerror: (error) => {
            logger.error(
              { error: error.message, walletAddress: connection.walletAddress },
              'Horizon stream error'
            );

            connection.lastError = error as Error;
            connection.lastErrorAt = new Date();

            // Close existing stream
            if (connection.stream) {
              connection.stream();
              connection.stream = null;
            }

            // Schedule reconnection
            this.scheduleReconnect(connection);
          },
        });

      connection.stream = closer;
      connection.reconnectAttempts = 0; // Reset on successful connection
      logger.info({ walletAddress: connection.walletAddress }, 'Horizon streaming connection established');
    } catch (err) {
      logger.error({ err, walletAddress: connection.walletAddress }, 'Failed to establish connection');
      connection.lastError = err as Error;
      connection.lastErrorAt = new Date();
      this.scheduleReconnect(connection);
    }
  }

  /**
   * Validate if payment is a USDC deposit
   */
  private isUSDCPayment(payment: StellarPaymentRecord): boolean {
    // Check if it's a payment operation
    if (payment.type !== 'payment') {
      return false;
    }

    // Check if it's a credit_alphanum4 or credit_alphanum12 asset (not native XLM)
    if (payment.asset_type !== 'credit_alphanum4' && payment.asset_type !== 'credit_alphanum12') {
      return false;
    }

    // Check if asset code is USDC
    if (payment.asset_code !== USDC_ASSET_CODE) {
      return false;
    }

    // Check if issuer matches (mainnet USDC issuer)
    // For testnet, you may want to use a different issuer or skip this check
    const network = process.env.STELLAR_NETWORK || 'testnet';
    if (network === 'mainnet' && payment.asset_issuer !== USDC_ASSET_ISSUER) {
      return false;
    }

    return true;
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────

export const depositMonitor = new DepositMonitorService();
