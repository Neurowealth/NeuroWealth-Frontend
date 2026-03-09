/**
 *
 * In-memory user store for development.
 * To migrate to Postgres/Supabase: keep these function signatures identical,
 * just replace the Map with real SQL queries inside each function.
 */
import { randomUUID } from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OnboardingStep =
  // new user, sent welcome, waiting for strategy pick
  | "awaiting_strategy"
  // showed strategy details, waiting for YES
  | "awaiting_confirmation"
  // wallet created, waiting for USDC to arrive
  | "awaiting_deposit"
  // fully onboarded
  | "active"
  // withdrawal flow states
  | "withdrawal_amount"
  | "withdrawal_confirm";

export type Strategy = "conservative" | "balanced" | "growth";

export type TransactionType = "deposit" | "withdrawal" | "rebalance";

export interface Transaction {
  id: string;
  phone: string;
  type: TransactionType;
  amount?: number;
  strategy?: Strategy;
  txHash?: string;
  metadata?: {
    fromAPY?: number;
    toAPY?: number;
    description?: string;
    walletAddress?: string;
  };
  createdAt: Date;
}

export interface User {
  id: string;
  phone: string;
  step: OnboardingStep;
  strategy: Strategy | null;
  walletAddress: string | null;
  encryptedPrivateKey: string | null;
  balance: number; // USDC balance
  pendingWithdrawal?: number; // amount pending confirmation
  totalDeposited: number;
  depositedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const store = new Map<string, User>();
const transactions = new Map<string, Transaction[]>();

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function findUserByPhone(phone: string): Promise<User | null> {
  return store.get(phone) ?? null;
}

export async function createUser(phone: string): Promise<User> {
  const user: User = {
    id: randomUUID(),
    phone,
    step: "awaiting_strategy",
    strategy: null,
    walletAddress: null,
    encryptedPrivateKey: null,
    balance: 0,
    totalDeposited: 0,
    depositedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  store.set(phone, user);
  return user;
}

export async function setUserStrategy(
  phone: string,
  strategy: Strategy,
): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, {
    ...user,
    strategy,
    step: "awaiting_confirmation",
    updatedAt: new Date(),
  });
}

export async function setUserWallet(
  phone: string,
  walletAddress: string,
  encryptedPrivateKey: string,
): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, {
    ...user,
    walletAddress,
    encryptedPrivateKey,
    step: "awaiting_deposit",
    updatedAt: new Date(),
  });
}

export async function setUserDeposit(
  phone: string,
  totalDeposited: number,
  depositedAt: Date = new Date(),
): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, {
    ...user,
    totalDeposited,
    depositedAt,
    step: totalDeposited > 0 ? "active" : user.step,
    updatedAt: new Date(),
  });
}

export async function setUserStep(
  phone: string,
  step: OnboardingStep,
): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, { ...user, step, updatedAt: new Date() });
}

export async function setPendingWithdrawal(
  phone: string,
  amount: number,
): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, {
    ...user,
    pendingWithdrawal: amount,
    step: "withdrawal_confirm",
    updatedAt: new Date(),
  });
}

export async function executeWithdrawal(phone: string): Promise<void> {
  const user = store.get(phone);
  if (!user || !user.pendingWithdrawal) throw new Error(`No pending withdrawal for ${phone}`);
  store.set(phone, {
    ...user,
    balance: user.balance - user.pendingWithdrawal,
    pendingWithdrawal: undefined,
    step: "active",
    updatedAt: new Date(),
  });
}

export async function cancelWithdrawal(phone: string): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, {
    ...user,
    pendingWithdrawal: undefined,
    step: "active",
    updatedAt: new Date(),
  });
}

export async function updateBalance(phone: string, balance: number): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, { ...user, balance, updatedAt: new Date() });
}

// ─── Transaction History ──────────────────────────────────────────────────────

export async function addTransaction(tx: Omit<Transaction, "id" | "createdAt">): Promise<void> {
  const txId = randomUUID();
  const transaction: Transaction = {
    ...tx,
    id: txId,
    createdAt: new Date(),
  };
  
  const userTxs = transactions.get(tx.phone) || [];
  userTxs.unshift(transaction);
  transactions.set(tx.phone, userTxs);
}

export async function getTransactionHistory(phone: string, limit: number = 5): Promise<Transaction[]> {
  const userTxs = transactions.get(phone) || [];
  return userTxs.slice(0, limit);
}

// ─── Test helpers (never call in production code) ─────────────────────────────
export const _test = {
  clear: () => {
    store.clear();
    transactions.clear();
  },
  all: () => Array.from(store.values()),
  seed: (user: User) => store.set(user.phone, user),
};
