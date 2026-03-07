/**
 * Deployment Coordinator Service
 * 
 * Coordinates AI agent deployment for deposited funds.
 * Emits deployment requests and handles confirmation/failure events.
 */

import { logger } from '../utils/logger';
import { eventBus } from './eventBus';
import { DepositRecordedEvent, DeploymentConfirmedEvent, DeploymentFailedEvent } from '../types/deposit';
import { depositRecorder } from './depositRecorder';

// ─── Deployment Coordinator Service ───────────────────────────────────────────

class DeploymentCoordinatorService {
  /**
   * Start listening for deposit and deployment events
   */
  start(): void {
    logger.info('Starting deployment coordinator service');

    // Listen for deposit recorded events
    eventBus.onDepositRecorded(async (event) => {
      try {
        await this.handleDepositRecorded(event);
      } catch (err) {
        logger.error({ err, event }, 'Failed to handle deposit recorded event');
      }
    });

    // Listen for deployment confirmed events
    eventBus.onDeploymentConfirmed(async (event) => {
      try {
        await this.handleDeploymentConfirmed(event);
      } catch (err) {
        logger.error({ err, event }, 'Failed to handle deployment confirmed event');
      }
    });

    // Listen for deployment failed events
    eventBus.onDeploymentFailed(async (event) => {
      try {
        await this.handleDeploymentFailed(event);
      } catch (err) {
        logger.error({ err, event }, 'Failed to handle deployment failed event');
      }
    });

    logger.info('Deployment coordinator service started');
  }

  /**
   * Handle deposit recorded event - emit deployment request
   */
  async handleDepositRecorded(event: DepositRecordedEvent): Promise<void> {
    const { depositId, userId, amount, strategy, txHash, timestamp } = event;

    logger.info(
      { depositId, userId, amount, strategy },
      'Emitting deployment request for recorded deposit'
    );

    // Emit deployment requested event
    eventBus.emitDeploymentRequested({
      depositId,
      userId,
      amount,
      strategy,
      txHash,
      timestamp,
    });
  }

  /**
   * Handle deployment confirmed event - update deposit status
   */
  async handleDeploymentConfirmed(event: DeploymentConfirmedEvent): Promise<void> {
    const { txHash, deployedAt } = event;

    logger.info({ txHash, deployedAt }, 'Handling deployment confirmation');

    // Update deposit status to 'deployed'
    await depositRecorder.updateDeploymentStatus(txHash, 'deployed');
  }

  /**
   * Handle deployment failed event - update deposit status
   */
  async handleDeploymentFailed(event: DeploymentFailedEvent): Promise<void> {
    const { txHash, error, failedAt } = event;

    logger.error({ txHash, error, failedAt }, 'Handling deployment failure');

    // Update deposit status to 'failed'
    await depositRecorder.updateDeploymentStatus(txHash, 'failed');
  }
}

// ─── Singleton instance ───────────────────────────────────────────────────────

export const deploymentCoordinator = new DeploymentCoordinatorService();
