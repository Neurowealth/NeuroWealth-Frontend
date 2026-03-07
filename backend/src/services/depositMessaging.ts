/**
 * Deposit Messaging Service
 * 
 * Sends WhatsApp messages for deposit lifecycle events.
 * Handles deposit received, deployment confirmed, and deployment failed notifications.
 */

import { logger } from '../utils/logger';
import { eventBus } from './eventBus';
import { DepositRecordedEvent, DeploymentConfirmedEvent, DeploymentFailedEvent } from '../types/deposit';
import { getDepositByTxHash } from '../db/depositRepository';
import pool from '../db/pool';

// ─── Strategy APY mapping (from portfolio service) ───────────────────────────

const STRATEGY_APY: Record<string, number> = {
  conservative: 4.8,
  balanced: 8.2,
  growth: 12.6,
};

const STRATEGY_LABEL: Record<string, string> = {
  conservative: 'Conservative',
  balanced: 'Balanced',
  growth: 'Growth',
};

// ─── Deposit Messaging Service ────────────────────────────────────────────────

class DepositMessagingService {
  /**
   * Start listening for deposit lifecycle events
   */
  start(): void {
    logger.info('Starting deposit messaging service');

    // Listen for deposit recorded events
    eventBus.onDepositRecorded(async (event) => {
      try {
        await this.sendDepositReceived(event);
      } catch (err) {
        logger.error({ err, event }, 'Failed to send deposit received message');
      }
    });

    // Listen for deployment confirmed events
    eventBus.onDeploymentConfirmed(async (event) => {
      try {
        await this.sendDeploymentConfirmed(event);
      } catch (err) {
        logger.error({ err, event }, 'Failed to send deployment confirmed message');
      }
    });

    // Listen for deployment failed events
    eventBus.onDeploymentFailed(async (event) => {
      try {
        await this.sendDeploymentFailed(event);
      } catch (err) {
        logger.error({ err, event }, 'Failed to send deployment failed message');
      }
    });

    logger.info('Deposit messaging service started');
  }

  /**
   * Send deposit received confirmation message
   */
  async sendDepositReceived(event: DepositRecordedEvent): Promise<void> {
    const { userId, amount, strategy } = event;

    try {
      // Get user phone number
      const result = await pool.query(
        'SELECT phone, phone_number_id FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        logger.error({ userId }, 'User not found for deposit message');
        return;
      }

      const { phone, phone_number_id } = result.rows[0];

      if (!phone) {
        logger.error({ userId }, 'User has no phone number');
        return;
      }

      // Format message
      const strategyLabel = STRATEGY_LABEL[strategy] || 'Balanced';
      const amountFormatted = parseFloat(amount).toFixed(2);

      const message = 
        `💰 Deposit Received!\n\n` +
        `Amount: ${amountFormatted} USDC\n` +
        `Status: Deploying to ${strategyLabel} strategy...\n\n` +
        `Your funds will start earning in ~30 seconds.`;

      // Send message
      await this.sendWhatsAppMessage(phone, phone_number_id, message);

      logger.info({ userId, phone, amount }, 'Deposit received message sent');
    } catch (err) {
      logger.error({ err, userId }, 'Error sending deposit received message');
      // Don't throw - messaging failures shouldn't block deposit processing
    }
  }

  /**
   * Send deployment confirmed message
   */
  async sendDeploymentConfirmed(event: DeploymentConfirmedEvent): Promise<void> {
    const { txHash } = event;

    try {
      // Get deposit record
      const deposit = await getDepositByTxHash(txHash);
      if (!deposit) {
        logger.error({ txHash }, 'Deposit not found for deployment confirmed message');
        return;
      }

      // Get user info
      const result = await pool.query(
        'SELECT phone, phone_number_id, strategy FROM users WHERE id = $1',
        [deposit.userId]
      );

      if (result.rows.length === 0) {
        logger.error({ userId: deposit.userId }, 'User not found for deployment confirmed message');
        return;
      }

      const { phone, phone_number_id, strategy } = result.rows[0];

      if (!phone) {
        logger.error({ userId: deposit.userId }, 'User has no phone number');
        return;
      }

      // Format message
      const strategyLabel = STRATEGY_LABEL[strategy] || 'Balanced';
      const apy = STRATEGY_APY[strategy] || 8.2;
      const amountFormatted = parseFloat(deposit.amount).toFixed(2);

      const message =
        `✅ Funds Deployed!\n\n` +
        `${amountFormatted} USDC → ${strategyLabel} Strategy\n` +
        `Current APY: ${apy.toFixed(1)}%\n\n` +
        `Your money is working. I'll rebalance automatically if better opportunities appear.\n\n` +
        `Reply BALANCE to check your portfolio anytime.`;

      // Send message
      await this.sendWhatsAppMessage(phone, phone_number_id, message);

      logger.info({ userId: deposit.userId, phone, txHash }, 'Deployment confirmed message sent');
    } catch (err) {
      logger.error({ err, txHash }, 'Error sending deployment confirmed message');
      // Don't throw - messaging failures shouldn't block deployment processing
    }
  }

  /**
   * Send deployment failed message
   */
  async sendDeploymentFailed(event: DeploymentFailedEvent): Promise<void> {
    const { txHash, error } = event;

    try {
      // Get deposit record
      const deposit = await getDepositByTxHash(txHash);
      if (!deposit) {
        logger.error({ txHash }, 'Deposit not found for deployment failed message');
        return;
      }

      // Get user info
      const result = await pool.query(
        'SELECT phone, phone_number_id FROM users WHERE id = $1',
        [deposit.userId]
      );

      if (result.rows.length === 0) {
        logger.error({ userId: deposit.userId }, 'User not found for deployment failed message');
        return;
      }

      const { phone, phone_number_id } = result.rows[0];

      if (!phone) {
        logger.error({ userId: deposit.userId }, 'User has no phone number');
        return;
      }

      // Format message
      const amountFormatted = parseFloat(deposit.amount).toFixed(2);

      const message =
        `⚠️ Deployment Issue\n\n` +
        `We received your ${amountFormatted} USDC deposit but encountered an issue deploying it to your strategy.\n\n` +
        `Your funds are safe in your wallet. Our team has been notified and will resolve this shortly.\n\n` +
        `For immediate assistance, contact support@neurowealth.ai`;

      // Send message
      await this.sendWhatsAppMessage(phone, phone_number_id, message);

      logger.info({ userId: deposit.userId, phone, txHash }, 'Deployment failed message sent');
    } catch (err) {
      logger.error({ err, txHash }, 'Error sending deployment failed message');
      // Don't throw - messaging failures shouldn't block error handling
    }
  }

  /**
   * Send WhatsApp message via Meta Cloud API
   */
  private async sendWhatsAppMessage(
    to: string,
    phoneNumberId: string | null,
    text: string
  ): Promise<void> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!token || !phoneNumberId) {
      // Dev mode - just log the message
      logger.info({ to, text }, '📤 [DEV] Bot reply (no credentials set)');
      return;
    }

    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        logger.error({ to, status: res.status, err }, 'Failed to send WhatsApp message');
        throw new Error(`WhatsApp API error: ${res.status}`);
      }

      logger.info({ to }, 'WhatsApp message sent successfully');
    } catch (err) {
      logger.error({ err, to }, 'Error calling WhatsApp API');
      throw err;
    }
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────

export const depositMessaging = new DepositMessagingService();
