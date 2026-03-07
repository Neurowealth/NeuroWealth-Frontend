/**
 * Deposit Recorder Service
 * 
 * Records deposit transactions in the database with idempotency.
 * Updates user portfolio totals atomically.
 */

import pool from '../db/pool';
import { logger } from '../utils/logger';
import { eventBus } from './eventBus';
import { DepositDetectedEvent } from '../types/deposit';
import {
  checkDepositExists,
  createDeposit,
  updateDeploymentStatus as updateDepositStatus,
  getDepositByTxHash,
} from '../db/depositRepository';
import { incrementUserDeposit } from '../db/userRepository';
import { findUserByPhone } from '../db/userStore';

// ─── Deposit Recorder Service ─────────────────────────────────────────────────

class DepositRecorderService {
  /**
   * Start listening for deposit events
   */
  start(): void {
    logger.info('Starting deposit recorder service');

    // Listen for deposit detected events
    eventBus.onDepositDetected(async (event) => {
      try {
        await this.handleDepositDetected(event);
      } catch (err) {
        logger.error({ err, event }, 'Failed to handle deposit detected event');
      }
    });

    logger.info('Deposit recorder service started');
  }

  /**
   * Handle deposit detected event
   */
  async handleDepositDetected(event: DepositDetectedEvent): Promise<void> {
    const { userId, walletAddress, amount, txHash, timestamp } = event;

    logger.info({ userId, txHash, amount }, 'Processing deposit detected event');

    // Check for duplicate transaction hash (idempotency)
    const exists = await checkDepositExists(txHash);
    if (exists) {
      logger.info({ txHash }, 'Deposit already exists - ignoring duplicate');
      return;
    }

    // Start database transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create deposit record
      const result = await client.query(
        `INSERT INTO deposits (id, user_id, wallet_address, amount, tx_hash, deployment_status, detected_at, deployed_at, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [userId, walletAddress, amount, txHash, 'deploying', timestamp, null]
      );

      const deposit = result.rows[0];

      // Update user portfolio total
      await client.query(
        `UPDATE users 
         SET total_deposited = total_deposited + $1,
             deposited_at = COALESCE(deposited_at, NOW()),
             step = CASE WHEN total_deposited + $1 > 0 THEN 'active' ELSE step END,
             updated_at = NOW()
         WHERE id = $2`,
        [parseFloat(amount), userId]
      );

      // Commit transaction
      await client.query('COMMIT');

      logger.info(
        { depositId: deposit.id, userId, txHash, amount },
        'Deposit recorded successfully'
      );

      // Get user strategy for the event
      const user = await client.query('SELECT strategy FROM users WHERE id = $1', [userId]);
      const strategy = user.rows[0]?.strategy || 'balanced';

      // Emit deposit recorded event
      eventBus.emitDepositRecorded({
        depositId: deposit.id,
        userId,
        walletAddress,
        amount,
        txHash,
        strategy,
        timestamp,
      });
    } catch (err) {
      // Rollback on error
      await client.query('ROLLBACK');
      logger.error({ err, userId, txHash }, 'Failed to record deposit - rolled back transaction');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update deployment status for a deposit
   */
  async updateDeploymentStatus(
    txHash: string,
    status: 'deployed' | 'failed'
  ): Promise<void> {
    try {
      const deployedAt = status === 'deployed' ? new Date() : undefined;
      await updateDepositStatus(txHash, status, deployedAt);

      logger.info({ txHash, status }, 'Deployment status updated');
    } catch (err) {
      logger.error({ err, txHash, status }, 'Failed to update deployment status');
      throw err;
    }
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────

export const depositRecorder = new DepositRecorderService();
