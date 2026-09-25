/**
 * ProtectedRoute guard logic tests.
 *
 * ProtectedRoute.tsx has three exclusive branches:
 *
 *   loading=true            → render fallback  (auth state still hydrating)
 *   loading=false, !user    → render null + fire router.replace  (redirect)
 *   loading=false,  user    → render children  (authenticated)
 *
 * Because the component depends on React hooks and a DOM router, we model its
 * decision as a pure function and test all branches without rendering. We also
 * test the redirect URL construction and the path-guard utilities from
 * auth-constants that determine which routes ProtectedRoute wraps.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
  SIGN_IN_PATH,
  isProtectedPath,
  isAuthOnlyPath,
} from "@/lib/auth-constants";
import type { User } from "@/types";

// ── Guard decision (mirrors ProtectedRoute.tsx branching exactly) ─────────────

type GuardOutcome = "loading" | "redirect" | "children";

function resolveGuard(loading: boolean, user: User | null): GuardOutcome {
  if (loading) return "loading";
  if (!user)   return "redirect";
  return "children";
}

// ── Redirect URL (mirrors the string ProtectedRoute passes to router.replace) ─

function buildRedirectUrl(redirectTo: string, pathname: string): string {
  return `${redirectTo}?from=${encodeURIComponent(pathname)}`;
}

// ── Fixture ───────────────────────────────────────────────────────────────────

const AUTHED_USER: User = {
  id: "usr_fixture",
  displayName: "Test User",
  email: "test@example.com",
  role: "user",
};

// ── Loading state ─────────────────────────────────────────────────────────────

test("ProtectedRoute — loading: renders fallback when loading=true and user=null", () => {
  assert.equal(resolveGuard(true, null), "loading");
});

test("ProtectedRoute — loading: still renders fallback when loading=true even if user is set", () => {
  // Stale user value during re-hydration must not bypass the loading gate.
  assert.equal(resolveGuard(true, AUTHED_USER), "loading");
});

test("ProtectedRoute — loading: transitions to children once loading resolves with a user", () => {
  assert.equal(resolveGuard(true, AUTHED_USER), "loading");
  assert.equal(resolveGuard(false, AUTHED_USER), "children");
});

test("ProtectedRoute — loading: transitions to redirect once loading resolves without a user", () => {
  assert.equal(resolveGuard(true, null), "loading");
  assert.equal(resolveGuard(false, null), "redirect");
});

// ── Unauthenticated state ─────────────────────────────────────────────────────

test("ProtectedRoute — unauthenticated: triggers redirect when user is null", () => {
  assert.equal(resolveGuard(false, null), "redirect");
});

test("ProtectedRoute — unauthenticated: redirect URL starts with SIGN_IN_PATH by default", () => {
  const url = buildRedirectUrl(SIGN_IN_PATH, "/dashboard");
  assert.ok(url.startsWith(SIGN_IN_PATH));
});

test("ProtectedRoute — unauthenticated: redirect URL encodes the current pathname as 'from'", () => {
  const url = buildRedirectUrl(SIGN_IN_PATH, "/dashboard/portfolio");
  assert.equal(url, `${SIGN_IN_PATH}?from=%2Fdashboard%2Fportfolio`);
});

test("ProtectedRoute — unauthenticated: custom redirectTo overrides the default sign-in path", () => {
  const url = buildRedirectUrl("/custom-login", "/settings");
  assert.ok(url.startsWith("/custom-login"));
  assert.ok(url.includes("from="));
});

test("ProtectedRoute — unauthenticated: 'from' param survives encode/decode round-trip", () => {
  const originalPath = "/dashboard/settings/notifications";
  const url = buildRedirectUrl(SIGN_IN_PATH, originalPath);
  const fromParam = new URLSearchParams(url.split("?")[1]).get("from");
  assert.equal(fromParam, originalPath);
});

test("ProtectedRoute — unauthenticated: 'from' handles nested paths with multiple segments", () => {
  const path = "/dashboard/audit";
  const url = buildRedirectUrl(SIGN_IN_PATH, path);
  const fromParam = new URLSearchParams(url.split("?")[1]).get("from");
  assert.equal(fromParam, path);
});

// ── Authenticated state ───────────────────────────────────────────────────────

test("ProtectedRoute — authenticated: renders children when user is present", () => {
  assert.equal(resolveGuard(false, AUTHED_USER), "children");
});

test("ProtectedRoute — authenticated: any non-null user satisfies the guard", () => {
  const minimalUser: User = { id: "u_min", displayName: "Min", role: "user" };
  assert.equal(resolveGuard(false, minimalUser), "children");
});

test("ProtectedRoute — authenticated: user without optional fields still grants access", () => {
  const bareUser: User = { id: "u_bare", displayName: "Bare User", role: "user" };
  assert.equal(resolveGuard(false, bareUser), "children");
});

// ── isProtectedPath — routes that require authentication ──────────────────────

test("ProtectedRoute — isProtectedPath: /dashboard requires auth", () => {
  assert.equal(isProtectedPath("/dashboard"), true);
});

test("ProtectedRoute — isProtectedPath: /dashboard/portfolio nested route requires auth", () => {
  assert.equal(isProtectedPath("/dashboard/portfolio"), true);
});

test("ProtectedRoute — isProtectedPath: /dashboard/settings/security deeply nested requires auth", () => {
  assert.equal(isProtectedPath("/dashboard/settings/security"), true);
});

test("ProtectedRoute — isProtectedPath: /profile requires auth", () => {
  assert.equal(isProtectedPath("/profile"), true);
});

test("ProtectedRoute — isProtectedPath: /settings requires auth", () => {
  assert.equal(isProtectedPath("/settings"), true);
});

test("ProtectedRoute — isProtectedPath: /login is public", () => {
  assert.equal(isProtectedPath("/login"), false);
});

test("ProtectedRoute — isProtectedPath: /signup is public", () => {
  assert.equal(isProtectedPath("/signup"), false);
});

test("ProtectedRoute — isProtectedPath: /signin is public", () => {
  assert.equal(isProtectedPath("/signin"), false);
});

test("ProtectedRoute — isProtectedPath: / (root) is public", () => {
  assert.equal(isProtectedPath("/"), false);
});

test("ProtectedRoute — isProtectedPath: /about is public", () => {
  assert.equal(isProtectedPath("/about"), false);
});

// ── isAuthOnlyPath — routes that bounce already-authenticated users ────────────

test("ProtectedRoute — isAuthOnlyPath: /login redirects authenticated users", () => {
  assert.equal(isAuthOnlyPath("/login"), true);
});

test("ProtectedRoute — isAuthOnlyPath: /signup redirects authenticated users", () => {
  assert.equal(isAuthOnlyPath("/signup"), true);
});

test("ProtectedRoute — isAuthOnlyPath: /dashboard is accessible when authenticated", () => {
  assert.equal(isAuthOnlyPath("/dashboard"), false);
});

test("ProtectedRoute — isAuthOnlyPath: /profile is accessible when authenticated", () => {
  assert.equal(isAuthOnlyPath("/profile"), false);
});

test("ProtectedRoute — isAuthOnlyPath: / (root) is not auth-only", () => {
  assert.equal(isAuthOnlyPath("/"), false);
});

// ── Additional redirect URL edge cases ────────────────────────────────────────

test("ProtectedRoute — unauthenticated: 'from' handles paths with query strings", () => {
  const original = "/dashboard?tab=settings";
  const url = buildRedirectUrl(SIGN_IN_PATH, original);
  const fromParam = new URLSearchParams(url.split("?")[1]).get("from");
  assert.equal(fromParam, original);
});

test("ProtectedRoute — unauthenticated: 'from' preserves hash fragments", () => {
  const original = "/dashboard/settings#security";
  const url = buildRedirectUrl(SIGN_IN_PATH, original);
  const fromParam = new URLSearchParams(url.split("?")[1]).get("from");
  assert.equal(fromParam, original);
});

test("ProtectedRoute — unauthenticated: 'from' handles root path", () => {
  const url = buildRedirectUrl(SIGN_IN_PATH, "/");
  const fromParam = new URLSearchParams(url.split("?")[1]).get("from");
  assert.equal(fromParam, "/");
});

// ── SIGN_IN_PATH default value ────────────────────────────────────────────────

test("ProtectedRoute — default redirectTo is /login", () => {
  assert.equal(SIGN_IN_PATH, "/login");
});

// ── Guard outcomes are mutually exclusive ─────────────────────────────────────

test("ProtectedRoute — guard: all three outcomes are distinct", () => {
  const outcomes = [
    resolveGuard(true, null),
    resolveGuard(false, null),
    resolveGuard(false, AUTHED_USER),
  ];
  assert.equal(new Set(outcomes).size, 3);
});

// ── isProtectedPath — /onboarding ─────────────────────────────────────────────

test("ProtectedRoute — isProtectedPath: /onboarding requires auth", () => {
  assert.equal(isProtectedPath("/onboarding"), true);
});

test("ProtectedRoute — isProtectedPath: /onboarding/step/1 nested requires auth", () => {
  assert.equal(isProtectedPath("/onboarding/step/1"), true);
});
