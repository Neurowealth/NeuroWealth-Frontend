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
import { ParsedMessage } from "../types/whatsapp";
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

/** Triggers that should show the help menu */
const HELP_TRIGGERS = new Set(["help", "?", "what can you do", "commands", "menu"]);

// ─── FAQ definitions ──────────────────────────────────────────────────────────

interface FaqEntry {
  patterns: RegExp[];
  answer: string;
}

const FAQ: FaqEntry[] = [
  {
    patterns: [
      /\bis\s+(my\s+)?money\s+safe\b/i,
      /\bsafe\b.*\bfunds?\b/i,
      /\bfunds?\b.*\bsafe\b/i,
      /\bsecure\b/i,
      /\bsecurity\b/i,
      /\blose\s+my\s+(money|funds|usdc)\b/i,
    ],
    answer:
      "🔒 *Is my money safe?*\n\n" +
      "Your USDC is held in non-custodial Stellar smart contracts — " +
      "NeuroWealth never holds your funds directly.\n\n" +
      "• Your wallet keys are encrypted with AES-256-GCM\n" +
      "• Funds can only move with on-chain authorization\n" +
      "• No lock-ups — withdraw anytime\n\n" +
      "As with all DeFi, smart-contract risk exists. We only deploy to " +
      "audited protocols on Stellar.",
  },
  {
    patterns: [
      /\bhow\s+do\s+i\s+withdraw\b/i,
      /\bwithdraw\b.*\bhow\b/i,
      /\bget\s+my\s+(money|funds|usdc)\s+out\b/i,
      /\bcash\s+out\b/i,
      /\bpull\s+out\b/i,
    ],
    answer:
      "💸 *How do I withdraw?*\n\n" +
      "Reply *WITHDRAW [amount]* — for example:\n" +
      "  _WITHDRAW 500_\n\n" +
      "• Minimum withdrawal: 10 USDC\n" +
      "• Funds arrive in your external wallet within minutes\n" +
      "• No fees charged by NeuroWealth (Stellar network fee ~0.00001 XLM)\n\n" +
      "No lock-ups — withdraw any time, any amount.",
  },
  {
    patterns: [
      /\bminimum\b.*\bdeposit\b/i,
      /\bdeposit\b.*\bminimum\b/i,
      /\bhow\s+much\s+(do\s+i\s+need|to\s+start|minimum)\b/i,
      /\bminimum\s+investment\b/i,
      /\bsmallest\s+deposit\b/i,
    ],
    answer:
      "💵 *Minimum deposit*\n\n" +
      "The minimum deposit is *10 USDC*.\n\n" +
      "There's no maximum — deposit as much as you like.\n" +
      "Reply *DEPOSIT* to get your wallet address.",
  },
  {
    patterns: [
      /\bfee[s]?\b/i,
      /\bhow\s+much\s+do\s+you\s+charge\b/i,
      /\bcharge[s]?\b/i,
      /\bcost[s]?\b/i,
      /\bcommission\b/i,
    ],
    answer:
      "💰 *Fees*\n\n" +
      "NeuroWealth charges a *10% performance fee* on yield earned — " +
      "you only pay when you profit.\n\n" +
      "• No deposit fees\n" +
      "• No withdrawal fees\n" +
      "• No monthly subscription\n" +
      "• Tiny Stellar network fee (~0.00001 XLM) on transactions",
  },
  {
    patterns: [
      /\bwhat\s+is\s+(usdc|stablecoin)\b/i,
      /\bwhat\s+network\b/i,
      /\bstellar\b.*\bwhat\b/i,
      /\bwhat\s+blockchain\b/i,
      /\bwhy\s+stellar\b/i,
    ],
    answer:
      "🌐 *About Stellar & USDC*\n\n" +
      "*USDC* is a USD-pegged stablecoin — 1 USDC = $1.\n\n" +
      "*Stellar* is a fast, low-cost blockchain used for payments and DeFi. " +
      "Transactions settle in ~5 seconds with fees under a cent.\n\n" +
      "⚠️ Only send *USDC on the Stellar network* to your NeuroWealth wallet. " +
      "Sending other tokens or USDC on Ethereum will result in lost funds.",
  },
  {
    patterns: [
      /\bchange\s+(my\s+)?strategy\b/i,
      /\bswitch\s+(my\s+)?strategy\b/i,
      /\bupdate\s+(my\s+)?strategy\b/i,
      /\bdifferent\s+strategy\b/i,
    ],
    answer:
      "🔄 *Changing your strategy*\n\n" +
      "Reply with the strategy name at any time:\n" +
      "• *Conservative* — 3–6% APY, low risk\n" +
      "• *Balanced* — 6–10% APY, medium risk\n" +
      "• *Growth* — 10–15% APY, higher risk\n\n" +
      "Your funds will be rebalanced automatically at the next rebalance window.",
  },
  {
    patterns: [
      /\bhow\s+(do\s+)?i\s+(deposit|send\s+usdc|fund)\b/i,
      /\bdeposit\s+address\b/i,
      /\bwhere\s+do\s+i\s+send\b/i,
      /\bwallet\s+address\b/i,
    ],
    answer:
      "📥 *How to deposit*\n\n" +
      "Reply *DEPOSIT* to get your personal USDC wallet address.\n\n" +
      "Then send USDC (Stellar network) to that address from any exchange " +
      "or wallet (Coinbase, Lobstr, XUMM, etc.).\n\n" +
      "Your funds are deployed automatically the moment they arrive. 🚀",
  },
  {
    patterns: [
      /\bwhen\s+(will\s+i\s+)?(get\s+)?paid\b/i,
      /\bwhen\s+do\s+i\s+earn\b/i,
      /\bhow\s+often\b.*\byield\b/i,
      /\byield\b.*\bhow\s+often\b/i,
      /\bcompound\b/i,
      /\brebalance\b/i,
    ],
    answer:
      "⏱ *When do I earn yield?*\n\n" +
      "Yield accrues continuously and is compounded automatically.\n\n" +
      "• Rebalance checks run *every hour*\n" +
      "• Your portfolio value updates in real-time\n" +
      "• Reply *BALANCE* anytime to see your current earnings\n\n" +
      "Yield compounds into your position — no manual claiming needed.",
  },
];

