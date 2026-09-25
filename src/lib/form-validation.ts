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
 */
export function createDebouncedAsyncCheck(delay: number = 300) {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastPromise: Promise<string | undefined> | null = null;

  return async function debouncedCheck({
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
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Return a promise that resolves after debounce delay
    lastPromise = new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        const result = await mockAsyncCheck({
          value,
          shouldFail,
          message,
          delay: asyncDelay,
        });
        resolve(result);
      }, delay);
    });

    return lastPromise;
  };
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
