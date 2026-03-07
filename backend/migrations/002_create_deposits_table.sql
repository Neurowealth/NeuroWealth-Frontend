-- Migration: Create deposits table
-- Description: Track USDC deposits with deployment status and transaction hash for idempotency

CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  amount NUMERIC(20, 7) NOT NULL CHECK (amount > 0),
  tx_hash TEXT NOT NULL UNIQUE,
  deployment_status TEXT NOT NULL CHECK (deployment_status IN ('deploying', 'deployed', 'failed')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_tx_hash ON deposits(tx_hash);
CREATE INDEX idx_deposits_deployment_status ON deposits(deployment_status);
CREATE INDEX idx_deposits_detected_at ON deposits(detected_at DESC);

-- Comments for documentation
COMMENT ON TABLE deposits IS 'USDC deposit transactions with deployment tracking';
COMMENT ON COLUMN deposits.user_id IS 'Reference to user who made the deposit';
COMMENT ON COLUMN deposits.wallet_address IS 'Stellar wallet address that received the deposit';
COMMENT ON COLUMN deposits.amount IS 'Deposit amount in USDC (7 decimal precision)';
COMMENT ON COLUMN deposits.tx_hash IS 'Stellar transaction hash (unique for idempotency)';
COMMENT ON COLUMN deposits.deployment_status IS 'Current deployment status: deploying, deployed, or failed';
COMMENT ON COLUMN deposits.detected_at IS 'Timestamp when deposit was detected by monitor';
COMMENT ON COLUMN deposits.deployed_at IS 'Timestamp when funds were successfully deployed';
