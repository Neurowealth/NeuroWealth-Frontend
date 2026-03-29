"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type ToastVariant = "success" | "info" | "warning" | "error";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastRecord extends Required<Pick<ToastInput, "title" | "variant">> {
  id: string;
  description?: string;
  duration: number;
}

interface ToastContextValue {
  toasts: ToastRecord[];
  limit: number;
  setLimit: (nextLimit: number) => void;
  pushToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
}

const DEFAULT_DURATION = 4500;
const MIN_DURATION = 3000;
const MAX_DURATION = 6000;

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<
  ToastVariant,
  {
    accent: string;
    icon: typeof CheckCircle2;
    label: string;
    role: "status" | "alert";
  }
> = {
  success: {
    accent: "border-emerald-400/35 bg-emerald-500/12 text-emerald-50",
    icon: CheckCircle2,
    label: "Success",
    role: "status",
  },
  info: {
    accent: "border-sky-400/35 bg-sky-500/12 text-sky-50",
    icon: Info,
    label: "Info",
    role: "status",
  },
  warning: {
    accent: "border-amber-400/35 bg-amber-500/12 text-amber-50",
    icon: AlertTriangle,
    label: "Warning",
    role: "alert",
  },
  error: {
    accent: "border-red-400/35 bg-red-500/12 text-red-50",
    icon: AlertCircle,
    label: "Error",
    role: "alert",
  },
};

function clampDuration(value?: number) {
  if (!value) {
    return DEFAULT_DURATION;
  }

  return Math.min(MAX_DURATION, Math.max(MIN_DURATION, value));
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const { accent, icon: Icon, label, role } = variantStyles[toast.variant];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(toast.duration);
  const startedAtRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingRef.current);
  };

  const pauseTimer = () => {
    if (!timerRef.current || startedAtRef.current === null) {
      return;
    }

    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    startedAtRef.current = null;
    clearTimer();
  };

  useEffect(() => {
    clearTimer();
    remainingRef.current = toast.duration;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingRef.current);

    return () => {
      clearTimer();
    };
  }, [onDismiss, toast.duration, toast.id]);

  return (
    <section
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={`pointer-events-auto w-full rounded-2xl border shadow-card backdrop-blur ${accent}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onFocusCapture={pauseTimer}
      onBlurCapture={startTimer}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 rounded-full bg-black/15 p-2">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{toast.title}</p>
          {toast.description ? (
            <p className="mt-1 text-sm leading-6 text-white/80">{toast.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-full border border-white/15 bg-black/15 p-2 text-white/70 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label={`Close ${toast.title} notification`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4 sm:justify-end"
      aria-label="Notifications"
    >
      <div className="flex w-full max-w-md flex-col gap-3">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

export function ToastProvider({
  children,
  defaultLimit = 3,
}: {
  children: ReactNode;
  defaultLimit?: number;
}) {
  const baseId = useId();
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [limit, setLimitState] = useState(defaultLimit);
  const countRef = useRef(0);

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const setLimit = (nextLimit: number) => {
    const safeLimit = Math.min(5, Math.max(1, nextLimit));
    setLimitState(safeLimit);
    setToasts((current) => current.slice(0, safeLimit));
  };

  const pushToast = ({ title, description, variant = "info", duration }: ToastInput) => {
    countRef.current += 1;
    const id = `${baseId}-${countRef.current}`;
    const toast: ToastRecord = {
      id,
      title,
      description,
      variant,
      duration: clampDuration(duration),
    };

    setToasts((current) => [toast, ...current].slice(0, limit));
    return id;
  };

  return (
    <ToastContext.Provider value={{ toasts, limit, setLimit, pushToast, dismissToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
