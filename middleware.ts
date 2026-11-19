import { NextResponse, type NextRequest } from "next/server";
import {
  isAuthOnlyPath,
  isProtectedPath,
  SESSION_COOKIE_NAME,
  SIGN_IN_PATH,
  POST_SIGN_IN_PATH,
} from "./src/lib/auth-constants";
import { isSessionCookieValid } from "./src/lib/api-auth";

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