// ─── Message builders ─────────────────────────────────────────────────────────

const WELCOME =
  "👋 Welcome to *NeuroWealth*! I'm your AI-powered DeFi agent on Stellar.\n\n" +
  "I grow your USDC automatically — 24/7, no dashboards needed.\n\n" +
  "Choose your investment strategy:\n" +
  "• *Conservative* (3–6% APY) — low risk, stablecoin lending\n" +
  "• *Balanced* (6–10% APY) — medium risk, lending + DEX\n" +
  "• *Growth* (10–15% APY) — higher risk, multi-protocol\n\n" +
  "Reply with *Conservative*, *Balanced*, or *Growth* to continue.";

const HELP_MSG =
  "🤖 NeuroWealth Commands\n" +
  "━━━━━━━━━━━━━━━━━━━━\n\n" +
  " BALANCE — Check your portfolio\n" +
  " DEPOSIT — Get your deposit address\n" +
  " WITHDRAW — Withdraw your funds\n" +
  " STRATEGY — Change investment strategy\n" +
  " HISTORY — View recent transactions\n" +
  " HELP — Show this menu\n\n" +
  "━━━━━━━━━━━━━━━━━━━━\n" +
  "Questions? Just ask in plain English!\n\n" +
  "Support: support@neurowealth.io";

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

/**
 * Try to match the user's free-text input against the FAQ bank.
 * Returns the FAQ answer string, or null if nothing matched.
 */
function matchFaq(input: string): string | null {
  for (const entry of FAQ) {
    for (const pattern of entry.patterns) {
      if (pattern.test(input)) {
        return entry.answer;
      }
    }
  }
  return null;
}

