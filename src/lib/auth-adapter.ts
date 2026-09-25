/**
 * auth-adapter.ts
 *
 * Defines the authentication adapter interface.
 * This allows the app to swap between mock auth and real backend
 * without changing UI code.
 */

import type { User } from "@/types";

export interface AuthSession {
    user: User;
    token: string;
    expiresAt: number;
}

export interface AuthAdapter {
    /**
     * Read the current session from storage (client-only).
     */
    getSession(): AuthSession | null;

    /**
     * Returns true when a valid, non-expired session exists.
     */
    isAuthenticated(): boolean;

    /**
     * Sign in with email and password.
     */
    signIn(email: string, password: string): Promise<AuthSession>;

    /**
     * Sign up with email, name, and password.
     *
     * IMPORTANT (enumeration-safe contract): Implementations MUST NOT
     * distinguish between "email already registered" and "email available"
     * in the error message. Return a generic response (e.g. "check your
     * email") or throw a non-specific error for both paths so callers
     * cannot probe for existing accounts.
     */
    signUp(
        email: string,
        name: string,
        password: string,
    ): Promise<AuthSession>;

    /**
     * Sign out and clear session.
     */
    signOut(): void;
}
