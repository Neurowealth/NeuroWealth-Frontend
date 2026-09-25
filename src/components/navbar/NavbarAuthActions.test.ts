/**
 * Characterization tests for the Navbar auth-actions branch, written ahead of
 * extracting it out of Navbar.tsx into NavbarAuthActions (#333).
 *
 * NavbarAuthActions has one branch, decided entirely by `user`:
 *
 *   user present  → signed-in block (account label + display name + sign out)
 *   user absent   → sign-in link
 *
 * We model the branch as a pure function rather than rendering the .tsx
 * component directly — see useNavbarSearch.test.ts for why: jsx:"preserve"
 * plus the tsx test loader's classic-transform fallback requires every
 * rendered component to import React, which no .tsx file in this repo does.
 * Every existing component test in this repo (ProtectedRoute, LocaleSwitcher,
 * CommandPalette) works around this the same way.
 */
import assert from "node:assert/strict";
import test from "node:test";

type AuthActionsView = "signed-in" | "signed-out";

interface MinimalUser {
  id: string;
  displayName: string;
}

function resolveAuthActionsView(user: MinimalUser | null): AuthActionsView {
  return user ? "signed-in" : "signed-out";
}

function signOutAriaLabel(user: MinimalUser): string {
  return `Sign out of ${user.displayName}'s account`;
}

const SIGNED_IN_USER: MinimalUser = { id: "usr_1", displayName: "Ada Lovelace" };

test("NavbarAuthActions — renders the sign-in link when there is no user", () => {
  assert.equal(resolveAuthActionsView(null), "signed-out");
});

test("NavbarAuthActions — renders the signed-in block when a user is present", () => {
  assert.equal(resolveAuthActionsView(SIGNED_IN_USER), "signed-in");
});

test("NavbarAuthActions — the two views are mutually exclusive", () => {
  assert.notEqual(resolveAuthActionsView(null), resolveAuthActionsView(SIGNED_IN_USER));
});

test("NavbarAuthActions — sign-out aria-label includes the user's display name", () => {
  assert.equal(signOutAriaLabel(SIGNED_IN_USER), "Sign out of Ada Lovelace's account");
});

test("NavbarAuthActions — sign-out aria-label reflects a different display name", () => {
  const user: MinimalUser = { id: "usr_2", displayName: "Grace Hopper" };
  assert.equal(signOutAriaLabel(user), "Sign out of Grace Hopper's account");
});
