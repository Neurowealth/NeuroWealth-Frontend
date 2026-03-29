"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockAudit } from "@/lib/mock-audit";
import { Button, Card, FieldError, FormErrorSummary } from "@/components/ui";
import {
  emailFormat,
  getErrorList,
  joinDescribedBy,
  minLength,
  required,
  type ValidationErrors,
} from "@/lib/form-validation";

type SignInField = "email" | "password" | "form";
type SignInState = "idle" | "loading" | "success";

export default function SignInPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<SignInState>("idle");
  const [errors, setErrors] = useState<ValidationErrors<SignInField>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const nextErrors: ValidationErrors<SignInField> = {
      email:
        required(email, "Email address is required") ||
        emailFormat(email, "Enter a valid email address"),
      password:
        required(password, "Password is required") ||
        minLength(password, 8, "Password must be at least 8 characters"),
    };

    setErrors(nextErrors);
    return getErrorList(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setErrors({});

    if (!validate()) {
      return;
    }

    setState("loading");

    try {
      await signIn(email, password);
      setState("success");
      mockAudit.logEvent("login", { email, timestamp: new Date().toISOString() });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Invalid email or password";
      const nextErrors: ValidationErrors<SignInField> = {
        form: message,
        password: "Check your password and try the mock credentials again.",
      };
      setErrors(nextErrors);
      setState("idle");
      mockAudit.logEvent("login", { email, status: "failed", reason: message });
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setErrors((current) => ({ ...current, email: undefined, form: undefined }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((current) => ({ ...current, password: undefined, form: undefined }));
  };

  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const summaryErrors = submitted ? getErrorList(errors) : [];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4 py-10">
      <Card className="w-full max-w-md space-y-6 border-slate-700/50 bg-dark-800/80 p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-50">Welcome Back</h1>
          <p className="text-sm text-slate-400">
            Sign in to manage your AI-powered yield strategy.
          </p>
        </header>

        <FormErrorSummary
          title="Please fix the sign-in errors below."
          errors={summaryErrors}
        />

        {isSuccess ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Sign in successful. Redirecting...</span>
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              placeholder="name@example.com"
              disabled={isLoading || isSuccess}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={joinDescribedBy("signin-email-hint", errors.email ? "signin-email-error" : undefined)}
              className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                errors.email
                  ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                  : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
              }`}
            />
            <p id="signin-email-hint" className="mt-2 text-sm text-slate-500">
              Use the email tied to your NeuroWealth account.
            </p>
            <FieldError id="signin-email-error" message={errors.email} />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => handlePasswordChange(event.target.value)}
              placeholder="password123"
              disabled={isLoading || isSuccess}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={joinDescribedBy(
                "signin-password-hint",
                errors.password ? "signin-password-error" : undefined,
              )}
              className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                errors.password
                  ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                  : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
              }`}
            />
            <p id="signin-password-hint" className="mt-2 text-sm text-slate-500">
              Mock login password: <span className="font-mono text-slate-300">password123</span>
            </p>
            <FieldError id="signin-password-error" message={errors.password} />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading || isSuccess}
            aria-busy={isLoading}
            className="w-full justify-center"
          >
            {isLoading ? "Signing in..." : isSuccess ? "Redirecting..." : "Sign In"}
          </Button>
        </form>

        <footer className="border-t border-slate-700/50 pt-5 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-sky-300 hover:text-sky-200">
            Sign Up
          </Link>
        </footer>
      </Card>
    </main>
  );
}
