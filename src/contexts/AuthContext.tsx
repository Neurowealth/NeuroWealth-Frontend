"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthSession, mockAuth } from "@/lib/mock-auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const session = mockAuth.getSession();
    return session ? session.user : null;
  });
  const [loading] = useState(false);
  const router = useRouter();

  const signIn = async (email: string, password: string) => {
    const session = await mockAuth.signIn(email, password);
    setUser(session.user);
    router.push("/dashboard");
  };

  const signUp = async (email: string, name: string, password: string) => {
    const session = await mockAuth.signUp(email, name, password);
    setUser(session.user);
    router.push("/dashboard");
  };

  const signOut = () => {
    mockAuth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
