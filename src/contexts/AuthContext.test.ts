/**
 * AuthContext state machine tests.
 *
 * AuthContext is a thin React wrapper around the auth adapter returned by
 * getAuthAdapter(). All meaningful logic lives in the adapter, so these tests
 * drive the adapter directly to cover the three states the context surfaces:
 *
 *   loading  — transient window between mount and first syncFromStorage call
 *   authenticated — valid, non-expired session exists in storage
 *   unauthenticated — no session, expired session, or after sign-out
 *
 * A minimal localStorage stub is installed before any adapter method is called.
 * mockAuth reads localStorage at call time (not module load time), so the stub
 * only needs to be in place before the first test runs.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { SESSION_STORAGE_KEY } from "@/lib/auth-constants";
import { adaptMockAuthUser } from "@/lib/user";
import type { AuthSession } from "@/lib/auth-adapter";

// ── Minimal DOM stubs ─────────────────────────────────────────────────────────

const store = new Map<string, string>();

Object.defineProperty(globalThis, "window", {
  value: globalThis,
  configurable: true,
  writable: true,
});

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem:    (key: string) => store.get(key) ?? null,
    setItem:    (key: string, val: string) => { store.set(key, val); },
    removeItem: (key: string) => { store.delete(key); },
    clear:      () => { store.clear(); },
  },
  configurable: true,
  writable: true,
});

// Import AFTER defining globals so every adapter method call sees window +
// localStorage from the first test onward.
import { mockAuth } from "@/lib/mock-auth";
import { resetRateLimitStore } from "@/lib/rate-limit";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<AuthSession> = {}): AuthSession {
  return {
    user: adaptMockAuthUser({
      id: "usr_test",
      email: "fixture@example.com",
      name: "Fixture User",
      createdAt: new Date().toISOString(),
    }),
    token: "fixture-token",
    expiresAt: Date.now() + 1_000 * 60 * 60, // 1 h from now
    ...overrides,
  };
}

function seedStorage(session: AuthSession) {
  store.set(SESSION_STORAGE_KEY, JSON.stringify(session));
}

// ── Test lifecycle ────────────────────────────────────────────────────────────

test.beforeEach(() => { store.clear(); resetRateLimitStore(); });

// ── Loading state ─────────────────────────────────────────────────────────────
// AuthContext initialises with loading=true and user=null. After mount it calls
// syncFromStorage() which resolves to one of the two stable states below.
// The tests here verify what syncFromStorage returns in each scenario.

test("AuthContext — loading→unauthenticated: empty storage resolves to null session", () => {
  // No session seeded → syncFromStorage produces user=null
  assert.equal(mockAuth.getSession(), null);
});

test("AuthContext — loading→authenticated: valid stored session resolves to user", () => {
  const session = makeSession();
  seedStorage(session);

  const resolved = mockAuth.getSession();
  assert.ok(resolved !== null, "expected session to be resolved");
  assert.equal(resolved.user.id, session.user.id);
  assert.equal(resolved.token, session.token);
});

test("AuthContext — loading→unauthenticated: expired session resolves to null", () => {
  seedStorage(makeSession({ expiresAt: Date.now() - 1 }));
  assert.equal(mockAuth.getSession(), null);
});

test("AuthContext — loading→unauthenticated: corrupted storage resolves to null", () => {
  store.set(SESSION_STORAGE_KEY, "not{valid}json");
  assert.equal(mockAuth.getSession(), null);
});

// ── Unauthenticated state ─────────────────────────────────────────────────────

test("AuthContext — unauthenticated: isAuthenticated returns false when no session", () => {
  assert.equal(mockAuth.isAuthenticated(), false);
});

test("AuthContext — unauthenticated: isAuthenticated returns false for expired session", () => {
  seedStorage(makeSession({ expiresAt: Date.now() - 1 }));
  assert.equal(mockAuth.isAuthenticated(), false);
});

test("AuthContext — unauthenticated: expired session is pruned from storage", () => {
  seedStorage(makeSession({ expiresAt: Date.now() - 1 }));
  mockAuth.getSession();
  assert.equal(store.has(SESSION_STORAGE_KEY), false);
});

// ── Authenticated state ───────────────────────────────────────────────────────

test("AuthContext — authenticated: isAuthenticated returns true for valid session", () => {
  seedStorage(makeSession());
  assert.equal(mockAuth.isAuthenticated(), true);
});

test("AuthContext — authenticated: getSession expiry is in the future", () => {
  seedStorage(makeSession());
  const session = mockAuth.getSession();
  assert.ok(session !== null);
  assert.ok(session.expiresAt > Date.now());
});

test("AuthContext — authenticated: getSession is idempotent across multiple calls", () => {
  seedStorage(makeSession());
  const first  = mockAuth.getSession();
  const second = mockAuth.getSession();
  assert.ok(first  !== null);
  assert.ok(second !== null);
  assert.equal(first.token, second.token);
});

// ── signIn ────────────────────────────────────────────────────────────────────
// Mirrors AuthContext.signIn: setLoading(true) → adapter.signIn → setUser →
// setLoading(false). Tests here cover the adapter contract that drives each branch.

test("AuthContext — signIn success: returns session with user and valid token", async () => {
  const session = await mockAuth.signIn("demo@neurowealth.app", "demo123");

  assert.ok(session.user.id);
  assert.ok(session.token.length > 0);
  assert.ok(session.expiresAt > Date.now());
});

test("AuthContext — signIn success: session is persisted in storage", async () => {
  await mockAuth.signIn("demo@neurowealth.app", "demo123");
  assert.equal(store.has(SESSION_STORAGE_KEY), true);
});

test("AuthContext — signIn success: signed-in session is retrievable via getSession", async () => {
  await mockAuth.signIn("demo@neurowealth.app", "demo123");
  const session = mockAuth.getSession();
  assert.ok(session !== null);
  assert.equal(session.user.email, "demo@neurowealth.app");
});

test("AuthContext — signIn failure: wrong password throws and leaves storage empty", async () => {
  await assert.rejects(
    () => mockAuth.signIn("demo@neurowealth.app", "wrong"),
    /invalid email or password/i,
  );
  assert.equal(store.has(SESSION_STORAGE_KEY), false);
});

test("AuthContext — signIn failure: unknown email throws", async () => {
  await assert.rejects(
    () => mockAuth.signIn("nobody@example.com", "any"),
    /invalid email or password/i,
  );
});

// ── signUp ────────────────────────────────────────────────────────────────────

test("AuthContext — signUp success: returns session with correct user shape", async () => {
  const session = await mockAuth.signUp("signup-a@example.com", "Alice", "securePass1!");

  assert.ok(session.user.id);
  assert.equal(session.user.displayName, "Alice");
  assert.equal(session.user.email, "signup-a@example.com");
});

test("AuthContext — signUp success: session is persisted in storage", async () => {
  await mockAuth.signUp("signup-b@example.com", "Bob", "securePass1!");
  assert.equal(store.has(SESSION_STORAGE_KEY), true);
});

test("AuthContext — signUp success: new user is immediately authenticated", async () => {
  await mockAuth.signUp("signup-c@example.com", "Carol", "securePass1!");
  assert.equal(mockAuth.isAuthenticated(), true);
});

test("AuthContext — signUp failure: duplicate email throws (enumeration-safe)", async () => {
  await mockAuth.signUp("dup@example.com", "First", "securePass1!");
  store.clear(); // clear storage so the second call isn't blocked by an existing session
  await assert.rejects(
    () => mockAuth.signUp("dup@example.com", "Second", "securePass1!"),
    /confirmation has been sent/i,
  );
});

// ── signOut ───────────────────────────────────────────────────────────────────
// Mirrors AuthContext.signOut: adapter.signOut → clearSessionCookie → setUser(null).

test("AuthContext — signOut: removes session from storage", async () => {
  await mockAuth.signIn("demo@neurowealth.app", "demo123");
  mockAuth.signOut();
  assert.equal(store.has(SESSION_STORAGE_KEY), false);
});

test("AuthContext — signOut: getSession returns null after sign-out", async () => {
  await mockAuth.signIn("demo@neurowealth.app", "demo123");
  mockAuth.signOut();
  assert.equal(mockAuth.getSession(), null);
});

test("AuthContext — signOut: isAuthenticated returns false after sign-out", async () => {
  await mockAuth.signIn("demo@neurowealth.app", "demo123");
  mockAuth.signOut();
  assert.equal(mockAuth.isAuthenticated(), false);
});

test("AuthContext — signOut: subsequent signIn succeeds after sign-out", async () => {
  await mockAuth.signIn("demo@neurowealth.app", "demo123");
  mockAuth.signOut();
  const session = await mockAuth.signIn("demo@neurowealth.app", "demo123");
  assert.ok(session !== null);
  assert.equal(mockAuth.isAuthenticated(), true);
});
