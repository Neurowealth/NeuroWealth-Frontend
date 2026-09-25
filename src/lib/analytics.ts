/**
 * Lightweight analytics facade. All event params pass through scrubPII before
 * logging or fan-out to listeners.
 *
 * ── Safe analytics guidelines (contributors) ──────────────────────────────────
 *
 * DO track:
 *   - Event names describing user actions ("auth_sign_in", "notification_read")
 *   - Non-identifying metadata (feature flags, UI section, boolean toggles)
 *
 * DO NOT track:
 *   - Emails, names, wallet addresses, auth tokens, support message bodies
 *   - Full error messages that may contain user-entered text
 *
 * Auth events should use coarse names only; omit userId unless required — scrubPII
 * redacts keys containing "userid" but prefer event names like "auth_sign_in_failed"
 * with no params for failure cases.
 *
 * See also: src/lib/logger.ts for diagnostic logging guidelines.
 */

import { logger, scrubPII } from "./logger";
import { random } from "./seeded-rng";

export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: string;
  params?: Record<string, unknown>;
}

type EventListener = (event: AnalyticsEvent) => void;
const listeners: EventListener[] = [];

export const subscribeToEvents = (listener: EventListener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = (event: AnalyticsEvent) => {
  listeners.forEach((l) => l(event));
};

/** Allowed analytics param keys for auth flows (non-PII identifiers only). */
const AUTH_SAFE_PARAM_KEYS = new Set(["method", "provider", "step"]);

export function sanitizeAnalyticsParams(
  name: string,
  params?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!params) return undefined;

  const scrubbed = scrubPII(params) as Record<string, unknown>;

  if (name.startsWith("auth_")) {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(scrubbed)) {
      if (AUTH_SAFE_PARAM_KEYS.has(key)) {
        filtered[key] = value;
      }
    }
    return Object.keys(filtered).length > 0 ? filtered : undefined;
  }

  return scrubbed;
}

export const analytics = {
  track: (name: string, params?: Record<string, unknown>) => {
    const safeParams = sanitizeAnalyticsParams(name, params);
    const event: AnalyticsEvent = {
      id: random().toString(36).substring(7),
      name,
      timestamp: new Date().toISOString(),
      params: safeParams,
    };

    logger.info(`Analytics [${name}]`, safeParams);
    notifyListeners(event);

    if (process.env.NODE_ENV === "production") {
      // Send to real endpoint (Segment, Mixpanel, etc.)
    }
  },
};
