import { InputHTMLAttributes, forwardRef, useId } from "react";

type InputVariant = "default" | "error" | "success";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  variant?: InputVariant;
}

const inputVariants: Record<InputVariant, string> = {
  default:
    "border-slate-200 focus:border-brand-500 focus:ring-brand-500/20 " +
    "dark:border-white/10 dark:focus:border-brand-500 dark:focus:ring-brand-500/20",
  error:
    "border-accent-red focus:border-accent-red focus:ring-red-400/20 " +
    "dark:border-red-400/60 dark:focus:border-accent-red",
  success:
    "border-brand-500 focus:border-brand-500 focus:ring-brand-500/20 " +
    "dark:border-brand-500/60 dark:focus:border-brand-500",
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    variant = "default",
    className = "",
    id,
    "aria-describedby": ariaDescribedByProp,
    "aria-invalid": ariaInvalidProp,
    ...props
  },
  ref
) {
  const defaultId = useId();
  const inputId = id ?? defaultId;
  const resolvedVariant: InputVariant = error ? "error" : variant;

  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = !error && hint ? `${inputId}-hint` : undefined;
  const describedById = errorId || hintId;
  const ariaDescribedBy = [ariaDescribedByProp, describedById]
    .filter(Boolean)
    .join(" ") || undefined;
  const ariaInvalid = error ? true : ariaInvalidProp;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-dark-800 dark:text-white dark:placeholder-slate-500 ${inputVariants[resolvedVariant]} ${className}`}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-accent-red">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export { Input };
