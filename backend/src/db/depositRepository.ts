/**
 * Deposit repository
 * 
 * Database operations for deposit records.
 */

import pool from './pool';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeploymentStatus = 'deploying' | 'deployed' | 'failed';

export interface Deposit {
  id: string;
  userId: string;
  walletAddress: string;
  amount: string;
  txHash: string;
  deploymentStatus: DeploymentStatus;
  detectedAt: Date;
  deployedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Helper: Map database row to Deposit interface ───────────────────────────

function mapRowToDeposit(row: any): Deposit {
  return {
    id: row.id,
    userId: row.user_id,
    walletAddress: row.wallet_address,
    amount: row.amount,
    txHash: row.tx_hash,
    deploymentStatus: row.deployment_status as DeploymentStatus,
    detectedAt: row.detected_at,
    deployedAt: row.deployed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function checkDepositExists(txHash: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT id FROM deposits WHERE tx_hash = $1',
      [txHash]
    );
    
    return result.rows.length > 0;
  } catch (err) {
    logger.error({ err, txHash }, 'Failed to check if deposit exists');
    throw err;
  }
}

export async function getDepositByTxHash(txHash: string): Promise<Deposit | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM deposits WHERE tx_hash = $1',
      [txHash]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return mapRowToDeposit(result.rows[0]);
  } catch (err) {
    logger.error({ err, txHash }, 'Failed to get deposit by tx hash');
    throw err;
  }
}

export async function createDeposit(
  userId: string,
  walletAddress: string,
  amount: string,
  txHash: string,
  detectedAt: Date
): Promise<Deposit> {
  const id = randomUUID();
  
  try {
    const result = await pool.query(
      `INSERT INTO deposits (id, user_id, wallet_address, amount, tx_hash, deployment_status, detected_at, deployed_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [id, userId, walletAddress, amount, txHash, 'deploying', detectedAt, null]
    );
    
    return mapRowToDeposit(result.rows[0]);
  } catch (err) {
    logger.error({ err, userId, txHash, amount }, 'Failed to create deposit');
    throw err;
  }
}

export async function updateDeploymentStatus(
  txHash: string,
  status: DeploymentStatus,
  deployedAt?: Date
): Promise<void> {
  try {
    const result = await pool.query(
      `UPDATE deposits 
       SET deployment_status = $1, deployed_at = $2, updated_at = NOW()
       WHERE tx_hash = $3`,
      [status, deployedAt || null, txHash]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`Deposit not found: ${txHash}`);
    }
  } catch (err) {
    logger.error({ err, txHash, status }, 'Failed to update deployment status');
    throw err;
  }
}

export async function getDepositsByUserId(userId: string): Promise<Deposit[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM deposits WHERE user_id = $1 ORDER BY detected_at DESC',
      [userId]
    );
    
    return result.rows.map(mapRowToDeposit);
  } catch (err) {
    logger.error({ err, userId }, 'Failed to get deposits by user ID');
    throw err;
  }
}
