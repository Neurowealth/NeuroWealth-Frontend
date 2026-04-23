"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Zap } from "lucide-react";

export default function LoginPage() {
  const { signIn, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, bounce to dashboard
  useEffect(() => {
    if (isAuthenticated) router.replace(from);
  }, [isAuthenticated, router, from]);

  const handleDemoSignIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production: call POST /api/auth/login and receive a real JWT.
      // For now we use a deterministic mock token.
      await new Promise((r) => setTimeout(r, 800)); // simulate network latency
      const mockToken = "GBTKU_DEMO_TOKEN_X3QR";
      signIn(mockToken, {
        id: "demo-user",
        address: "GBTKU...X3QR",
        displayName: "Demo User",
        avatarInitials: "DU",
      });
      router.replace(from);
    } catch {
      setError("Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [signIn, router, from]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-text-primary">
            NeuroWealth
          </span>
        </div>

        {/* Card */}
        <div className="card space-y-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Sign in to your account
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Connect your wallet to access your dashboard.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error"
            >
              {error}
            </div>
          )}

          {/* Demo sign-in */}
          <button
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
            aria-label="Continue with demo account"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Connecting…
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" aria-hidden="true" />
                Continue with Demo Account
              </>
            )}
          </button>

          <p className="text-center text-xs text-text-muted">
            Wallet integration (Freighter) coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
