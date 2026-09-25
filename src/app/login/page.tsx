"use client";

import { isValidRedirect } from "./utils";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";
import { Loader2, Zap, Eye, EyeOff, Github, Chrome } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/FormField";

export const dynamic = "force-dynamic";

type LoginState = "idle" | "loading" | "error" | "success";



function LoginContent() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const rawFrom = searchParams.get("from") ?? "/dashboard";
  const from = isValidRedirect(rawFrom) ? rawFrom : "/dashboard";

  const [state, setState] = useState<LoginState>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace(from);
    }
  }, [loading, user, router, from]);

  const validate = useCallback(() => {
    let valid = true;
    if (!email) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      if (!validate()) return;

      setState("loading");
      try {
        await new Promise((r) => setTimeout(r, 900));
        // Mock: treat demo credentials as valid
        if (
          email === "demo@neurowealth.app" ||
          password === "password123"
        ) {
          await signIn(email, password);
          setState("success");
          setTimeout(() => router.replace(from), 800);
        } else {
          setState("error");
          setFormError("Invalid credentials. Try demo@neurowealth.app / password123.");
        }
      } catch {
        setState("error");
        setFormError("Sign-in failed. Please try again.");
      }
    },
    [email, password, signIn, router, from, validate],
  );

  const handleDemoFill = () => {
    setEmail("demo@neurowealth.app");
    setPassword("password123");
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);
    setState("idle");
  };

  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <main
      id={MAIN_CONTENT_LANDMARK_ID}
      tabIndex={-1}
      className="min-h-screen bg-app-bg flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-text-primary">NeuroWealth</span>
        </div>

        <div className="card space-y-6">
          {/* Heading */}
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              Sign in to your account
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Connect your wallet or use a demo account.
            </p>
          </div>

          {/* Success state */}
          {isSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
              Signed in! Redirecting…
            </div>
          )}

          {/* Form error (invalid credentials) */}
          {state === "error" && formError && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-lg bg-error/10 border border-error/20 px-4 py-3 text-sm text-error"
            >
              {formError}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField
              id="email"
              label="Email address"
              error={emailError ?? undefined}
              className="space-y-1"
              labelClassName="block text-sm font-medium text-text-primary"
              errorCompact
              errorIcon={false}
            >
              {({ id, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid }) => (
                <input
                  id={id}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                    setFormError(null);
                    if (state === "error") setState("idle");
                  }}
                  disabled={isLoading || isSuccess}
                  aria-describedby={ariaDescribedBy}
                  aria-invalid={ariaInvalid}
                  placeholder="you@example.com"
                  className={cn(
                    "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors",
                    "focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
                    emailError
                      ? "border-error focus:ring-error/30"
                      : "border-border",
                    (isLoading || isSuccess) && "opacity-50 cursor-not-allowed",
                  )}
                />
              )}
            </FormField>

            <FormField
              id="password"
              label="Password"
              error={passwordError ?? undefined}
              className="space-y-1"
              labelClassName="block text-sm font-medium text-text-primary"
              errorCompact
              errorIcon={false}
            >
              {({ id, "aria-describedby": ariaDescribedBy, "aria-invalid": ariaInvalid }) => (
                <div className="relative">
                  <input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(null);
                      setFormError(null);
                      if (state === "error") setState("idle");
                    }}
                    disabled={isLoading || isSuccess}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={ariaInvalid}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-lg border bg-surface px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors",
                      "focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
                      passwordError
                        ? "border-error focus:ring-error/30"
                        : "border-border",
                      (isLoading || isSuccess) && "opacity-50 cursor-not-allowed",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </FormField>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              data-qa="login-submit-button"
              className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px] text-sm"
              aria-label="Sign in"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : isSuccess ? (
                <>
                  <Zap className="w-4 h-4" aria-hidden="true" />
                  Redirecting…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-text-muted">or continue with</span>
            </div>
          </div>

          {/* Social providers — disabled until providers are implemented */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled
              title="Google sign-in coming soon"
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 min-h-[44px] text-sm text-text-muted cursor-not-allowed opacity-50"
              aria-label="Sign in with Google (coming soon)"
            >
              <Chrome className="w-4 h-4 shrink-0" aria-hidden="true" />
              Google
            </button>
            <button
              type="button"
              disabled
              title="GitHub sign-in coming soon"
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 min-h-[44px] text-sm text-text-muted cursor-not-allowed opacity-50"
              aria-label="Sign in with GitHub (coming soon)"
            >
              <Github className="w-4 h-4 shrink-0" aria-hidden="true" />
              GitHub
            </button>
          </div>

          {/* Demo shortcut */}
          <p className="text-center text-xs text-text-muted">
            No account?{" "}
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-primary underline-offset-2 hover:underline"
            >
              Fill demo credentials
            </button>
          </p>

          <p className="text-center text-xs text-text-muted">
            Wallet integration (Freighter) coming soon.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
