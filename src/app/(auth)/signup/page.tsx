"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockAudit } from "@/lib/mock-audit";
import { Button, Card, FieldError, FormErrorSummary, SectionError } from "@/components/ui";
import {
  emailFormat,
  getErrorList,
  joinDescribedBy,
  minLength,
  mockAsyncCheck,
  required,
  type ValidationErrors,
} from "@/lib/form-validation";

type SignUpField = "name" | "email" | "password" | "terms";
type SignUpState = "idle" | "loading" | "success";

function getPasswordStrength(password: string) {
  if (!password) return { level: 0, label: "", color: "" };
  if (password.length < 8) return { level: 1, label: "Weak", color: "#ef4444" };
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { level: 2, label: "Fair", color: "#f59e0b" };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { level: 3, label: "Good", color: "#3b82f6" };
  }
  return { level: 4, label: "Strong", color: "#10b981" };
}

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [state, setState] = useState<SignUpState>("idle");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors<SignUpField>>({});

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const validateSync = () => {
    const nextErrors: ValidationErrors<SignUpField> = {
      name:
        required(name, "Full name is required") ||
        minLength(name, 2, "Name must be at least 2 characters"),
      email:
        required(email, "Email address is required") ||
        emailFormat(email, "Enter a valid email address"),
      password:
        required(password, "Password is required") ||
        minLength(password, 8, "Password must be at least 8 characters"),
      terms: termsAccepted ? undefined : "Accept the terms and privacy policy to continue",
    };

    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validateSync();
    if (getErrorList(nextErrors).length > 0) {
      return;
    }

    setState("loading");

    const asyncEmailError = await mockAsyncCheck({
      value: email,
      shouldFail: (value) => value.toLowerCase().includes("taken"),
      message: "That email is reserved in this mock flow. Try an address without 'taken'.",
      delay: 550,
    });

    if (asyncEmailError) {
      setErrors({ email: asyncEmailError });
      setState("idle");
      return;
    }

    try {
      await signUp(email, name, password);
      setState("success");
      mockAudit.logEvent("signup", { email, name, timestamp: new Date().toISOString() });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create account";
      setErrors({ email: message });
      setState("idle");
      mockAudit.logEvent("signup", { email, status: "failed", reason: message });
    }
  };

  const summaryErrors = submitted ? getErrorList(errors) : [];
  const passwordSectionError =
    errors.password || errors.terms
      ? "Review the password rules and accept the terms before submitting."
      : undefined;
  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4 py-10">
      <Card className="w-full max-w-xl space-y-6 border-slate-700/50 bg-dark-800/80 p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-50">Create Account</h1>
          <p className="text-sm text-slate-400">
            Join NeuroWealth and start earning automatically.
          </p>
        </header>

        <FormErrorSummary
          title="Please fix the account setup errors below."
          errors={summaryErrors}
        />

        {isSuccess ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Account created successfully. Redirecting...</span>
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              disabled={isLoading || isSuccess}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "signup-name-error" : undefined}
              className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                errors.name
                  ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                  : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
              }`}
              placeholder="John Doe"
            />
            <FieldError id="signup-name-error" message={errors.name} />
          </div>

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
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              disabled={isLoading || isSuccess}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={joinDescribedBy(
                "signup-email-hint",
                errors.email ? "signup-email-error" : undefined,
              )}
              className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                errors.email
                  ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                  : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
              }`}
              placeholder="name@example.com"
            />
            <p id="signup-email-hint" className="mt-2 text-sm text-slate-500">
              Async mock check: addresses containing <span className="font-mono">taken</span> are rejected.
            </p>
            <FieldError id="signup-email-error" message={errors.email} />
          </div>

          <SectionError title="Password & Terms" message={passwordSectionError}>
            <div className="space-y-4">
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
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((current) => ({ ...current, password: undefined }));
                  }}
                  disabled={isLoading || isSuccess}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={joinDescribedBy(
                    "signup-password-strength",
                    errors.password ? "signup-password-error" : undefined,
                  )}
                  className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    errors.password
                      ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                      : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
                  }`}
                  placeholder="Create a strong password"
                />
                <FieldError id="signup-password-error" message={errors.password} />

                {password ? (
                  <div
                    id="signup-password-strength"
                    className="mt-3 flex items-center gap-3"
                  >
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(passwordStrength.level / 4) * 100}%`,
                          backgroundColor: passwordStrength.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                ) : null}

                <div className="mt-3 space-y-2 rounded-xl border border-slate-700/50 bg-slate-950/35 p-4 text-sm text-slate-400">
                  {[
                    { ok: password.length >= 8, label: "At least 8 characters" },
                    { ok: /[A-Z]/.test(password), label: "One uppercase letter" },
                    { ok: /[0-9]/.test(password), label: "One number" },
                    { ok: /[!@#$%^&*]/.test(password), label: "One special character" },
                  ].map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-2 ${rule.ok ? "text-emerald-300" : "text-slate-500"}`}
                    >
                      {rule.ok ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <X className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm text-slate-300">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => {
                      setTermsAccepted(event.target.checked);
                      setErrors((current) => ({ ...current, terms: undefined }));
                    }}
                    disabled={isLoading || isSuccess}
                    aria-invalid={Boolean(errors.terms)}
                    aria-describedby={errors.terms ? "signup-terms-error" : undefined}
                    className="mt-0.5 h-4 w-4 accent-sky-400"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="font-semibold text-sky-300 hover:text-sky-200">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="font-semibold text-sky-300 hover:text-sky-200">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                <FieldError id="signup-terms-error" message={errors.terms} />
              </div>
            </div>
          </SectionError>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading || isSuccess}
            aria-busy={isLoading}
            className="w-full justify-center"
          >
            {isLoading ? "Creating Account..." : isSuccess ? "Redirecting..." : "Sign Up"}
          </Button>
        </form>

        <footer className="border-t border-slate-700/50 pt-5 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-sky-300 hover:text-sky-200">
            Sign In
          </Link>
        </footer>
      </Card>
    </main>
  );
}
