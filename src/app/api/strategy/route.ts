import { NextRequest, NextResponse } from "next/server";
import {
  parseStrategyKind,
  StrategyPreference,
  StrategyUpdatePayload,
} from "@/lib/strategies";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const STRATEGY_COOKIE_KEY = STORAGE_KEYS.STRATEGY_PREFERENCE;

function resolveEndpoint(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase).toString();
}

export async function GET(request: NextRequest) {
  const apiBaseUrl = process.env.NEUROWEALTH_API_BASE_URL;
  const strategyPath =
    process.env.NEUROWEALTH_STRATEGY_PATH ?? "/strategy/preference";

  if (apiBaseUrl) {
    try {
      const res = await fetch(resolveEndpoint(apiBaseUrl, strategyPath), {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = (await res.json()) as StrategyPreference;
        return NextResponse.json(data, {
          headers: { "Cache-Control": "no-store" },
        });
      }
    } catch {
      // fall through to mock
    }
  }

  const strategy = parseStrategyKind(
    request.cookies.get(STRATEGY_COOKIE_KEY)?.value ?? null,
  );
  const body: StrategyPreference = { strategy };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest) {
  const clientKey = getRateLimitKey(request);
  const rateLimitResult = checkRateLimit(`strategy:${clientKey}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000,
          ).toString(),
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      },
    );
  }

  const apiBaseUrl = process.env.NEUROWEALTH_API_BASE_URL;
  const strategyPath =
    process.env.NEUROWEALTH_STRATEGY_PATH ?? "/strategy/preference";

  const payload = (await request.json()) as Partial<StrategyUpdatePayload>;
  const strategy = parseStrategyKind(payload.strategy ?? null);

  if (!strategy) {
    return NextResponse.json(
      { message: "Invalid strategy value. Must be conservative, balanced, or growth." },
      { status: 422 },
    );
  }

  if (apiBaseUrl) {
    try {
      const res = await fetch(resolveEndpoint(apiBaseUrl, strategyPath), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ strategy }),
        cache: "no-store",
      });

      const text = await res.text();
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("Content-Type") ?? "application/json",
          "Cache-Control": "no-store",
        },
      });
    } catch {
      // fall through to mock
    }
  }

  const body: StrategyPreference = { strategy };
  const response = NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
  });
  response.cookies.set(STRATEGY_COOKIE_KEY, strategy, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}
