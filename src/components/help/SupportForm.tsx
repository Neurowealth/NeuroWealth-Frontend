'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button, Card, FieldError, FormErrorSummary, SectionError } from '@/components/ui';
import { getErrorList, joinDescribedBy, lengthRange, maxLength, minLength, mockAsyncCheck, required, emailFormat, type ValidationErrors } from '@/lib/form-validation';

interface FormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  transactionId: string;
}

type SupportField =
  | 'name'
  | 'email'
  | 'subject'
  | 'category'
  | 'message'
  | 'transactionId'
  | 'form';

interface SubmissionState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  referenceId?: string;
}

const MAX_MESSAGE_LENGTH = 1000;
const MAX_SUBJECT_LENGTH = 100;

const categories = [
  'Technical Issue',
  'Transaction Problem',
  'Account Access',
  'Security Concern',
  'General Inquiry',
  'Feature Request',
  'Bug Report',
];

export default function SupportForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    category: 'Technical Issue',
    message: '',
    transactionId: '',
  });
  const [errors, setErrors] = useState<ValidationErrors<SupportField>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: 'idle' });

  const validateSync = () => {
    const nextErrors: ValidationErrors<SupportField> = {
      name:
        required(formData.name, 'Name is required') ||
        minLength(formData.name, 2, 'Name must be at least 2 characters'),
      email:
        required(formData.email, 'Email address is required') ||
        emailFormat(formData.email, 'Enter a valid email address'),
      subject:
        required(formData.subject, 'Subject is required') ||
        maxLength(formData.subject, MAX_SUBJECT_LENGTH, `Subject must be ${MAX_SUBJECT_LENGTH} characters or less`),
      category: required(formData.category, 'Select a support category'),
      message:
        required(formData.message, 'Message is required') ||
        lengthRange(formData.message, 10, MAX_MESSAGE_LENGTH, `Message must be between 10 and ${MAX_MESSAGE_LENGTH} characters`),
    };

    setErrors(nextErrors);
    return nextErrors;
  };

  const generateReferenceId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 7);
    return `NW-${timestamp}-${random}`.toUpperCase();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmissionState({ status: 'idle' });

    const nextErrors = validateSync();
    if (getErrorList(nextErrors).length > 0) {
      return;
    }

    setSubmissionState({ status: 'submitting' });

    const transactionError = await mockAsyncCheck({
      value: formData.transactionId.trim(),
      shouldFail: (value) => Boolean(value) && value.toLowerCase().includes('404'),
      message: 'We could not verify that transaction reference in the mock lookup.',
      delay: 500,
    });

    if (transactionError) {
      setErrors({ transactionId: transactionError });
      setSubmissionState({ status: 'idle' });
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const referenceId = generateReferenceId();
      setSubmissionState({ status: 'success', referenceId });
      setErrors({});
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'Technical Issue',
        message: '',
        transactionId: '',
      });
    } catch {
      setSubmissionState({ status: 'error' });
      setErrors({ form: 'Failed to submit support request. Please try again later.' });
    }
  };

  const contactSectionError =
    errors.name || errors.email ? 'Complete your contact details before we can respond.' : undefined;
  const requestSectionError =
    errors.subject || errors.category || errors.message || errors.transactionId
      ? 'Review the request details and fix the highlighted issues.'
      : undefined;
  const summaryErrors = submitted ? getErrorList(errors) : [];

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
  };

  if (submissionState.status === 'success') {
    return (
      <Card className="mx-auto max-w-2xl space-y-6 border-slate-700/50 bg-dark-800/80">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Support Request Submitted</h2>
          <p className="text-slate-300">Your request is in the queue and a confirmation email is on the way.</p>
        </div>
        <div className="rounded-xl border border-slate-700/50 bg-slate-950/35 p-4 text-center">
          <p className="text-sm text-slate-400">Reference ID</p>
          <p className="mt-1 font-mono text-lg text-emerald-300">{submissionState.referenceId}</p>
        </div>
        <Button onClick={() => setSubmissionState({ status: 'idle' })} variant="secondary">
          Submit Another Request
        </Button>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="space-y-6 border-slate-700/50 bg-dark-800/80">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Contact Support</h2>
          <p className="text-sm text-slate-400">
            Shared validation patterns here cover required, format, range, and async-like checks.
          </p>
        </div>

        <FormErrorSummary
          title="Please fix the support form errors below."
          errors={summaryErrors}
        />

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <SectionError title="Contact Details" message={contactSectionError}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="support-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Name
                </label>
                <input
                  id="support-name"
                  type="text"
                  value={formData.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'support-name-error' : undefined}
                  className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    errors.name ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15' : 'border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15'
                  }`}
                  placeholder="Your full name"
                />
                <FieldError id="support-name-error" message={errors.name} />
              </div>

              <div>
                <label htmlFor="support-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Email Address
                </label>
                <input
                  id="support-email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'support-email-error' : undefined}
                  className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    errors.email ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15' : 'border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15'
                  }`}
                  placeholder="name@example.com"
                />
                <FieldError id="support-email-error" message={errors.email} />
              </div>
            </div>
          </SectionError>

          <SectionError title="Request Details" message={requestSectionError}>
            <div className="space-y-5">
              <div>
                <label htmlFor="support-category" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Category
                </label>
                <select
                  id="support-category"
                  value={formData.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={errors.category ? 'support-category-error' : undefined}
                  className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    errors.category ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15' : 'border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15'
                  }`}
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-950">
                      {category}
                    </option>
                  ))}
                </select>
                <FieldError id="support-category-error" message={errors.category} />
              </div>

              <div>
                <label htmlFor="support-subject" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Subject
                </label>
                <input
                  id="support-subject"
                  type="text"
                  value={formData.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  maxLength={MAX_SUBJECT_LENGTH}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={joinDescribedBy('support-subject-hint', errors.subject ? 'support-subject-error' : undefined)}
                  className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    errors.subject ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15' : 'border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15'
                  }`}
                  placeholder="Brief description of your issue"
                />
                <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                  <span id="support-subject-hint">Required</span>
                  <span>{formData.subject.length}/{MAX_SUBJECT_LENGTH}</span>
                </div>
                <FieldError id="support-subject-error" message={errors.subject} />
              </div>

              <div>
                <label htmlFor="support-transaction-id" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Transaction ID
                </label>
                <input
                  id="support-transaction-id"
                  type="text"
                  value={formData.transactionId}
                  onChange={(event) => updateField('transactionId', event.target.value)}
                  aria-invalid={Boolean(errors.transactionId)}
                  aria-describedby={joinDescribedBy('support-transaction-hint', errors.transactionId ? 'support-transaction-error' : undefined)}
                  className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    errors.transactionId ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15' : 'border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15'
                  }`}
                  placeholder="Optional: TX-123..."
                />
                <p id="support-transaction-hint" className="mt-2 text-sm text-slate-500">
                  Async mock check: references containing <span className="font-mono">404</span> fail lookup.
                </p>
                <FieldError id="support-transaction-error" message={errors.transactionId} />
              </div>

              <div>
                <label htmlFor="support-message" className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Message
                </label>
                <textarea
                  id="support-message"
                  value={formData.message}
                  onChange={(event) => updateField('message', event.target.value)}
                  maxLength={MAX_MESSAGE_LENGTH}
                  rows={6}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={joinDescribedBy('support-message-hint', errors.message ? 'support-message-error' : undefined)}
                  className={`w-full rounded-xl border bg-slate-950/40 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                    errors.message ? 'border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/15' : 'border-slate-700/60 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15'
                  }`}
                  placeholder="Please provide details about your issue or question."
                />
                <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                  <span id="support-message-hint">Please be as detailed as possible</span>
                  <span>{formData.message.length}/{MAX_MESSAGE_LENGTH}</span>
                </div>
                <FieldError id="support-message-error" message={errors.message} />
              </div>
            </div>
          </SectionError>

          <Button type="submit" disabled={submissionState.status === 'submitting'} aria-busy={submissionState.status === 'submitting'}>
            {submissionState.status === 'submitting' ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </Card>

      <Card className="border-slate-700/50 bg-dark-800/80">
        <h3 className="mb-3 text-lg font-semibold text-white">Other Support Options</h3>
        <div className="space-y-3 text-sm text-slate-300">
          <p>Live Chat: Available 24/7 for urgent issues.</p>
          <p>Email Support: support@neurowealth.com</p>
          <p>Community Forum: Get help from other users.</p>
        </div>
      </Card>
    </div>
  );
}
