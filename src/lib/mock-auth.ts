/**
 * mock-auth.ts
 *
 * Simulates authentication for development/demo purposes.
 * Uses SESSION_STORAGE_KEY from auth-constants so the key is
 * never hardcoded in more than one place.
 *
 * Implements the AuthAdapter interface to allow swapping with real backend.
 */

import { SESSION_STORAGE_KEY } from "./auth-constants";
import {
  adaptMockAuthUser,
  type MockAuthUserRecord,
} from "./user";
import type { User } from "@/types";
import type { AuthAdapter, AuthSession } from "./auth-adapter";
import { checkRateLimit } from "./rate-limit";

export type { AuthSession } from "./auth-adapter";

const MOCK_USERS: Record<string, { password: string; user: MockAuthUserRecord }> = {
  "demo@neurowealth.app": {
    password: "demo123",
    user: {
      id: "usr_demo_001",
      email: "demo@neurowealth.app",
      name: "Demo User",
      avatar: undefined,
      walletAddress: "GDEMO...XLM",
      createdAt: new Date().toISOString(),
    },
  },
};

/**
 * Generate a cryptographically secure session token.
 * Uses crypto.randomUUID (Web Crypto API) to ensure unpredictability,
 * independent of NEXT_PUBLIC_DEMO_SEED or any seeded RNG.
 */
function generateToken(): string {
  // Use crypto API for secure randomness
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `mock_token_${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID (Node < 19 without polyfill)
  // This should never happen in modern environments but provides a safe fallback
  throw new Error("crypto.randomUUID is not available in this environment");
}

function isLegacyMockAuthUserRecord(value: unknown): value is MockAuthUserRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MockAuthUserRecord>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string"
  );
}

function normalizeSession(value: unknown): AuthSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AuthSession> & {
    user?: User | MockAuthUserRecord;
  };

  if (typeof candidate.token !== "string" || typeof candidate.expiresAt !== "number") {
    return null;
  }

  if (!candidate.user) {
    return null;
  }

  const user = isLegacyMockAuthUserRecord(candidate.user)
    ? adaptMockAuthUser(candidate.user)
    : (candidate.user as User);

  if (!user.id || !user.displayName) {
    return null;
  }

  return {
    user,
    token: candidate.token,
    expiresAt: candidate.expiresAt,
  };
}

/**
 * Rate limiting caveat (mock auth only).
 *
 * checkRateLimit() is backed by an in-memory Map scoped to this JS heap (see
 * rate-limit.ts). There is no server-side /api/login route, so a hard refresh
 * or a fresh tab resets the attempt counter — this guard is a UX deterrent
 * against casual retries, not a real brute-force protection. Once auth moves
 * off this mock layer onto a real backend, sign-in (and sign-up) rate limiting
 * must be enforced server-side, matching how the cookie-signature gap is
 * documented in api-auth.ts.
 */
export const mockAuth: AuthAdapter = {
  /** Read the current session from localStorage (client-only). */
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const session = normalizeSession(JSON.parse(raw));
      if (!session) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  /** Returns true when a valid, non-expired session exists. */
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  async signIn(email: string, password: string): Promise<AuthSession> {
    const limit = checkRateLimit(`signIn:${email.toLowerCase()}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      throw new Error(
        "Too many sign-in attempts. Please try again later.",
      );
    }

    await new Promise((r) => setTimeout(r, 400)); // simulate network
    const record = MOCK_USERS[email.toLowerCase()];
    if (!record || record.password !== password) {
      throw new Error("Invalid email or password");
    }
    const session: AuthSession = {
      user: adaptMockAuthUser(record.user),
      token: generateToken(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    return session;
  },

  async signUp(
    email: string,
    name: string,
    password: string,
  ): Promise<AuthSession> {
    const limit = checkRateLimit(`signUp:${email.toLowerCase()}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      throw new Error(
        "Too many sign-up attempts. Please try again later.",
      );
    }

    await new Promise((r) => setTimeout(r, 400));
    if (MOCK_USERS[email.toLowerCase()]) {
      // Use a generic message to avoid confirming whether an account exists.
      // A real backend should return the same response for both duplicate and
      // new registrations (e.g. "check your email") to prevent enumeration.
      throw new Error("If this email is available, a confirmation has been sent.");
    }
    const user: MockAuthUserRecord = {
      id: `usr_${crypto.randomUUID()}`,
      email: email.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS[email.toLowerCase()] = { password, user };
    const session: AuthSession = {
      user: adaptMockAuthUser(user),
      token: generateToken(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    return session;
  },

  signOut(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },
};
