"use client";

import { ReactNode } from "react";
import { FieldError } from "./FormErrors";
import { cn } from "@/lib/utils";
import { joinDescribedBy } from "@/lib/form-validation";

interface FormFieldProps {
  id: string;
  label?: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: (props: FormFieldControlProps) => ReactNode;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  hintClassName?: string;
  errorClassName?: string;
  errorIcon?: boolean;
  errorCompact?: boolean;
}

export interface FormFieldControlProps {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
}

/**
 * Shared form field wrapper that unifies label/control id wiring and aria state.
 * Keeps the control ids and helper-text ids aligned so inline forms and wrapped
 * forms do not drift apart.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  children,
  required = false,
  className = "",
  labelClassName = "mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300",
  hintClassName = "mt-2 text-sm text-slate-500",
  errorClassName = "",
  errorIcon = true,
  errorCompact = false,
}: FormFieldProps) {
  const { errorId, describedBy, hintId, invalid } = getFormFieldA11yProps({
    id,
    error,
    hint: Boolean(hint),
  });
  const controlProps: FormFieldControlProps = {
    id,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={labelClassName}
        >
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
      )}
      {children(controlProps)}
      {hint && (
        <p id={hintId} className={cn(hintClassName)}>
          {hint}
        </p>
      )}
      {errorId && (
        <FieldError
          id={errorId}
          message={error}
          icon={errorIcon}
          compact={errorCompact}
          className={errorClassName}
        />
      )}
    </div>
  );
}

export function getFormFieldA11yProps({
  id,
  error,
  hint,
}: {
  id: string;
  error?: string;
  hint?: boolean;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return {
    id,
    hintId,
    errorId,
    describedBy: joinDescribedBy(hintId, errorId),
    invalid: Boolean(error),
  };
}
