"use client";

import { useMemo, useState, type FormEvent, useRef } from "react";
import Link from "next/link";
import { Check, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/contexts";
import { mockAuditService } from "@/lib/mock-audit";
import {
  Button,
  Card,
  FieldError,
  FormErrorSummary,
  FormField,
  SectionError,
} from "@/components/ui";
import {
  emailFormat,
  getErrorList,
  joinDescribedBy,
  minLength,
  mockAsyncCheck,
  required,
  type ValidationErrors,
  createDebouncedAsyncCheck,
  hasNumber,
  hasSpecialChar,
  hasUppercase,
} from "@/lib/form-validation";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";

export const dynamic = "force-dynamic";

type SignUpField = "name" | "email" | "password" | "terms";
type SignUpState = "idle" | "loading" | "success";

function getPasswordStrength(password: string) {
  if (!password) return { level: 0, label: "", color: "" };
  if (password.length < 8) return { level: 1, label: "Weak", color: "#ef4444" };
  if (
    password.length < 12 ||
    !hasUppercase(password) ||
    !hasNumber(password)
  ) {
    return { level: 2, label: "Fair", color: "#f59e0b" };
  }
  if (!hasSpecialChar(password)) {
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
  const [submitCount, setSubmitCount] = useState(0);
  const [errors, setErrors] = useState<ValidationErrors<SignUpField>>({});
  const [emailValidating, setEmailValidating] = useState(false);
  const debouncedAsyncCheckRef = useRef(createDebouncedAsyncCheck(300));

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

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
      terms: termsAccepted
        ? undefined
        : "Accept the terms and privacy policy to continue",
    };

    setErrors(nextErrors);
    return nextErrors;
  };

  const validateEmailAsync = async (value: string) => {
    if (!value.trim()) {
      setEmailValidating(false);
      return;
    }

    setEmailValidating(true);

    const error = await debouncedAsyncCheckRef.current({
      value,
      shouldFail: (v) => v.toLowerCase().includes("taken"),
      message:
        "That email is reserved in this mock flow. Try an address without 'taken'.",
      asyncDelay: 550,
    });

    setEmailValidating(false);
    if (error) {
      setErrors((current) => ({ ...current, email: error }));
    } else {
      setErrors((current) => ({ ...current, email: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitCount((c) => c + 1);

    const nextErrors = validateSync();
    if (getErrorList(nextErrors).length > 0) {
      return;
    }

    // Wait for async validation to complete if in progress
    if (emailValidating) {
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          setEmailValidating((current) => {
            if (!current) {
              clearInterval(checkInterval);
              resolve(null);
            }
            return current;
          });
        }, 50);
      });
    }

    // Check if there are any async validation errors
    setErrors((current) => {
      if (current.email) {
        setState("idle");
        return current;
      }
      return current;
    });

    setState("loading");

    try {
      await signUp(email, name, password);
      setState("success");
      mockAuditService.logEvent("signup", {
        status: "success",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create account";
      setErrors({ email: message });
      setState("idle");
      mockAuditService.logEvent("signup", {
        status: "failed",
        reason: message,
      });
    }
  };

  const summaryErrors = useMemo(
    () => (submitted ? getErrorList(errors) : []),
    [submitted, errors],
  );
  const passwordSectionError =
    errors.password || errors.terms
      ? "Review the password rules and accept the terms before submitting."
      : undefined;
  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <main
      id={MAIN_CONTENT_LANDMARK_ID}
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#020617_0%,#0f172a_100%)] px-4 py-10"
    >
      <Card className="w-full max-w-[420px] space-y-6 border-slate-700/50 bg-dark-800/80 p-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-slate-50">Create Account</h1>
          <p className="text-sm text-slate-400">
            Join NeuroWealth and start earning automatically.
          </p>
        </header>

        <FormErrorSummary
          title="Please fix the account setup errors below."
          errors={summaryErrors}
          submitCount={submitCount}
        />

        {isSuccess ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200"
          >
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              Account created successfully. Redirecting...
            </span>
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <FormField id="signup-name" label="Full Name" error={errors.name}>
            {(controlProps) => (
              <input
                {...controlProps}
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrors((current) => ({ ...current, name: undefined }));
                }}
                disabled={isLoading || isSuccess}
                className={`w-full min-h-11 rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                  errors.name
                    ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400"
                }`}
                placeholder="John Doe"
              />
            )}
          </FormField>

          <FormField
            id="signup-email"
            label="Email Address"
            error={errors.email}
            hint={
              <>
                Async mock check: addresses containing{" "}
                <span className="font-mono">taken</span> are rejected.
              </>
            }
          >
            {(controlProps) => (
              <div className="relative">
                <input
                  {...controlProps}
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((current) => ({ ...current, email: undefined }));
                    validateEmailAsync(event.target.value);
                  }}
                  disabled={isLoading || isSuccess}
                  aria-busy={emailValidating}
                  className={`w-full min-h-11 rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    errors.email
                      ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                      : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400"
                  }`}
                  placeholder="name@example.com"
                />
                {emailValidating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
                  </div>
                )}
              </div>
            )}
          </FormField>

          <SectionError title="Password & Terms" message={passwordSectionError}>
            <div className="space-y-4">
              <FormField
                id="signup-password"
                label="Password"
                error={errors.password}
                hint={
                  password ? (
                    <div className="flex items-center gap-3">
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
                  ) : null
                }
              >
                {(controlProps) => (
                  <>
                    <input
                      {...controlProps}
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          password: undefined,
                        }));
                      }}
                      disabled={isLoading || isSuccess}
                      className={`w-full min-h-11 rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                        errors.password
                          ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500"
                          : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400"
                      }`}
                      placeholder="Create a strong password"
                    />

                    <div className="mt-3 space-y-2 rounded-xl border border-slate-700/50 bg-slate-950/35 p-4 text-sm text-slate-400">
                      {[
                        {
                          ok: password.length >= 8,
                          label: "At least 8 characters",
                        },
                        {
                          ok: hasUppercase(password),
                          label: "One uppercase letter",
                        },
                        { ok: hasNumber(password), label: "One number" },
                        {
                          ok: hasSpecialChar(password),
                          label: "One special character",
                        },
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
                  </>
                )}
              </FormField>

              <FormField id="signup-terms" error={errors.terms}>
                {(controlProps) => (
                  <label htmlFor={controlProps.id} className="flex items-start gap-3 text-sm text-slate-300">
                    <input
                      {...controlProps}
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => {
                        setTermsAccepted(event.target.checked);
                        setErrors((current) => ({
                          ...current,
                          terms: undefined,
                        }));
                      }}
                      disabled={isLoading || isSuccess}
                      className="mt-0.5 h-4 w-4 accent-sky-400"
                    />
                    <span>
                      I agree to the{" "}
                      <a
                        href="#"
                        className="font-semibold text-sky-300 hover:text-sky-200"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="font-semibold text-sky-300 hover:text-sky-200"
                      >
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                )}
              </FormField>
            </div>
          </SectionError>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading || isSuccess || emailValidating}
            aria-busy={isLoading}
            className="w-full justify-center"
          >
            {isLoading
              ? "Creating Account..."
              : isSuccess
                ? "Redirecting..."
                : "Sign Up"}
          </Button>
        </form>

        <footer className="border-t border-slate-700/50 pt-5 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-sky-300 hover:text-sky-200"
          >
            Sign in
          </Link>
        </footer>
      </Card>
    </main>
  );
}
