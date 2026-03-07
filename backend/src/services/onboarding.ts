/**

 *
 * Conversation state machine for new-user onboarding.
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
  Strategy,
  OnboardingStep,
  User,
} from "../db/userStore";
import { ParsedMessage, BotReply } from "../types/whatsapp";
import {
  buildPortfolioBalanceReply,
  formatMidOnboardingReply,
  isBalanceIntent,
} from "./portfolio";
import { handleStrategySwitch, isSwitchStrategyIntent } from "./strategy";

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
 *     const reply = await handleOnboarding(msg);
 *     if (reply) await replyToUser(msg.from, msg.phone_number_id, reply);
 *   });
 */
export async function handleOnboarding(
  msg: ParsedMessage,
): Promise<BotReply | null> {
  const { from, text } = msg;
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
  return handleStep(user, from, input, lower, msg);
}

async function handleStep(
  user: User,
  from: string,
  input: string,
  lower: string,
  msg: ParsedMessage,
): Promise<BotReply> {
  // If they send a greeting again at any point → re-send welcome
  if (GREETINGS.has(lower) && user.step === "awaiting_strategy") {
    return WELCOME;
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

    case "active": {
      // Strategy switch intent OR ongoing switch confirmation
      if (isSwitchStrategyIntent(lower) || user.pendingStrategy || msg.buttonId) {
        const reply = await handleStrategySwitch(msg, user);
        if (reply !== null) return reply;
      }
      return fallback("active");
    }

    default:
      return fallback("unknown");
  }
}
