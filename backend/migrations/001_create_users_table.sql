-- Migration: Create users table
-- Description: Migrate from in-memory user store to PostgreSQL with all required fields

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  phone_number_id TEXT,
  step TEXT NOT NULL CHECK (step IN ('awaiting_strategy', 'awaiting_confirmation', 'awaiting_deposit', 'active')),
  strategy TEXT CHECK (strategy IN ('conservative', 'balanced', 'growth')),
  wallet_address TEXT UNIQUE,
  encrypted_private_key TEXT,
  total_deposited NUMERIC(20, 7) NOT NULL DEFAULT 0,
  deposited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_step ON users(step);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with onboarding state and wallet information';
COMMENT ON COLUMN users.phone IS 'User phone number (WhatsApp identifier)';
COMMENT ON COLUMN users.phone_number_id IS 'WhatsApp Business API phone number ID for messaging';
COMMENT ON COLUMN users.step IS 'Current onboarding step';
COMMENT ON COLUMN users.strategy IS 'Selected investment strategy';
COMMENT ON COLUMN users.wallet_address IS 'Stellar wallet public key';
COMMENT ON COLUMN users.encrypted_private_key IS 'AES-256-GCM encrypted Stellar private key';
COMMENT ON COLUMN users.total_deposited IS 'Total USDC deposited by user';
COMMENT ON COLUMN users.deposited_at IS 'Timestamp of first deposit';
