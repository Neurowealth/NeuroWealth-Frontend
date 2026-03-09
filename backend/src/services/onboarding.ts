/**
 *
 * Conversation state machine for new-user onboarding and withdrawal flow.
 *
 * Called from index.ts inside eventBus.onMessage().
 * Returns the text the bot should send back to the user.
 * Sending is done via replyToUser() which calls your existing
 * POST /api/message/send route internally.
 */

import { logger } from "../utils/logger";
import { generateKeypair, encryptSecretKey } from "../utils/stellar";
import {
  findUserByPhone,
  createUser,
  setUserStrategy,
  setUserWallet,
  setUserStep,
  setPendingWithdrawal,
  executeWithdrawal,
  cancelWithdrawal,
  Strategy,
  OnboardingStep,
  User,
} from "../db/userStore";
import { ParsedMessage } from "../types/whatsapp";
import {
  executeVaultWithdrawal,
  validateWithdrawalAmount,
  getStellarExpertLink,
} from "./withdrawal";
import {
  buildPortfolioBalanceReply,
  formatMidOnboardingReply,
  isBalanceIntent,
} from "./portfolio";

// ─── Strategy metadata ────────────────────────────────────────────────────────

const STRATEGIES: Record<
  Strategy,
  { label: string; apy: string; detail: string }
> = {
  conservative: {
    label: "Conservative 3–6%",
    apy: "3–6%",
    detail:
      "📊 *Conservative Strategy*\n" +
      "• 100% Blend lending (stable yield)\n" +
      "• Target APY: 3–6%\n" +
      "• Risk: Low\n" +
      "• Best for capital preservation",
  },
  balanced: {
    label: "Balanced 6–10%",
    apy: "6–10%",
    detail:
      "📊 *Balanced Strategy*\n" +
      "• 60% Blend lending (stable yield)\n" +
      "• 40% Stellar DEX liquidity (bonus fees)\n" +
      "• Target APY: 6–10%\n" +
      "• Risk: Medium",
  },
  growth: {
    label: "Growth 10–15%",
    apy: "10–15%",
    detail:
      "📊 *Growth Strategy*\n" +
      "• Aggressive multi-protocol deployment\n" +
      "• Blend + DEX + emerging Stellar DeFi\n" +
      "• Target APY: 10–15%\n" +
      "• Risk: Higher",
  },
};

// ─── Keyword maps ─────────────────────────────────────────────────────────────

const STRATEGY_MAP: Record<string, Strategy> = {
  conservative: "conservative",
  "conservative 3-6%": "conservative",
  "conservative 3–6%": "conservative",
  balanced: "balanced",
  "balanced 6-10%": "balanced",
  "balanced 6–10%": "balanced",
  growth: "growth",
  "growth 10-15%": "growth",
  "growth 10–15%": "growth",
};

const GREETINGS = new Set(["hi", "hello", "hey", "start", "helo", "yo"]);

const WITHDRAWAL_KEYWORDS = new Set([
  "withdraw",
  "withdrawal",
  "cash out",
  "cashout",
  "take out",
  "take out my money",
  "send me my money",
]);

// ─── Message builders ─────────────────────────────────────────────────────────

const WELCOME =
  "👋 Welcome to *NeuroWealth*! I'm your AI-powered DeFi agent on Stellar.\n\n" +
  "I grow your USDC automatically — 24/7, no dashboards needed.\n\n" +
  "Choose your investment strategy:\n" +
  "• *Conservative* (3–6% APY) — low risk, stablecoin lending\n" +
  "• *Balanced* (6–10% APY) — medium risk, lending + DEX\n" +
  "• *Growth* (10–15% APY) — higher risk, multi-protocol\n\n" +
  "Reply with *Conservative*, *Balanced*, or *Growth* to continue.";

function strategyDetail(strategy: Strategy): string {
  const s = STRATEGIES[strategy];
  return (
    `Great choice! Here's what *${strategy.charAt(0).toUpperCase() + strategy.slice(1)}* means:\n\n` +
    `${s.detail}\n\n` +
    `Ready to deposit? Minimum is *10 USDC*.\n\n` +
    `Reply *YES* to get your deposit address, or choose a different strategy:\n` +
    `• Conservative  • Balanced  • Growth`
  );
}

function depositAddress(walletAddress: string, strategy: Strategy): string {
  const s = STRATEGIES[strategy];
  return (
    `✅ Your NeuroWealth wallet is ready!\n\n` +
    `Send USDC to:\n` +
    `\`${walletAddress}\`\n\n` +
    `⚠️ *Only send USDC on the Stellar network.*\n\n` +
    `Your funds will be deployed into the *${strategy}* strategy (~${s.apy} APY) the moment they arrive. 🚀\n\n` +
    `I'll notify you as soon as your deposit is detected.\n` +
    `Need help? Reply *HELP* anytime.`
  );
}

