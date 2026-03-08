import stateMachine from './stateMachine';
import { logger } from '../utils/logger';

interface WhatsAppMessage {
  from: string;
  text: string;
  timestamp: number;
}

const responses: Record<string, string> = {
  onboarding_strategy: '👋 Welcome to NeuroWealth!\n\nChoose your investment strategy:\n• conservative - Low risk, 3-6% APY\n• balanced - Medium risk, 6-10% APY\n• growth - Higher risk, 10-15% APY',
  onboarding_confirm: 'Great choice! Ready to start?\nReply "yes" to confirm or "no" to choose again.',
  awaiting_deposit: '✅ Account created! Send USDC to your wallet to start earning.',
  awaiting_deposit_reminder: '⏳ Waiting for your deposit. Send USDC to start earning.',
  balance: '💰 Fetching your balance...',
  withdrawal_amount: '💸 How much USDC would you like to withdraw? (Enter amount)',
  withdrawal_confirm: 'Confirm withdrawal?\nReply "confirm" or "cancel"',
  withdrawal_process: '✅ Processing withdrawal...',
  withdrawal_cancelled: '❌ Withdrawal cancelled.',
  strategy_select: '🔄 Choose new strategy:\n• conservative\n• balanced\n• growth',
  strategy_confirm: 'Switch strategy?\nReply "confirm" or "cancel"',
  strategy_switched: '✅ Strategy updated!',
  strategy_cancelled: '❌ Strategy change cancelled.',
  invalid_strategy: '❌ Invalid strategy. Choose: conservative, balanced, or growth',
  invalid_amount: '❌ Invalid amount. Enter a number.',
  invalid_confirm: '❌ Reply "yes" or "no"',
  unknown_command: '❓ Unknown command. Try: balance, withdraw, strategy',
};

export async function handleIncomingMessage(message: WhatsAppMessage): Promise<string> {
  try {
    const action = await stateMachine.handleMessage(message.from, message.text);
    return responses[action] || 'Error processing message';
  } catch (error) {
    logger.error({ error, message }, 'Error handling message');
    return 'Sorry, something went wrong. Please try again.';
  }
}

export async function notifyDepositDetected(userId: string): Promise<void> {
  await stateMachine.onDepositDetected(userId);
}
