/**
 * Strategy Switch Service
 *
 * Handles the full conversation flow for switching investment strategies:
 *   1. Detect intent → show strategy menu (interactive buttons)
 *   2. User picks strategy → show confirmation (with growth risk warning)
 *   3. User confirms → call vault switchStrategy(), update DB, send result
 */

import { logger } from "../utils/logger";
import {
  setPendingStrategy,
  updateUserStrategy,
  Strategy,
  User,
} from "../db/userStore";
import { switchVaultStrategy } from "../utils/stellar";
import { ParsedMessage, BotReply } from "../types/whatsapp";

// ─── Constants ────────────────────────────────────────────────────────────────

const STRATEGY_APY: Record<Strategy, { range: string; current: number }> = {
  conservative: { range: "3–6%", current: 4.8 },
  balanced: { range: "6–10%", current: 8.2 },
  growth: { range: "10–15%", current: 12.4 },
};

const STRATEGY_LABEL: Record<Strategy, string> = {
  conservative: "Conservative",
  balanced: "Balanced",
  growth: "Growth",
};

const STRATEGY_DETAIL: Record<Strategy, string> = {
  conservative: "Blend stablecoin lending",
  balanced: "Lending + DEX liquidity",
  growth: "Multi-protocol aggressive",
};

const STRATEGY_RISK: Record<Strategy, string> = {
  conservative: "Low",
  balanced: "Medium",
  growth: "High",
};

// Button IDs used in interactive messages
const BTN_CONSERVATIVE = "conservative";
const BTN_GROWTH = "growth";
const BTN_KEEP_CURRENT = "keep_current";
const BTN_CONFIRM_SWITCH = "confirm_switch";
const BTN_CANCEL_SWITCH = "cancel_switch";

// ─── Intent detection ─────────────────────────────────────────────────────────

const SWITCH_PATTERNS: RegExp[] = [
  /\bswitch\s+strategy\b/i,
  /\bchange\s+strategy\b/i,
  /\bchange\s+my\s+strategy\b/i,
  /\bi\s+want\s+(conservative|balanced|growth)\b/i,
  /\bswitch\s+to\s+(conservative|balanced|growth)\b/i,
  /\bchange\s+to\s+(conservative|balanced|growth)\b/i,
];

export function isSwitchStrategyIntent(input: string): boolean {
  return SWITCH_PATTERNS.some((p) => p.test(input));
}

// ─── Message builders ─────────────────────────────────────────────────────────

function strategyRow(strategy: Strategy, isCurrent: boolean): string {
  const label = STRATEGY_LABEL[strategy];
  const detail = STRATEGY_DETAIL[strategy];
  const risk = STRATEGY_RISK[strategy];
  const apy = STRATEGY_APY[strategy].range;
  const tag = isCurrent ? " (current)" : "";
  return `${label}${tag}\n   ${detail}\n   Risk: ${risk} | APY: ${apy}`;
}

export function buildStrategySelectionReply(user: User): BotReply {
  const current = user.strategy ?? "balanced";
  const currentLabel = STRATEGY_LABEL[current];
  const currentApy = STRATEGY_APY[current].current.toFixed(1);

  const body =
    `📋 Change Investment Strategy\n\n` +
    ` Current: ${currentLabel} (${currentApy}% APY)\n\n` +
    ` Available strategies:\n\n` +
    ` 1️⃣ ${strategyRow("conservative", current === "conservative")}\n\n` +
    ` 2️⃣ ${strategyRow("balanced", current === "balanced")}\n\n` +
    ` 3️⃣ ${strategyRow("growth", current === "growth")}\n\n` +
    ` Which would you like to switch to?`;

  // Offer buttons for the two non-current strategies + keep current
  const buttons: Array<{ id: string; title: string }> = (
    ["conservative", "balanced", "growth"] as Strategy[]
  )
    .filter((s) => s !== current)
    .map((s) => ({ id: s, title: STRATEGY_LABEL[s] }));
  buttons.push({ id: BTN_KEEP_CURRENT, title: "Keep Current" });

  return { body, buttons };
}

