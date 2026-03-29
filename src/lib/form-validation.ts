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

export function matchesPattern(value: string, pattern: RegExp, message: string) {
  if (!value.trim()) {
    return undefined;
  }

  return pattern.test(value) ? undefined : message;
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
