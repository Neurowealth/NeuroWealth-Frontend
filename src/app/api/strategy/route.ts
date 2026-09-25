import { NextRequest, NextResponse } from "next/server";
import {
  parseStrategyKind,
  StrategyPreference,
} from "@/lib/strategies";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import {
  ERROR_CODE,
  HTTP_STATUS,
  errorResponse,
  readJsonBody,
  successResponse,
} from "@/lib/api-response";
import { strategyUpdateSchema, zodErrorToDetails } from "@/lib/validation/api";
import { createServerFetcher } from "@/lib/api-client";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/api-auth";

const STRATEGY_COOKIE_KEY = STORAGE_KEYS.STRATEGY_PREFERENCE;

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const strategyPath =
    process.env.NEUROWEALTH_STRATEGY_PATH ?? "/strategy/preference";
  const fetchBackend = createServerFetcher();

  if (fetchBackend) {
    try {
      const res = await fetchBackend(strategyPath, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = (await res.json()) as StrategyPreference;
        return NextResponse.json(successResponse(data), {
          headers: { "Cache-Control": "no-store" },
        });
      }
    } catch {
      // fall through to local fallback
    }
  }

  const strategy = parseStrategyKind(
    request.cookies.get(STRATEGY_COOKIE_KEY)?.value ?? null,
  );
  return NextResponse.json(successResponse<StrategyPreference>({ strategy }), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request, { requireSameOrigin: true });
  if (authError) return authError;

  const ip = getRateLimitKey(request);
  const limit = checkRateLimit(`PUT:/api/strategy:${ip}`, {
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      errorResponse(ERROR_CODE.RATE_LIMITED, "Too many requests. Please try again later."),
      {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
      },
    );
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;

  const parsed = strategyUpdateSchema.safeParse(bodyResult.data);

  if (!parsed.success) {
    return NextResponse.json(
      errorResponse(
        ERROR_CODE.VALIDATION_ERROR,
        "Invalid strategy value. Must be conservative, balanced, or growth.",
        zodErrorToDetails(parsed.error),
      ),
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const { strategy } = parsed.data;

  const strategyPath =
    process.env.NEUROWEALTH_STRATEGY_PATH ?? "/strategy/preference";
  const fetchBackend = createServerFetcher();

  if (fetchBackend) {
    try {
      const res = await fetchBackend(strategyPath, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ strategy }),
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.json(
          errorResponse(ERROR_CODE.BACKEND_ERROR, "Strategy service temporarily unavailable."),
          { status: HTTP_STATUS.SERVICE_UNAVAILABLE, headers: { "Cache-Control": "no-store" } },
        );
      }
      const text = await res.text();
      const response = new NextResponse(text, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("Content-Type") ?? "application/json",
          "Cache-Control": "no-store",
        },
      });
      // Sync local cookie with the backend's successful response
      response.cookies.set(STRATEGY_COOKIE_KEY, strategy, {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
      return response;
    } catch {
      // fall through to local fallback
    }
  }

  const responseBody = successResponse<StrategyPreference>({ strategy });
  const response = NextResponse.json(responseBody, {
    headers: { "Cache-Control": "no-store" },
  });
  response.cookies.set(STRATEGY_COOKIE_KEY, strategy, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}
