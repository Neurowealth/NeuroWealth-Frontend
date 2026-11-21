export type ValidationErrors<T extends string = string> = Partial<Record<T, string>>;

export function required(value: string, message: string) {
  return value.trim() ? undefined : message;
}

export function emailFormat(value: string, message: string) {
  if (!value.trim()) {
    return undefined;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? undefined
    : message;
}

export function minLength(value: string, length: number, message: string) {
  if (!value.trim()) {
    return undefined;
  }

  return value.trim().length >= length ? undefined : message;
}

export function maxLength(value: string, length: number, message: string) {
  return value.length <= length ? undefined : message;
}

export function lengthRange(
  value: string,
  minimum: number,
  maximum: number,
  message: string,
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.length >= minimum && trimmed.length <= maximum ? undefined : message;
}

export function getErrorList<T extends string>(errors: ValidationErrors<T>) {
  return Object.values(errors).filter((value): value is string => Boolean(value));
}

export function joinDescribedBy(...ids: Array<string | undefined>) {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

export async function mockAsyncCheck({
  value,
  shouldFail,
  message,
  delay = 450,
}: {
  value: string;
  shouldFail: (value: string) => boolean;
  message: string;
  delay?: number;
}) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return shouldFail(value) ? message : undefined;
}

/**
 * Debounced async validation helper to reduce race conditions.
 * Returns a function that can be called multiple times but only executes
 * the async check after the specified delay with no new calls.
 *
 * A call that is superseded by a newer one (or by `cancel()`) resolves with
 * `undefined` instead of staying pending forever, so callers awaiting it can
 * never get stuck in a "validating" state.
 */
export function createDebouncedAsyncCheck(delay: number = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let settlePending: ((result: string | undefined) => void) | null = null;
  let generation = 0;

  /** Cancel the pending timer and resolve its caller with `undefined`. */
  function cancel(): void {
    generation += 1;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (settlePending) {
      settlePending(undefined);
      settlePending = null;
    }
  }

  async function debouncedCheck({
    value,
    shouldFail,
    message,
    asyncDelay = 450,
  }: {
    value: string;
    shouldFail: (value: string) => boolean;
    message: string;
    asyncDelay?: number;
  }): Promise<string | undefined> {
    // Supersede the previous call: clear its timer and resolve its promise.
    cancel();
    const myGeneration = generation;

    return new Promise<string | undefined>((resolve) => {
      settlePending = resolve;
      timeoutId = setTimeout(async () => {
        timeoutId = null;
        // The debounce window elapsed; from here this call is only superseded
        // by a newer call's generation, not by the timer.
        if (settlePending === resolve) settlePending = null;
        const result = await mockAsyncCheck({
          value,
          shouldFail,
          message,
          delay: asyncDelay,
        });
        // A newer call (or cancel) arrived while the check was in flight.
        resolve(myGeneration === generation ? result : undefined);
      }, delay);
    });
  }

  return Object.assign(debouncedCheck, { cancel });
}

export function hasUppercase(value: string): boolean {
  return /[A-Z]/.test(value);
}

export function hasNumber(value: string): boolean {
  return /[0-9]/.test(value);
}

export function hasSpecialChar(value: string): boolean {
  return /[!@#$%^&*]/.test(value);
}