function withdrawalPrompt(balance: number): string {
  return (
    `💸 *Withdrawal Request*\n\n` +
    `Your current balance: *${balance.toFixed(2)} USDC*\n\n` +
    `How much would you like to withdraw?\n\n` +
    `Reply:\n` +
    `• *ALL* — withdraw everything\n` +
    `• Type an amount (e.g., "200")\n` +
    `• *CANCEL* — cancel withdrawal`
  );
}

function withdrawalConfirm(amount: number, walletAddress: string): string {
  return (
    `Confirm withdrawal of *${amount.toFixed(2)} USDC*?\n\n` +
    `Funds will arrive at:\n` +
    `\`${walletAddress}\`\n\n` +
    `⏱ Takes ~10 seconds on Stellar\n\n` +
    `Reply:\n` +
    `• *CONFIRM* or *YES* ✅\n` +
    `• *CANCEL* or *NO* ❌`
  );
}

function withdrawalProcessing(): string {
  return `⏳ Processing withdrawal...\n\nThis will take about 10 seconds.`;
}

function withdrawalComplete(amount: number, txHash: string): string {
  return (
    `✅ *Withdrawal Complete!*\n\n` +
    `${amount.toFixed(2)} USDC sent to your wallet.\n\n` +
    `Transaction: ${txHash}\n` +
    `View on Stellar Expert: ${getStellarExpertLink(txHash)}\n\n` +
    `Thanks for using NeuroWealth! 💚\n` +
    `Reply *DEPOSIT* anytime to start again.`
  );
}

function withdrawalFailed(error: string): string {
  return (
    `❌ *Withdrawal Failed*\n\n` +
    `Error: ${error}\n\n` +
    `Your funds are safe. Reply *WITHDRAW* to try again or *HELP* for assistance.`
  );
}

function withdrawalCancelled(): string {
  return `Withdrawal cancelled. Your funds remain in your account.\n\nReply *HELP* to see what you can do.`;
}

function fallback(step: OnboardingStep | string): string {
  switch (step) {
    case "awaiting_strategy":
      return (
        "I didn't catch that. 😊 Please choose a strategy:\n\n" +
        "• *Conservative* (3–6% APY)\n" +
        "• *Balanced* (6–10% APY)\n" +
        "• *Growth* (10–15% APY)"
      );
    case "awaiting_confirmation":
      return (
        "Reply *YES* to confirm and get your deposit address.\n\n" +
        "Or choose a different strategy:\n" +
        "• Conservative  • Balanced  • Growth"
      );
    default:
      return (
        "Here's what you can do:\n\n" +
        "• *balance* — view your portfolio\n" +
        "• *deposit* — get your deposit address\n" +
        "• *withdraw* — withdraw funds\n" +
        "• *help* — show this message"
      );
  }
}

const HELP_MSG =
  "🆘 *NeuroWealth Help*\n\n" +
  "• *balance* — view your portfolio\n" +
  "• *deposit* — get your USDC deposit address\n" +
  "• *withdraw [amount]* — withdraw funds\n" +
  "• *strategy* — change your strategy\n" +
  "• *help* — show this message\n\n" +
  "Your funds are always yours — no lock-ups, withdraw anytime.";

// ─── Main handler ─────────────────────────────────────────────────────────────

/**
 * handleOnboarding
 *
 * Pass every incoming ParsedMessage here.
 * Returns the reply string to send back, or null if nothing should be sent.
 *
 * Plugs into index.ts:
 *   eventBus.onMessage(async (msg) => {
 *     const reply = await handleOnboarding(msg, replyCallback);
 *     if (reply) await replyToUser(msg.from, msg.phone_number_id, reply);
 *   });
 */
export async function handleOnboarding(
  msg: ParsedMessage,
  replyCallback?: (to: string, phoneNumberId: string, text: string) => Promise<void>,
): Promise<string | null> {
  const { from, text, phone_number_id } = msg;
  const input = text.body.trim();
  const lower = input.toLowerCase();
  const requestedBalance = isBalanceIntent(lower);

  // ── HELP shortcut — works at any stage ───────────────────────────────────
  if (lower === "help") return HELP_MSG;

  // ── Look up user ──────────────────────────────────────────────────────────
  let user = await findUserByPhone(from);

  // ── Brand new user ────────────────────────────────────────────────────────
  if (!user) {
    logger.info({ from }, "New user — starting onboarding");
    await createUser(from);

    if (requestedBalance) {
      return (
        formatMidOnboardingReply("awaiting_strategy") +
        "\n\n" +
        "Choose: Conservative, Balanced, or Growth."
      );
    }

    return WELCOME;
  }

  // ── Portfolio balance command ─────────────────────────────────────────────
  if (requestedBalance) {
    if (user.step !== "active") {
      return formatMidOnboardingReply(user.step);
    }

    return buildPortfolioBalanceReply(user);
  }

  // ── Route by step ─────────────────────────────────────────────────────────
  return handleStep(user, from, input, lower, phone_number_id, replyCallback);
}

