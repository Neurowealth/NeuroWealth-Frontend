/**
 * User repository - PostgreSQL implementation
 * 
 * Replaces in-memory userStore with database queries.
 * Function signatures remain identical for backward compatibility.
 */

import pool from './pool';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardingStep =
  | 'awaiting_strategy'
  | 'awaiting_confirmation'
  | 'awaiting_deposit'
  | 'active';

export type Strategy = 'conservative' | 'balanced' | 'growth';

export interface User {
  id: string;
  phone: string;
  step: OnboardingStep;
  strategy: Strategy | null;
  walletAddress: string | null;
  encryptedPrivateKey: string | null;
  totalDeposited: number;
  depositedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Helper: Map database row to User interface ──────────────────────────────

function mapRowToUser(row: any): User {
  return {
    id: row.id,
    phone: row.phone,
    step: row.step as OnboardingStep,
    strategy: row.strategy as Strategy | null,
    walletAddress: row.wallet_address,
    encryptedPrivateKey: row.encrypted_private_key,
    totalDeposited: parseFloat(row.total_deposited),
    depositedAt: row.deposited_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function findUserByPhone(phone: string): Promise<User | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return mapRowToUser(result.rows[0]);
  } catch (err) {
    logger.error({ err, phone }, 'Failed to find user by phone');
    throw err;
  }
}

export async function findUserByWalletAddress(walletAddress: string): Promise<User | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return mapRowToUser(result.rows[0]);
  } catch (err) {
    logger.error({ err, walletAddress }, 'Failed to find user by wallet address');
    throw err;
  }
}

export async function getAllUsersWithWallets(): Promise<User[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE wallet_address IS NOT NULL'
    );
    
    return result.rows.map(mapRowToUser);
  } catch (err) {
    logger.error({ err }, 'Failed to get all users with wallets');
    throw err;
  }
}

export async function createUser(phone: string): Promise<User> {
  const id = randomUUID();
  
  try {
    const result = await pool.query(
      `INSERT INTO users (id, phone, phone_number_id, step, strategy, wallet_address, encrypted_private_key, total_deposited, deposited_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, phone, null, 'awaiting_strategy', null, null, null, 0, null]
    );
    
    return mapRowToUser(result.rows[0]);
  } catch (err) {
    logger.error({ err, phone }, 'Failed to create user');
    throw err;
  }
}

export async function setUserStrategy(
  phone: string,
  strategy: Strategy
): Promise<void> {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET strategy = $1, step = $2, updated_at = NOW()
       WHERE phone = $3`,
      [strategy, 'awaiting_confirmation', phone]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`User not found: ${phone}`);
    }
  } catch (err) {
    logger.error({ err, phone, strategy }, 'Failed to set user strategy');
    throw err;
  }
}

export async function setUserWallet(
  phone: string,
  walletAddress: string,
  encryptedPrivateKey: string
): Promise<void> {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET wallet_address = $1, encrypted_private_key = $2, step = $3, updated_at = NOW()
       WHERE phone = $4`,
      [walletAddress, encryptedPrivateKey, 'awaiting_deposit', phone]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`User not found: ${phone}`);
    }
  } catch (err) {
    logger.error({ err, phone, walletAddress }, 'Failed to set user wallet');
    throw err;
  }
}

export async function setUserDeposit(
  phone: string,
  totalDeposited: number,
  depositedAt: Date = new Date()
): Promise<void> {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET total_deposited = $1, deposited_at = $2, step = $3, updated_at = NOW()
       WHERE phone = $4`,
      [totalDeposited, depositedAt, totalDeposited > 0 ? 'active' : 'awaiting_deposit', phone]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`User not found: ${phone}`);
    }
  } catch (err) {
    logger.error({ err, phone, totalDeposited }, 'Failed to set user deposit');
    throw err;
  }
}

export async function incrementUserDeposit(
  userId: string,
  amount: number
): Promise<void> {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET total_deposited = total_deposited + $1, 
           deposited_at = COALESCE(deposited_at, NOW()),
           step = CASE WHEN total_deposited + $1 > 0 THEN 'active' ELSE step END,
           updated_at = NOW()
       WHERE id = $2`,
      [amount, userId]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`User not found: ${userId}`);
    }
  } catch (err) {
    logger.error({ err, userId, amount }, 'Failed to increment user deposit');
    throw err;
  }
}

export async function setUserStep(
  phone: string,
  step: OnboardingStep
): Promise<void> {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET step = $1, updated_at = NOW()
       WHERE phone = $2`,
      [step, phone]
    );
    
    if (result.rowCount === 0) {
      throw new Error(`User not found: ${phone}`);
    }
  } catch (err) {
    logger.error({ err, phone, step }, 'Failed to set user step');
    throw err;
  }
}
