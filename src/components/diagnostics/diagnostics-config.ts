import type { User } from "../../types/user";
import { scrubPII, type LogEntry } from "../../lib/logger";

export interface DiagnosticsBuildEnv {
  NODE_ENV?: string;
  NEXT_PUBLIC_APP_ENV?: string;
  NEXT_PUBLIC_ENABLE_DIAGNOSTICS?: string;
}

export const REDACTED_VALUE = "[redacted]";

/**
 * Diagnostics require an explicit opt-in build flag (`NEXT_PUBLIC_ENABLE_DIAGNOSTICS=true`)
 * and are unconditionally disabled in production builds or production app environments.
 */
export function isDiagnosticsBuildEnabled(
  env: DiagnosticsBuildEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_ENABLE_DIAGNOSTICS: process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS,
  },
): boolean {
  if (env.NODE_ENV === "production") {
    return false;
  }

  if (env.NEXT_PUBLIC_APP_ENV?.toLowerCase() === "production") {
    return false;
  }

  return env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS === "true";
}

/**
 * Diagnostics panel access requires both the opt-in build flag and an
 * authenticated admin user.
 */
export function canAccessDiagnostics(
  user: Pick<User, "role"> | null | undefined,
  env?: DiagnosticsBuildEnv,
): boolean {
  if (!isDiagnosticsBuildEnabled(env)) {
    return false;
  }

  return user?.role === "admin";
}

export function redactDiagnosticLog(entry: LogEntry): LogEntry {
  return {
    ...entry,
    message: String(scrubPII(entry.message)),
    context: entry.context === undefined ? undefined : scrubPII(entry.context),
  };
}

export function getRedactedDiagnosticsEnv(): {
  nodeEnv: string;
  userAgent: string;
} {
  return {
    nodeEnv: REDACTED_VALUE,
    userAgent: REDACTED_VALUE,
  };
}