function fallback(step: OnboardingStep | string): string {
  switch (step) {
    case "awaiting_strategy":
      return (
        "I didn't catch that. 😊 Please choose a strategy:\n\n" +
        "• *Conservative* (3–6% APY)\n" +
        "• *Balanced* (6–10% APY)\n" +
        "• *Growth* (10–15% APY)\n\n" +
        "Or reply *HELP* to see all available commands."
      );
    case "awaiting_confirmation":
      return (
        "Reply *YES* to confirm and get your deposit address.\n\n" +
        "Or choose a different strategy:\n" +
        "• Conservative  • Balanced  • Growth\n\n" +
        "Or reply *HELP* to see all available commands."
      );
    default:
      return (
        "🤔 I didn't understand that.\n\n" +
        "Here's what you can do:\n" +
        "• *BALANCE* — view your portfolio\n" +
        "• *DEPOSIT* — get your deposit address\n" +
        "• *WITHDRAW [amount]* — withdraw funds\n" +
        "• *STRATEGY* — change your strategy\n" +
        "• *HELP* — show all commands\n\n" +
        "You can also ask me a question in plain English!"
      );
  }
}

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
): Promise<string | null> {
  const { from, text } = msg;
  const input = text.body.trim();
  const lower = input.toLowerCase();
  const requestedBalance = isBalanceIntent(lower);

  // ── HELP shortcut — works at any stage ───────────────────────────────────
  if (HELP_TRIGGERS.has(lower)) return HELP_MSG;

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

    // Try FAQ even for brand-new users
    const faqAnswer = matchFaq(input);
    if (faqAnswer) return faqAnswer + "\n\n" + "Reply *HI* to get started!";

    return WELCOME;
  }

  // ── Portfolio balance command ─────────────────────────────────────────────
  if (requestedBalance) {
    if (user.step !== "active") {
      return formatMidOnboardingReply(user.step);
    }

    return buildPortfolioBalanceReply(user);
  }

  // ── FAQ — plain-English questions, works at any stage ────────────────────
  const faqAnswer = matchFaq(input);
  if (faqAnswer) return faqAnswer;

  // ── Route by step ─────────────────────────────────────────────────────────
  return handleStep(user, from, input, lower);
}

async function handleStep(
  user: User,
  from: string,
  input: string,
  lower: string,
): Promise<string> {
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
        `Reply *DEPOSIT* to see this again, or *HELP* for assistance.`
      );
    }

    case "active": {
      // Named commands for active users
      if (lower === "deposit" || lower === "address") {
        if (user.walletAddress && user.strategy) {
          return depositAddress(user.walletAddress, user.strategy);
        }
      }

      if (lower === "strategy") {
        return (
          "🔄 *Change your strategy*\n\n" +
          "Reply with:\n" +
          "• *Conservative* — 3–6% APY, low risk\n" +
          "• *Balanced* — 6–10% APY, medium risk\n" +
          "• *Growth* — 10–15% APY, higher risk"
        );
      }

      if (lower === "history") {
        // Placeholder — wire up to real transaction log when available
        return (
          "📜 *Recent Transactions*\n\n" +
          "Transaction history is coming soon.\n\n" +
          "Reply *BALANCE* to see your current portfolio value."
        );
      }

      if (lower === "withdraw" || lower.startsWith("withdraw ")) {
        // Basic acknowledgement — wire up to real withdrawal flow
        return (
          "💸 *Withdraw funds*\n\n" +
          "To withdraw, reply:\n" +
          "  *WITHDRAW [amount]*\n\n" +
          "Example: _WITHDRAW 500_\n\n" +
          "Minimum: 10 USDC. Funds arrive within minutes.\n\n" +
          "Reply *BALANCE* first to check your available balance."
        );
      }

      // Check strategy switch for active users
      const strategySwitch = STRATEGY_MAP[lower];
      if (strategySwitch) {
        await setUserStrategy(from, strategySwitch);
        return strategyDetail(strategySwitch);
      }

      return fallback("active");
    }

    default:
      return fallback("unknown");
  }
}