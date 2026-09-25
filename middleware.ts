import { NextResponse, type NextRequest } from "next/server";
import {
  isAuthOnlyPath,
  isProtectedPath,
  SESSION_COOKIE_NAME,
  SIGN_IN_PATH,
  POST_SIGN_IN_PATH,
} from "./src/lib/auth-constants";

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

export function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = isSessionCookieValid(cookieValue);
  const url = request.nextUrl.clone();

  if (!authenticated && isProtectedPath(url.pathname)) {
    url.pathname = SIGN_IN_PATH;
    url.searchParams.set(
      "from",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(url);
  }

  if (authenticated && isAuthOnlyPath(url.pathname)) {
    url.pathname = POST_SIGN_IN_PATH;
    url.searchParams.delete("from");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes — redirect unauthenticated users to /login
    "/dashboard/:path*",
    "/profile",
    "/profile/:path*",
    "/settings",
    "/settings/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/login",
    "/login/:path*",
    "/signup",
    "/signup/:path*",
  ],
};
