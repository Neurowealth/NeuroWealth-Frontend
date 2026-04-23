"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { AuthState, User } from "@/types";

// ── Cookie helpers ────────────────────────────────────────────────────────────

const TOKEN_COOKIE = "nw-auth-token";

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(^| )" + name + "=([^;]+)")
  );
  return match ? match[2] : null;
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Mock user hydration ───────────────────────────────────────────────────────
// In production this would call /api/auth/me with the stored token.

function mockUserFromToken(token: string): User {
  return {
    id: "mock-user-1",
    address: token.startsWith("G") ? token : "GBTKU...X3QR",
    displayName: "Demo User",
    avatarInitials: "DU",
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer reads cookie once on mount; guards against SSR with
  // typeof window check so hydration stays consistent.
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return { user: null, isAuthenticated: false, isLoading: false };
    }
    const token = getCookie(TOKEN_COOKIE);
    if (token) {
      return { user: mockUserFromToken(token), isAuthenticated: true, isLoading: false };
    }
    return { user: null, isAuthenticated: false, isLoading: false };
  });

  const signIn = useCallback((token: string, user: User) => {
    setCookie(TOKEN_COOKIE, token);
    setState({ user, isAuthenticated: true, isLoading: false });
  }, []);

  const signOut = useCallback(() => {
    deleteCookie(TOKEN_COOKIE);
    setState({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
