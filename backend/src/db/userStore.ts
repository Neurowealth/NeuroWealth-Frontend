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
  | "active";

export type Strategy = "conservative" | "balanced" | "growth";

export interface User {
  id: string;
  phone: string;
  step: OnboardingStep;
  strategy: Strategy | null;
  /** Strategy the user is about to switch to — set during the confirmation step */
  pendingStrategy: Strategy | null;
  walletAddress: string | null;
  encryptedPrivateKey: string | null;
  totalDeposited: number;
  depositedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const store = new Map<string, User>();

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
    pendingStrategy: null,
    walletAddress: null,
    encryptedPrivateKey: null,
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

/** Store the strategy the user wants to switch to (pending confirmation). */
export async function setPendingStrategy(
  phone: string,
  pendingStrategy: Strategy | null,
): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, { ...user, pendingStrategy, updatedAt: new Date() });
}

/** Apply a confirmed strategy switch for an already-active user. */
export async function updateUserStrategy(
  phone: string,
  strategy: Strategy,
): Promise<void> {
  const user = store.get(phone);
  if (!user) throw new Error(`User not found: ${phone}`);
  store.set(phone, {
    ...user,
    strategy,
    pendingStrategy: null,
    updatedAt: new Date(),
  });
}

// ─── Test helpers (never call in production code) ─────────────────────────────
export const _test = {
  clear: () => store.clear(),
  all: () => Array.from(store.values()),
  seed: (user: User) => store.set(user.phone, user),
};
