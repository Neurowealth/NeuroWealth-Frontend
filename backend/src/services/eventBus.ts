import { EventEmitter } from 'events';
import { ParsedMessage } from '../types/whatsapp';
import { logger } from '../utils/logger';
import {
  DepositDetectedEvent,
  DepositRecordedEvent,
  DeploymentRequestedEvent,
  DeploymentConfirmedEvent,
  DeploymentFailedEvent,
} from '../types/deposit';

export const EVENTS = {
  MESSAGE_RECEIVED: 'message:received',
  MESSAGE_PARSE_ERROR: 'message:parse_error',
  DEPOSIT_DETECTED: 'deposit:detected',
  DEPOSIT_RECORDED: 'deposit:recorded',
  DEPLOYMENT_REQUESTED: 'deployment:requested',
  DEPLOYMENT_CONFIRMED: 'deployment:confirmed',
  DEPLOYMENT_FAILED: 'deployment:failed',
} as const;

class MessageEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  emitMessage(message: ParsedMessage): void {
    logger.info(
      { from: message.from, message_id: message.message_id, type: message.type },
      'Emitting parsed WhatsApp message'
    );
    this.emit(EVENTS.MESSAGE_RECEIVED, message);
  }

  emitParseError(error: Error, rawPayload: unknown): void {
    logger.error({ error: error.message, rawPayload }, 'Message parse error');
    this.emit(EVENTS.MESSAGE_PARSE_ERROR, { error, rawPayload });
  }

  onMessage(handler: (message: ParsedMessage) => void): void {
    this.on(EVENTS.MESSAGE_RECEIVED, handler);
  }

  onParseError(handler: (data: { error: Error; rawPayload: unknown }) => void): void {
    this.on(EVENTS.MESSAGE_PARSE_ERROR, handler);
  }

  // ── Deposit event emitters ────────────────────────────────────────────────

  emitDepositDetected(event: DepositDetectedEvent): void {
    logger.info(
      { userId: event.userId, amount: event.amount, txHash: event.txHash },
      'Emitting deposit detected event'
    );
    this.emit(EVENTS.DEPOSIT_DETECTED, event);
  }

  emitDepositRecorded(event: DepositRecordedEvent): void {
    logger.info(
      { depositId: event.depositId, userId: event.userId, amount: event.amount },
      'Emitting deposit recorded event'
    );
    this.emit(EVENTS.DEPOSIT_RECORDED, event);
  }

  emitDeploymentRequested(event: DeploymentRequestedEvent): void {
    logger.info(
      { depositId: event.depositId, userId: event.userId, strategy: event.strategy },
      'Emitting deployment requested event'
    );
    this.emit(EVENTS.DEPLOYMENT_REQUESTED, event);
  }

  emitDeploymentConfirmed(event: DeploymentConfirmedEvent): void {
    logger.info(
      { txHash: event.txHash, deployedAt: event.deployedAt },
      'Emitting deployment confirmed event'
    );
    this.emit(EVENTS.DEPLOYMENT_CONFIRMED, event);
  }

  emitDeploymentFailed(event: DeploymentFailedEvent): void {
    logger.error(
      { txHash: event.txHash, error: event.error },
      'Emitting deployment failed event'
    );
    this.emit(EVENTS.DEPLOYMENT_FAILED, event);
  }

  // ── Deposit event listeners ───────────────────────────────────────────────

  onDepositDetected(handler: (event: DepositDetectedEvent) => void): void {
    this.on(EVENTS.DEPOSIT_DETECTED, handler);
  }

  onDepositRecorded(handler: (event: DepositRecordedEvent) => void): void {
    this.on(EVENTS.DEPOSIT_RECORDED, handler);
  }

  onDeploymentRequested(handler: (event: DeploymentRequestedEvent) => void): void {
    this.on(EVENTS.DEPLOYMENT_REQUESTED, handler);
  }

  onDeploymentConfirmed(handler: (event: DeploymentConfirmedEvent) => void): void {
    this.on(EVENTS.DEPLOYMENT_CONFIRMED, handler);
  }

  onDeploymentFailed(handler: (event: DeploymentFailedEvent) => void): void {
    this.on(EVENTS.DEPLOYMENT_FAILED, handler);
  }
}

export const eventBus = new MessageEventBus();
