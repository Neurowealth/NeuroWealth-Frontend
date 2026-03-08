import { createClient } from 'redis';
import { logger } from '../utils/logger';

export enum ConversationState {
  IDLE = 'IDLE',
  ONBOARDING_STRATEGY = 'ONBOARDING_STRATEGY',
  ONBOARDING_CONFIRM = 'ONBOARDING_CONFIRM',
  AWAITING_DEPOSIT = 'AWAITING_DEPOSIT',
  ACTIVE = 'ACTIVE',
  WITHDRAWAL_AMOUNT = 'WITHDRAWAL_AMOUNT',
  WITHDRAWAL_CONFIRM = 'WITHDRAWAL_CONFIRM',
  STRATEGY_SELECT = 'STRATEGY_SELECT',
  STRATEGY_CONFIRM = 'STRATEGY_CONFIRM',
}

const STATE_TTL = 86400; // 24 hours

class StateMachine {
  private redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

  async connect() {
    await this.redis.connect();
  }

  async getState(userId: string): Promise<ConversationState> {
    const state = await this.redis.get(`state:${userId}`);
    return (state as ConversationState) || ConversationState.IDLE;
  }

  async transition(userId: string, newState: ConversationState): Promise<void> {
    await this.redis.setEx(`state:${userId}`, STATE_TTL, newState);
    logger.info(`State transition: ${userId} → ${newState}`);
  }

  async resetTTL(userId: string): Promise<void> {
    const state = await this.getState(userId);
    await this.redis.expire(`state:${userId}`, STATE_TTL);
  }

  async handleMessage(userId: string, message: string): Promise<string> {
    await this.resetTTL(userId);
    const state = await this.getState(userId);
    const msg = message.toLowerCase().trim();

    switch (state) {
      case ConversationState.IDLE:
        return this.handleIdle(userId, msg);
      case ConversationState.ONBOARDING_STRATEGY:
        return this.handleOnboardingStrategy(userId, msg);
      case ConversationState.ONBOARDING_CONFIRM:
        return this.handleOnboardingConfirm(userId, msg);
      case ConversationState.AWAITING_DEPOSIT:
        return this.handleAwaitingDeposit(userId, msg);
      case ConversationState.ACTIVE:
        return this.handleActive(userId, msg);
      case ConversationState.WITHDRAWAL_AMOUNT:
        return this.handleWithdrawalAmount(userId, msg);
      case ConversationState.WITHDRAWAL_CONFIRM:
        return this.handleWithdrawalConfirm(userId, msg);
      case ConversationState.STRATEGY_SELECT:
        return this.handleStrategySelect(userId, msg);
      case ConversationState.STRATEGY_CONFIRM:
        return this.handleStrategyConfirm(userId, msg);
      default:
        return 'Invalid state';
    }
  }

  private async handleIdle(userId: string, msg: string): Promise<string> {
    if (['hi', 'hello', 'start'].includes(msg)) {
      await this.transition(userId, ConversationState.ONBOARDING_STRATEGY);
      return 'onboarding_strategy';
    }
    if (msg === 'balance') return 'balance';
    if (msg === 'withdraw') {
      await this.transition(userId, ConversationState.WITHDRAWAL_AMOUNT);
      return 'withdrawal_amount';
    }
    if (msg === 'strategy') {
      await this.transition(userId, ConversationState.STRATEGY_SELECT);
      return 'strategy_select';
    }
    return 'unknown_command';
  }

  private async handleOnboardingStrategy(userId: string, msg: string): Promise<string> {
    if (['conservative', 'balanced', 'growth'].includes(msg)) {
      await this.redis.set(`strategy:${userId}`, msg);
      await this.transition(userId, ConversationState.ONBOARDING_CONFIRM);
      return 'onboarding_confirm';
    }
    return 'invalid_strategy';
  }

  private async handleOnboardingConfirm(userId: string, msg: string): Promise<string> {
    if (msg === 'yes') {
      await this.transition(userId, ConversationState.AWAITING_DEPOSIT);
      return 'awaiting_deposit';
    }
    if (msg === 'no') {
      await this.transition(userId, ConversationState.ONBOARDING_STRATEGY);
      return 'onboarding_strategy';
    }
    return 'invalid_confirm';
  }

  private async handleAwaitingDeposit(userId: string, msg: string): Promise<string> {
    return 'awaiting_deposit_reminder';
  }

  private async handleActive(userId: string, msg: string): Promise<string> {
    if (msg === 'balance') return 'balance';
    if (msg === 'withdraw') {
      await this.transition(userId, ConversationState.WITHDRAWAL_AMOUNT);
      return 'withdrawal_amount';
    }
    if (msg === 'strategy') {
      await this.transition(userId, ConversationState.STRATEGY_SELECT);
      return 'strategy_select';
    }
    return 'unknown_command';
  }

  private async handleWithdrawalAmount(userId: string, msg: string): Promise<string> {
    const amount = parseFloat(msg);
    if (!isNaN(amount) && amount > 0) {
      await this.redis.set(`withdrawal:${userId}`, amount.toString());
      await this.transition(userId, ConversationState.WITHDRAWAL_CONFIRM);
      return 'withdrawal_confirm';
    }
    return 'invalid_amount';
  }

  private async handleWithdrawalConfirm(userId: string, msg: string): Promise<string> {
    if (msg === 'confirm') {
      await this.transition(userId, ConversationState.ACTIVE);
      return 'withdrawal_process';
    }
    if (msg === 'cancel') {
      await this.transition(userId, ConversationState.ACTIVE);
      return 'withdrawal_cancelled';
    }
    return 'invalid_confirm';
  }

  private async handleStrategySelect(userId: string, msg: string): Promise<string> {
    if (['conservative', 'balanced', 'growth'].includes(msg)) {
      await this.redis.set(`new_strategy:${userId}`, msg);
      await this.transition(userId, ConversationState.STRATEGY_CONFIRM);
      return 'strategy_confirm';
    }
    return 'invalid_strategy';
  }

  private async handleStrategyConfirm(userId: string, msg: string): Promise<string> {
    if (msg === 'confirm') {
      await this.transition(userId, ConversationState.ACTIVE);
      return 'strategy_switched';
    }
    if (msg === 'cancel') {
      await this.transition(userId, ConversationState.ACTIVE);
      return 'strategy_cancelled';
    }
    return 'invalid_confirm';
  }

  async onDepositDetected(userId: string): Promise<void> {
    const state = await this.getState(userId);
    if (state === ConversationState.AWAITING_DEPOSIT) {
      await this.transition(userId, ConversationState.ACTIVE);
    }
  }
}

export default new StateMachine();
