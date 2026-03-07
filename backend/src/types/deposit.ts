/**
 * Deposit event types
 * 
 * TypeScript interfaces for deposit lifecycle events.
 */

import { Strategy } from '../db/userRepository';

export interface DepositDetectedEvent {
  userId: string;
  walletAddress: string;
  amount: string; // Stellar amounts are strings to preserve precision
  txHash: string;
  timestamp: Date;
  assetCode: string; // Always 'USDC' after filtering
}

export interface DepositRecordedEvent {
  depositId: string;
  userId: string;
  walletAddress: string;
  amount: string;
  txHash: string;
  strategy: Strategy;
  timestamp: Date;
}

export interface DeploymentRequestedEvent {
  depositId: string;
  userId: string;
  amount: string;
  strategy: Strategy;
  txHash: string;
  timestamp: Date;
}

export interface DeploymentConfirmedEvent {
  txHash: string;
  deployedAt: Date;
}

export interface DeploymentFailedEvent {
  txHash: string;
  error: string;
  failedAt: Date;
}
