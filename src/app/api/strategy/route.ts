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
<<<<<<< HEAD
import {
  strategyPreferencePayloadSchema,
  strategyKindSchema,
  strategyUpdateSchema,
  zodErrorToDetails,
} from "@/lib/validation/api";
import { createServerFetcher, ServerFetchTimeoutError } from "@/lib/api-client";
import {
  isBackendErrorEnvelope,
  readBackendJson,
  toBackendErrorResponse,
  unwrapBackendPayload,
} from "@/lib/backend-response";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { getSessionFromRequest, requireAuth } from "@/lib/api-auth";

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

      if (!res.ok) {
        return NextResponse.json(
          errorResponse(ERROR_CODE.BACKEND_ERROR, "Strategy service temporarily unavailable."),
          { status: HTTP_STATUS.BAD_GATEWAY, headers: { "Cache-Control": "no-store" } },
        );
      }

      const backendData = await res.json();
      const validated = strategyKindSchema.safeParse(backendData?.strategy);

      if (!validated.success) {
        return NextResponse.json(
          errorResponse(
            ERROR_CODE.VALIDATION_ERROR,
            "Backend response has invalid shape.",
            zodErrorToDetails(validated.error),
          ),
          { status: HTTP_STATUS.BAD_REQUEST, headers: { "Cache-Control": "no-store" } },
        );
      }

      return NextResponse.json(successResponse<StrategyPreference>({ strategy: validated.data }), {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (error instanceof ServerFetchTimeoutError) {
        return NextResponse.json(
          errorResponse(ERROR_CODE.SERVICE_UNAVAILABLE, "Strategy service timed out. Please try again."),
          { status: 408, headers: { "Cache-Control": "no-store" } },
        );
      }

      return NextResponse.json(
        errorResponse(
          ERROR_CODE.BACKEND_ERROR,
          "Strategy service temporarily unavailable.",
        ),
        {
          status: HTTP_STATUS.SERVICE_UNAVAILABLE,
          headers: { "Cache-Control": "no-store" },
        },
      );
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

  const session = getSessionFromRequest(request);
  const ip = getRateLimitKey(request);
  const clientId = ip ?? (session?.token ? `session:${session.token}` : null);

  if (clientId) {
    const limit = checkRateLimit(`PUT:/api/strategy:${clientId}`, {
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

      const raw = await readBackendJson(res);
      const rawValue = raw.kind === "json" ? raw.value : null;

      if (!res.ok || isBackendErrorEnvelope(rawValue)) {
        const failure = toBackendErrorResponse(
          res.status,
          rawValue,
          "Strategy service returned an unexpected response.",
        );

        return NextResponse.json(failure.body, {
          status: failure.status,
          headers: { "Cache-Control": "no-store" },
        });
      }

      if (raw.kind !== "json") {
        return NextResponse.json(
          errorResponse(
            ERROR_CODE.BACKEND_ERROR,
            "Strategy service returned an unexpected response.",
          ),
          {
            status: HTTP_STATUS.BAD_GATEWAY,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }

      const backendPayload = unwrapBackendPayload(raw.value);
      const parsedResponse =
        strategyPreferencePayloadSchema.safeParse(backendPayload);

      if (!parsedResponse.success) {
        return NextResponse.json(
          errorResponse(
            ERROR_CODE.BACKEND_ERROR,
            "Strategy service returned an unexpected response.",
          ),
          {
            status: HTTP_STATUS.BAD_GATEWAY,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }

      // Sync local cookie with the backend's successful response
      const response = NextResponse.json(
        successResponse<StrategyPreference>({
          strategy: parsedResponse.data.strategy,
        }),
        {
          status: HTTP_STATUS.OK,
          headers: { "Cache-Control": "no-store" },
        },
      );
      response.cookies.set(
        STRATEGY_COOKIE_KEY,
        parsedResponse.data.strategy,
        {
          path: "/",
          sameSite: "lax",
          httpOnly: false,
        },
      );
      return response;
    } catch (error) {
      if (error instanceof ServerFetchTimeoutError) {
        return NextResponse.json(
          errorResponse(ERROR_CODE.SERVICE_UNAVAILABLE, "Strategy service timed out. Please try again."),
          { status: 408, headers: { "Cache-Control": "no-store" } },
        );
      }

      return NextResponse.json(
        errorResponse(
          ERROR_CODE.BACKEND_ERROR,
          "Strategy service temporarily unavailable.",
        ),
        {
          status: HTTP_STATUS.SERVICE_UNAVAILABLE,
          headers: { "Cache-Control": "no-store" },
        },
      );
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
