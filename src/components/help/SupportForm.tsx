"use client";

import { useState, useMemo, type FormEvent, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import {
  Button,
  Card,
  FieldError,
  FormErrorSummary,
  FormField,
  SectionError,
} from "@/components/ui";
import {
  getErrorList,
  joinDescribedBy,
  lengthRange,
  maxLength,
  minLength,
  mockAsyncCheck,
  required,
  emailFormat,
  type ValidationErrors,
  createDebouncedAsyncCheck,
} from "@/lib/form-validation";
import { random } from "@/lib/seeded-rng";

interface FormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  transactionId: string;
}

type SupportField =
  | "name"
  | "email"
  | "subject"
  | "category"
  | "message"
  | "transactionId"
  | "form";

interface SubmissionState {
  status: "idle" | "submitting" | "success" | "error";
  referenceId?: string;
}

interface AsyncValidationState {
  transactionId: "idle" | "validating" | "done";
}

const MAX_MESSAGE_LENGTH = 1000;
const MAX_SUBJECT_LENGTH = 100;

const categories = [
  "technicalIssue",
  "transactionProblem",
  "accountAccess",
  "securityConcern",
  "generalInquiry",
  "featureRequest",
  "bugReport",
] as const;

export default function SupportForm() {
  const { messages } = useI18n();
  const t = messages.help.support;
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    category: "technicalIssue",
    message: "",
    transactionId: "",
  });
  const [errors, setErrors] = useState<ValidationErrors<SupportField>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: "idle",
  });
  const [asyncValidationState, setAsyncValidationState] =
    useState<AsyncValidationState>({ transactionId: "idle" });
  const debouncedAsyncCheckRef = useRef(createDebouncedAsyncCheck(300));

  const validateSync = () => {
    const nextErrors: ValidationErrors<SupportField> = {
      name:
        required(formData.name, t.nameRequired) ||
        minLength(formData.name, 2, t.nameMin),
      email:
        required(formData.email, t.emailRequired) ||
        emailFormat(formData.email, t.emailInvalid),
      subject:
        required(formData.subject, t.subjectRequired) ||
        maxLength(
          formData.subject,
          MAX_SUBJECT_LENGTH,
          t.subjectMax.replace("{max}", String(MAX_SUBJECT_LENGTH)),
        ),
      category: required(formData.category, t.categoryRequired),
      message:
        required(formData.message, t.messageRequired) ||
        lengthRange(
          formData.message,
          10,
          MAX_MESSAGE_LENGTH,
          t.messageRange.replace("{max}", String(MAX_MESSAGE_LENGTH)),
        ),
    };

    setErrors(nextErrors);
    return nextErrors;
  };

  const generateReferenceId = () => {
    const timestamp = Date.now().toString(36);
    const rand = random().toString(36).slice(2, 7);
    return `NW-${timestamp}-${rand}`.toUpperCase();
  };

  const validateTransactionIdAsync = async (value: string) => {
    if (!value.trim()) {
      setAsyncValidationState({ transactionId: "idle" });
      return;
    }

    setAsyncValidationState({ transactionId: "validating" });

    const error = await debouncedAsyncCheckRef.current({
      value,
      shouldFail: (v) => v.toLowerCase().includes("404"),
      message:
        t.transactionLookupFailed,
      asyncDelay: 500,
    });

    setAsyncValidationState({ transactionId: "done" });
    if (error) {
      setErrors((current) => ({ ...current, transactionId: error }));
    } else {
      setErrors((current) => ({ ...current, transactionId: undefined }));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitCount((c) => c + 1);
    setSubmissionState({ status: "idle" });

    const nextErrors = validateSync();
    if (getErrorList(nextErrors).length > 0) {
      return;
    }

    // Wait for async validation to complete if in progress
    if (asyncValidationState.transactionId === "validating") {
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          setAsyncValidationState((current) => {
            if (current.transactionId !== "validating") {
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
      if (current.transactionId) {
        setSubmissionState({ status: "idle" });
        return current;
      }
      return current;
    });

    setSubmissionState({ status: "submitting" });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const referenceId = generateReferenceId();
      setSubmissionState({ status: "success", referenceId });
      setErrors({});
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "technicalIssue",
        message: "",
        transactionId: "",
      });
    } catch {
      setSubmissionState({ status: "error" });
      setErrors({
        form: t.submitFailed,
      });
    }
  };

  const contactSectionError =
    errors.name || errors.email
      ? t.contactSectionError
      : undefined;
  const requestSectionError =
    errors.subject || errors.category || errors.message || errors.transactionId
      ? t.requestSectionError
      : undefined;
  const summaryErrors = useMemo(
    () => (submitted ? getErrorList(errors) : []),
    [submitted, errors],
  );

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));

    // Trigger async validation for transaction ID
    if (field === "transactionId") {
      validateTransactionIdAsync(value);
    }
  };

  if (submissionState.status === "success") {
    return (
      <Card className="mx-auto max-w-2xl space-y-6 border-slate-700/50 bg-dark-800/80">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {t.successTitle}
          </h2>
          <p className="text-slate-300">
            {t.successBody}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-950/35 p-4 text-center">
          <p className="text-sm text-slate-400">{t.referenceId}</p>
          <p className="mt-1 font-mono text-lg text-emerald-300">
            {submissionState.referenceId}
          </p>
        </div>
        <Button
          onClick={() => setSubmissionState({ status: "idle" })}
          variant="secondary"
        >
          {t.submitAnother}
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="space-y-6 border-slate-700/50 bg-dark-800/80">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{t.title}</h2>
          <p className="text-sm text-slate-400">
            {t.subtitle}
          </p>
        </div>

        <FormErrorSummary
          title={t.errorSummaryTitle}
          errors={summaryErrors}
          submitCount={submitCount}
        />

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <SectionError title={t.contactDetails} message={contactSectionError}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField id="support-name" label={t.nameLabel} error={errors.name}>
                {(controlProps) => (
                  <input
                    {...controlProps}
                    type="text"
                    value={formData.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                      errors.name
                        ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                        : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
                    }`}
                    placeholder={t.namePlaceholder}
                  />
                )}
              </FormField>

              <FormField id="support-email" label={t.emailLabel} error={errors.email}>
                {(controlProps) => (
                  <input
                    {...controlProps}
                    type="email"
                    value={formData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                      errors.email
                        ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                        : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
                    }`}
                    placeholder="name@example.com"
                  />
                )}
              </FormField>
            </div>
          </SectionError>

          <SectionError title={t.requestDetails} message={requestSectionError}>
            <div className="space-y-5">
              <FormField id="support-category" label={t.categoryLabel} error={errors.category}>
                {(controlProps) => (
                  <select
                    {...controlProps}
                    value={formData.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                    className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                      errors.category
                        ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                        : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
                    }`}
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-slate-950"
                      >
                        {t.categories[category]}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>

              <FormField
                id="support-subject"
                label={t.subjectLabel}
                error={errors.subject}
                hint={
                  <span className="flex items-center justify-between w-full">
                    <span>{t.subjectHint}</span>
                    <span>
                      {formData.subject.length}/{MAX_SUBJECT_LENGTH}
                    </span>
                  </span>
                }
              >
                {(controlProps) => (
                  <input
                    {...controlProps}
                    type="text"
                    value={formData.subject}
                    onChange={(event) =>
                      updateField("subject", event.target.value)
                    }
                    maxLength={MAX_SUBJECT_LENGTH}
                    className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                      errors.subject
                        ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                        : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
                    }`}
                    placeholder={t.subjectPlaceholder}
                  />
                )}
              </FormField>

              <FormField
                id="support-transaction-id"
                label={t.transactionIdLabel}
                error={errors.transactionId}
                hint={
                  <>
                    {t.transactionIdHintBefore}{" "}
                    <span className="font-mono">404</span> {t.transactionIdHintAfter}
                  </>
                }
              >
                {(controlProps) => (
                  <div className="relative">
                    <input
                      {...controlProps}
                      type="text"
                      value={formData.transactionId}
                      onChange={(event) =>
                        updateField("transactionId", event.target.value)
                      }
                      aria-busy={
                        asyncValidationState.transactionId === "validating"
                      }
                      className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                        errors.transactionId
                          ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                          : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
                      }`}
                      placeholder={t.transactionIdPlaceholder}
                    />
                    {asyncValidationState.transactionId === "validating" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
                      </div>
                    )}
                  </div>
                )}
              </FormField>

              <FormField
                id="support-message"
                label={t.messageLabel}
                error={errors.message}
                hint={
                  <span className="flex items-center justify-between w-full">
                    <span>
                      {t.messageHint}
                    </span>
                    <span>
                      {formData.message.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </span>
                }
              >
                {(controlProps) => (
                  <textarea
                    {...controlProps}
                    value={formData.message}
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    maxLength={MAX_MESSAGE_LENGTH}
                    rows={6}
                    className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                      errors.message
                        ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                        : "border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15"
                    }`}
                    placeholder={t.messagePlaceholder}
                  />
                )}
              </FormField>
            </div>
          </SectionError>

          <Button
            type="submit"
            disabled={
              submissionState.status === "submitting" ||
              asyncValidationState.transactionId === "validating"
            }
            aria-busy={submissionState.status === "submitting"}
          >
            {submissionState.status === "submitting"
              ? t.submitting
              : t.submit}
          </Button>
        </form>
      </Card>

      <Card className="border-slate-700/50 bg-dark-800/80">
        <h3 className="mb-3 text-lg font-semibold text-white">
          {t.otherOptions}
        </h3>
        <div className="space-y-3 text-sm text-slate-300">
          <p>{t.liveChat}</p>
          <p>{t.emailSupport}</p>
          <p>{t.forum}</p>
        </div>
      </Card>
    </div>
  );
}