async function handleStep(
  user: User,
  from: string,
  input: string,
  lower: string,
  phoneNumberId: string,
  replyCallback?: (to: string, phoneNumberId: string, text: string) => Promise<void>,
): Promise<string> {
  // If they send a greeting again at any point → re-send welcome
  if (GREETINGS.has(lower) && user.step === "awaiting_strategy") {
    return WELCOME;
  }

  // ── Withdrawal intent detection (only for active users) ──────────────────
  if (user.step === "active" && isWithdrawalIntent(lower)) {
    if (user.balance <= 0) {
      return `You don't have any funds to withdraw. Your balance is 0 USDC.\n\nReply *DEPOSIT* to add funds.`;
    }
    await setUserStep(from, "withdrawal_amount");
    return withdrawalPrompt(user.balance);
  }

  switch (user.step) {
    case "awaiting_strategy": {
      const strategy = STRATEGY_MAP[lower];
      if (!strategy) return fallback("awaiting_strategy");
      await setUserStrategy(from, strategy);
      return strategyDetail(strategy);
    }

    case "awaiting_confirmation": {
      // User changed their mind on strategy
      const strategySwitch = STRATEGY_MAP[lower];
      if (strategySwitch) {
        await setUserStrategy(from, strategySwitch);
        return strategyDetail(strategySwitch);
      }

      if (lower !== "yes" && lower !== "y") {
        return fallback("awaiting_confirmation");
      }

      // Guard — shouldn't happen but be safe
      if (!user.strategy) {
        await setUserStep(from, "awaiting_strategy");
        return WELCOME;
      }

      // Generate wallet
      const { publicKey, secretKey } = generateKeypair();
      const encrypted = encryptSecretKey(secretKey);
      await setUserWallet(from, publicKey, encrypted);

      logger.info(
        { from, walletAddress: publicKey },
        "Stellar wallet created for user",
      );
      return depositAddress(publicKey, user.strategy);
    }

    case "awaiting_deposit": {
      if (lower === "deposit" || lower === "address") {
        if (user.walletAddress && user.strategy) {
          return depositAddress(user.walletAddress, user.strategy);
        }
      }
      return (
        `⏳ Your wallet is ready and waiting for a USDC deposit!\n\n` +
        `Deposit address:\n\`${user.walletAddress}\`\n\n` +
        `Reply *deposit* to see this again, or *help* for assistance.`
      );
    }

    case "withdrawal_amount": {
      if (lower === "cancel") {
        await setUserStep(from, "active");
        return withdrawalCancelled();
      }

      let amount: number;

      if (lower === "all") {
        amount = user.balance;
      } else {
        amount = parseFloat(input);
        const validationError = validateWithdrawalAmount(amount, user.balance);
        if (validationError) {
          return validationError + `\n\nAvailable: ${user.balance.toFixed(2)} USDC`;
        }
      }

      await setPendingWithdrawal(from, amount);
      return withdrawalConfirm(amount, user.walletAddress!);
    }

    case "withdrawal_confirm": {
      if (lower === "cancel" || lower === "no") {
        await cancelWithdrawal(from);
        return withdrawalCancelled();
      }

      if (lower !== "confirm" && lower !== "yes" && lower !== "y") {
        return (
          `Please reply:\n` +
          `• *CONFIRM* or *YES* to proceed\n` +
          `• *CANCEL* or *NO* to cancel`
        );
      }

      if (!user.pendingWithdrawal || !user.walletAddress || !user.encryptedPrivateKey) {
        await setUserStep(from, "active");
        return "Something went wrong. Please try again with *WITHDRAW*.";
      }

      const withdrawalAmount = user.pendingWithdrawal;

      // Execute withdrawal in background
      setImmediate(async () => {
        try {
          const result = await executeVaultWithdrawal(
            user.encryptedPrivateKey!,
            user.walletAddress!,
            withdrawalAmount,
          );

          if (result.success && result.txHash) {
            await executeWithdrawal(from);
            const successMsg = withdrawalComplete(withdrawalAmount, result.txHash);
            if (replyCallback) {
              await replyCallback(from, phoneNumberId, successMsg);
            }
            logger.info(
              { from, amount: withdrawalAmount, txHash: result.txHash },
              "Withdrawal completed successfully",
            );
          } else {
            await cancelWithdrawal(from);
            const errorMsg = withdrawalFailed(result.error || "Unknown error");
            if (replyCallback) {
              await replyCallback(from, phoneNumberId, errorMsg);
            }
            logger.error({ from, error: result.error }, "Withdrawal failed");
          }
        } catch (error: any) {
          await cancelWithdrawal(from);
          const errorMsg = withdrawalFailed(error.message);
          if (replyCallback) {
            await replyCallback(from, phoneNumberId, errorMsg);
          }
          logger.error({ from, error: error.message }, "Withdrawal exception");
        }
      });

      return withdrawalProcessing();
    }

    case "active": {
      return fallback("active");
    }

    default:
      return fallback("unknown");
  }
}

function isWithdrawalIntent(lower: string): boolean {
  // Check exact matches
  if (WITHDRAWAL_KEYWORDS.has(lower)) return true;

  // Check if message contains withdrawal keywords
  for (const keyword of WITHDRAWAL_KEYWORDS) {
    if (lower.includes(keyword)) return true;
  }

  return false;
}
