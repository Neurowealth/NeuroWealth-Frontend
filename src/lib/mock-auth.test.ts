import assert from "node:assert/strict";
import test from "node:test";
import { mockAuth } from "./mock-auth";

test("mockAuth.signIn — succeeds with valid credentials and fails on wrong password", async () => {
  const session = await mockAuth.signIn("demo@neurowealth.app", "demo123");
  assert.ok(session);
  assert.equal(session.user.email, "demo@neurowealth.app");
  assert.ok(session.token.startsWith("mock_token_"));

  await assert.rejects(
    async () => mockAuth.signIn("demo@neurowealth.app", "wrongpassword"),
    /Invalid email or password/,
  );
});

test("mockAuth.signIn — enforces rate limiting after max request threshold", async () => {
  const email = "ratelimit-test@example.com";
  // Consume 5 allowed failed attempts
  for (let i = 0; i < 5; i++) {
    try {
      await mockAuth.signIn(email, "badpass");
    } catch (err: unknown) {
      assert.match((err as Error).message, /Invalid email or password/);
    }
  }

  // 6th attempt must be blocked by rate limiter
  await assert.rejects(
    async () => mockAuth.signIn(email, "badpass"),
    /Too many sign-in attempts\. Please try again later\./,
  );
});

test("mockAuth.signUp — handles new account creation and returns enumeration-safe error for existing email", async () => {
  const newEmail = `newuser_${Date.now()}@example.com`;
  const session = await mockAuth.signUp(newEmail, "New User", "password123");

  assert.ok(session);
  assert.equal(session.user.email, newEmail);
  assert.equal(session.user.displayName, "New User");
  assert.ok(session.token.startsWith("mock_token_"));

  // Attempting to sign up with existing email returns enumeration-safe message
  await assert.rejects(
    async () => mockAuth.signUp("demo@neurowealth.app", "Duplicate", "pass123"),
    /If this email is available, a confirmation has been sent\./,
  );
});

test("mockAuth.signUp — enforces rate limiting after max request threshold", async () => {
  const email = "ratelimit-signup-test@example.com";
  // First call succeeds; the rate limit is keyed by email regardless of
  // outcome, so repeat calls (which now hit the duplicate-account error)
  // still consume the allowance.
  await mockAuth.signUp(email, "Rate Limit Test", "password123");
  for (let i = 0; i < 4; i++) {
    await assert.rejects(
      async () => mockAuth.signUp(email, "Rate Limit Test", "password123"),
      /If this email is available, a confirmation has been sent\./,
    );
  }

  // 6th attempt for this rate-limit key must be blocked by the rate limiter.
  await assert.rejects(
    async () => mockAuth.signUp(email, "Rate Limit Test", "password123"),
    /Too many sign-up attempts\. Please try again later\./,
  );
});
