/**
 * Single source of truth for auth-related constants.
 *
 * Both middleware (Edge runtime) and client-side code import from here,
 * so the cookie name, storage key, and redirect paths are never duplicated.
 */

/** localStorage key used by mock-auth to persist the session */
export const SESSION_STORAGE_KEY = "neurowealth_session" as const;

/**
 * Cookie name written by middleware / login handler.
 * Must match what middleware reads and what the login API sets.
 *
 * PRODUCTION DESIGN NOTES:
 * 
 * Current Implementation (Demo):
 * - Non-httpOnly cookie containing session data for middleware access
 * - Session stored in localStorage for client-side auth state
 * - Cookie mirrors localStorage for Edge runtime compatibility
 * 
 * Production-Ready httpOnly Cookie Flow:
 * 
 * 1. Authentication Flow:
 *    - POST /api/auth/signin with credentials
 *    - Server validates credentials against database/auth service
 *    - Server generates secure session token (JWT or opaque token)
 *    - Server sets httpOnly, Secure, SameSite=Strict cookie
 *    - Server returns user data (no sensitive session info)
 * 
 * 2. Session Management:
 *    - Cookie: httpOnly, Secure, SameSite=Strict, expires=7d
 *    - Server-side session store (Redis, database, or JWT validation)
 *    - No client-side session storage (localStorage removed)
 * 
 * 3. Middleware Changes:
 *    - Read httpOnly cookie value
 *    - Validate token against session store or JWT signature
 *    - No JSON parsing of cookie content (opaque token)
 * 
 * 4. Client-Side Changes:
 *    - Remove localStorage session management
 *    - Add GET /api/auth/me endpoint for user data
 *    - AuthContext calls /api/auth/me on mount to get user state
 *    - Sign-out calls POST /api/auth/signout to clear server session
 * 
 * 5. Security Benefits:
 *    - Session token not accessible to JavaScript (XSS protection)
 *    - Secure flag prevents transmission over HTTP
 *    - SameSite=Strict prevents CSRF attacks
 *    - Server-side session invalidation
 *    - No sensitive data in client storage
 * 
 * Implementation Steps:
 * 1. Create /api/auth/signin, /api/auth/signout, /api/auth/me endpoints
 * 2. Set up server-side session store (Redis recommended)
 * 3. Update middleware to validate opaque tokens
 * 4. Update AuthContext to use API endpoints instead of localStorage
 * 5. Remove localStorage session management
 * 6. Update cookie settings to httpOnly, Secure, SameSite=Strict
 */
export const SESSION_COOKIE_NAME = "nw_session" as const;

/** Where to send unauthenticated users */
export const SIGN_IN_PATH = "/login" as const;

/** Where to land after a successful sign-in */
export const POST_SIGN_IN_PATH = "/dashboard" as const;

/** Routes that require an authenticated session 
 * 
 * /onboarding is included because:
 * - Onboarding progress should be associated with a user account
 * - Wallet connections and investment preferences need user context
 * - Prevents anonymous users from accessing onboarding flow
 * - Users should sign in first, then complete onboarding
 */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/onboarding",
] as const;

/** Routes that should redirect authenticated users away (e.g. /login → /dashboard) */
export const AUTH_ONLY_PATHS = ["/login", "/signup"] as const;

/** Checks whether a pathname requires authentication */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Checks whether a pathname should redirect already-authenticated users */
export function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}
