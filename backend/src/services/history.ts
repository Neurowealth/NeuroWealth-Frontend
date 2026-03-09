/**
 * Transaction history service
 */

import { getTransactionHistory, Transaction, User } from "../db/userStore";
import { getStellarExpertLink } from "./withdrawal";

const HISTORY_PATTERNS: RegExp[] = [
  /\bhistory\b/i,
  /\btransactions?\b/i,
  /what\s+happened/i,
  /\bactivity\b/i,
  /\bevent\b/i,
];

export function isHistoryIntent(input: string): boolean {
  const normalized = input.trim();
  if (!normalized) return false;
  return HISTORY_PATTERNS.some((pattern) => pattern.test(normalized));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTransaction(tx: Transaction): string {
  const date = formatDate(tx.createdAt);
  
  switch (tx.type) {
    case "deposit": {
      const amount = tx.amount?.toFixed(2) || "0.00";
      const strategy = tx.strategy || "Unknown";
      return (
        ` ✅ Deposit — +${amount} USDC\n` +
        `    ${date} · Deployed to ${strategy.charAt(0).toUpperCase() + strategy.slice(1)}`
      );
    }
    
    case "withdrawal": {
      const amount = tx.amount?.toFixed(2) || "0.00";
      const wallet = tx.metadata?.walletAddress 
        ? `${tx.metadata.walletAddress.slice(0, 4)}...${tx.metadata.walletAddress.slice(-3)}`
        : "wallet";
      const txLink = tx.txHash ? `\n    TX: ${getStellarExpertLink(tx.txHash)}` : "";
      return (
        ` 💸 Withdrawal — -${amount} USDC\n` +
        `    ${date} · Sent to ${wallet}${txLink}`
      );
    }
    
    case "rebalance": {
      const fromAPY = tx.metadata?.fromAPY?.toFixed(1) || "0.0";
      const toAPY = tx.metadata?.toAPY?.toFixed(1) || "0.0";
      const desc = tx.metadata?.description || "Optimized allocation";
      return (
        ` 🔄 Rebalanced — auto\n` +
        `    ${date} · ${desc}\n` +
        `    APY improved: ${fromAPY}% → ${toAPY}%`
      );
    }
    
    default:
      return ` ℹ️ ${tx.type} — ${date}`;
  }
}

export async function buildHistoryReply(user: User): Promise<string> {
  const history = await getTransactionHistory(user.phone, 5);
  
  if (history.length === 0) {
    return (
      "📜 Transaction History\n" +
      "━━━━━━━━━━━━━━━━━━━━\n\n" +
      "No transactions yet.\n\n" +
      "Reply *DEPOSIT* to get started!"
    );
  }
  
  const formattedTxs = history.map(formatTransaction).join("\n\n");
  const count = history.length;
  
  return (
    "📜 Recent Transactions\n" +
    "━━━━━━━━━━━━━━━━━━━━\n\n" +
    formattedTxs +
    "\n━━━━━━━━━━━━━━━━━━━━\n" +
    `Showing last ${count} event${count !== 1 ? "s" : ""}`
  );
}
