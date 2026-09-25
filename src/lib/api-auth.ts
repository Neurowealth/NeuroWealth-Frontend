/**
 * Shared authentication helpers for API route handlers.
 *
 * These functions provide session validation for API routes, ensuring that
 * only authenticated users can access protected endpoints. They reuse the
 * same session cookie validation logic as middleware.ts.
 */

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "./auth-constants";

interface RequireAuthOptions {
  /** Enforce same-origin browser requests for state-changing endpoints. */
  requireSameOrigin?: boolean;
}

/**
 * Checks cookie shape and expiry only — no signature verification.
 *
 * This is intentionally deferred while auth is mock-only (see the "Production-
 * Ready httpOnly Cookie Flow" notes on SESSION_COOKIE_NAME in auth-constants.ts
 * and the AUTH_SECRET note in docs/env.md). Because the cookie is set by
 * client-side JS with no signature, it does not prove the session is genuine —
 * treat this guard as a UX redirect, not a security boundary, until real JWT
 * signing/verification is wired in ahead of backend auth integration.
 */
export function isSessionCookieValid(rawCookie: string | undefined): boolean {
  if (!rawCookie) return false;

  try {
    const session = JSON.parse(decodeURIComponent(rawCookie)) as {
      token?: string;
      expiresAt?: number;
    };

    return (
      typeof session.token === "string" &&
      typeof session.expiresAt === "number" &&
      Date.now() < session.expiresAt
    );
  } catch {
    return false;
  }
}

/**
 * Validates the session cookie from a NextRequest.
 * Returns the session data if valid, null otherwise.
 */
export function getSessionFromRequest(request: NextRequest): {
  token?: string;
  expiresAt?: number;
} | null {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  
  if (!cookieValue) return null;

  try {
    const session = JSON.parse(decodeURIComponent(cookieValue)) as {
      token?: string;
      expiresAt?: number;
    };

    if (
      typeof session.token === "string" &&
      typeof session.expiresAt === "number" &&
      Date.now() < session.expiresAt
    ) {
      return session;
    }
  } catch {
    // Invalid JSON format
  }

  return null;
}

/**
 * Requires authentication for an API route handler.
 * Returns a 401 response if the session is invalid, null if valid.
 *
 * Usage:
 *   export async function GET(request: NextRequest) {
 *     const authError = requireAuth(request);
 *     if (authError) return authError;
 *     
 *     // Proceed with authenticated request
 *   }
 */
export function requireAuth(
  request: NextRequest,
  { requireSameOrigin = false }: RequireAuthOptions = {},
): NextResponse | null {
  const session = getSessionFromRequest(request);
  
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required. Please sign in to access this resource.",
        },
      },
      { status: 401 }
    );
  }

  if (requireSameOrigin) {
    const origin = request.headers.get("origin");
    const expectedOrigin = request.nextUrl.origin;
    const fetchSite = request.headers.get("sec-fetch-site");

    // Fail closed: a missing Origin is rejected rather than assumed same-origin.
    // Browsers always send Origin on POST/PUT/PATCH/DELETE, which are the only
    // methods that opt into this check.
    if (origin !== expectedOrigin || fetchSite === "cross-site") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Cross-origin requests are not allowed.",
          },
        },
        { status: 403 },
      );
    }
  }

  return null;
}