export function buildConfirmationReply(
  user: User,
  targetStrategy: Strategy,
): BotReply {
  const current = user.strategy ?? "balanced";
  const currentLabel = STRATEGY_LABEL[current];
  const targetLabel = STRATEGY_LABEL[targetStrategy];
  const balance = user.totalDeposited.toFixed(2);

  const growthWarning =
    targetStrategy === "growth"
      ? `\n Growth involves higher risk including\n potential impermanent loss on DEX positions.\n`
      : "";

  const body =
    `⚠️ Switch to ${targetLabel} Strategy?\n` +
    growthWarning +
    `\n Your ${balance} USDC will be moved from\n` +
    ` ${currentLabel} → ${targetLabel} protocols.\n\n` +
    ` This takes ~30 seconds.`;

  return {
    body,
    buttons: [
      { id: BTN_CONFIRM_SWITCH, title: "Yes, Switch ✅" },
      { id: BTN_CANCEL_SWITCH, title: `No, Keep ${currentLabel} ❌` },
    ],
  };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

/**
 * handleStrategySwitch
 *
 * Call this when the user is `active` and we need to handle strategy switching.
 * Returns a BotReply or null (if message is unrelated to strategy switching).
 */
export async function handleStrategySwitch(
  msg: ParsedMessage,
  user: User,
): Promise<BotReply | null> {
  const input = msg.text.body.trim();
  const lower = input.toLowerCase();
  // buttonId is set when user tapped an interactive button
  const buttonId = msg.buttonId;

  // ── Step 1: initial intent — show strategy selection menu ─────────────────
  if (isSwitchStrategyIntent(lower)) {
    return buildStrategySelectionReply(user);
  }

  // ── Step 2: user picked a strategy button (or typed a strategy name) ──────
  const pickedStrategy = resolveStrategyFromInput(lower, buttonId);

  if (pickedStrategy) {
    const current = user.strategy ?? "balanced";

    if (pickedStrategy === "keep_current") {
      return `✅ No change — you're staying on *${STRATEGY_LABEL[current]}* (${STRATEGY_APY[current].current.toFixed(1)}% APY).`;
    }

    // pickedStrategy is narrowed to Strategy here
    if (pickedStrategy === current) {
      return `✅ You're already on *${STRATEGY_LABEL[current]}* (${STRATEGY_APY[current].current.toFixed(1)}% APY).`;
    }

    // Store pending strategy and ask for confirmation
    await setPendingStrategy(msg.from, pickedStrategy);
    return buildConfirmationReply(user, pickedStrategy);
  }

  // ── Step 3: confirmation response ─────────────────────────────────────────
  if (user.pendingStrategy) {
    const pending = user.pendingStrategy;
    const current = user.strategy ?? "balanced";

    // Cancel
    if (
      buttonId === BTN_CANCEL_SWITCH ||
      lower === "no" ||
      lower === "cancel"
    ) {
      await setPendingStrategy(msg.from, null);
      return `✅ No change — you're staying on *${STRATEGY_LABEL[current]}*.`;
    }

    // Confirm
    if (buttonId === BTN_CONFIRM_SWITCH || lower === "yes" || lower === "y") {
      return executeSwitchStrategy(msg.from, user, pending);
    }
  }

  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveStrategyFromInput(
  lower: string,
  buttonId?: string,
): Strategy | "keep_current" | null {
  if (buttonId === BTN_KEEP_CURRENT) return "keep_current";
  if (buttonId === BTN_CONSERVATIVE || lower === "conservative") return "conservative";
  if (buttonId === BTN_GROWTH || lower === "growth") return "growth";
  if (buttonId === "balanced" || lower === "balanced") return "balanced";
  return null;
}

async function executeSwitchStrategy(
  phone: string,
  user: User,
  targetStrategy: Strategy,
): Promise<BotReply> {
  const current = user.strategy ?? "balanced";
  const targetLabel = STRATEGY_LABEL[targetStrategy];
  const newApy = STRATEGY_APY[targetStrategy].current.toFixed(1);

  try {
    if (!user.walletAddress || !user.encryptedPrivateKey) {
      throw new Error("No wallet on file");
    }

    await switchVaultStrategy(
      user.walletAddress,
      user.encryptedPrivateKey,
      current,
      targetStrategy,
    );

    await updateUserStrategy(phone, targetStrategy);

    logger.info(
      { phone, from: current, to: targetStrategy },
      "Strategy switched successfully",
    );

    return (
      `✅ Strategy Updated!\n\n` +
      ` New Strategy: ${targetLabel}\n` +
      ` Current APY: ${newApy}%\n` +
      ` Status: Funds deployed ✓\n\n` +
      ` I'll optimize within this strategy automatically.`
    );
  } catch (err: any) {
    // Clear pending strategy so user can try again
    await setPendingStrategy(phone, null);

    logger.error(
      { phone, targetStrategy, err: err.message },
      "Strategy switch failed",
    );

    return (
      `❌ Switch Failed\n\n` +
      ` We couldn't move your funds to ${targetLabel} right now.\n` +
      ` Your funds remain in *${STRATEGY_LABEL[current]}* — no changes were made.\n\n` +
      ` Please try again in a few minutes or reply *help* for support.`
    );
  }
}
