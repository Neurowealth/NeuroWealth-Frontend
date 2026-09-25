/**
 * Authorization tier for a user. Defaults to "user" everywhere a role isn't
 * explicitly known (see adaptMockAuthUser/adaptApiUser in src/lib/user.ts).
 * Added ahead of any future sensitive-route additions so route protection
 * can grow beyond a single logged-in/logged-out tier without a breaking
 * change to the User shape.
 */
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  displayName: string;
  email?: string;
  walletAddress?: string;
  avatarUrl?: string;
  avatarInitials?: string;
  createdAt?: string;
  role: UserRole;
}
