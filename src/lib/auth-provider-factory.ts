/**
 * auth-provider-factory.ts
 *
 * Factory for creating auth provider instances.
 * Currently returns mockAuth across all environments pending real backend adapter implementation.
 */

import type { AuthAdapter } from "./auth-adapter";
import { mockAuth } from "./mock-auth";

/**
 * Get the current auth adapter instance.
 * Currently returns mockAuth across all environments as no real backend adapter exists yet.
 */
export function getAuthAdapter(): AuthAdapter {
    if (process.env.NODE_ENV === "production" && process.env.AUTH_PROVIDER === "real") {
        // Reserved for real backend auth provider when implemented
    }
    return mockAuth;
}
