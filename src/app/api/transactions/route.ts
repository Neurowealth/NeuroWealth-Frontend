import {
  buildPendingTransaction,
  buildTransactionQuote,
  parseTransactionKind,
  validateTransactionValues,
} from "@/lib/transactions";
import {
  ERROR_CODE,
  HTTP_STATUS,
  errorResponse,
  readJsonBody,
  successResponse,
} from "@/lib/api-response";
import {
  transactionPendingPayloadSchema,
  transactionQuotePayloadSchema,
  transactionRequestSchema,
  zodErrorToDetails,
} from "@/lib/validation/api";
import { NextRequest, NextResponse } from "next/server";
import { isSandboxScenario, parseSandboxScenario } from "@/lib/sandbox-scenario";
import { createServerFetcher, ServerFetchTimeoutError } from "@/lib/api-client";
import {
  isBackendErrorEnvelope,
  readBackendJson,
  toBackendErrorResponse,
  unwrapBackendPayload,
} from "@/lib/backend-response";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { getSessionFromRequest, requireAuth } from "@/lib/api-auth";
import { dictionaries } from "@/lib/i18n/messages";

const tDomain = dictionaries.en.transactions.domain;

export async function POST(request: NextRequest) {
  const authError = requireAuth(request, { requireSameOrigin: true });
  if (authError) return authError;

  const session = getSessionFromRequest(request);
  const ip = getRateLimitKey(request);
  const clientId = ip ?? (session?.token ? `session:${session.token}` : null);

  if (clientId) {
    const limit = checkRateLimit(`POST:/api/transactions:${clientId}`, {
      maxRequests: 20,
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
  const rawPayload = bodyResult.data;

  const parsedPayload = transactionRequestSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return NextResponse.json(
      errorResponse(
        ERROR_CODE.VALIDATION_ERROR,
        "Request body validation failed.",
        zodErrorToDetails(parsedPayload.error),
      ),
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const payload = parsedPayload.data;
  const kind = parseTransactionKind(payload.kind);
  const values = payload.values;
  const transactionPath =
    process.env.NEUROWEALTH_TRANSACTIONS_PATH ?? "/transactions";
  const scenario = parseSandboxScenario(
    request.nextUrl.searchParams.get("scenario"),
  );
  const fetchBackend = createServerFetcher();

  // Validate transaction values BEFORE forwarding to backend
  // This ensures semantic checks (amount range, wallet format, etc.) are
  // enforced regardless of whether we're using a backend or local mock
  const errors = validateTransactionValues(kind, values, tDomain);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      errorResponse(
        ERROR_CODE.VALIDATION_ERROR,
        "Fix the highlighted fields and try again.",
        errors,
      ),
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  if (fetchBackend && !isSandboxScenario(scenario)) {
    try {
      const response = await fetchBackend(transactionPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...payload,
          kind,
          values,
        }),
        cache: "no-store",
      });

      const raw = await readBackendJson(response);
      const rawValue = raw.kind === "json" ? raw.value : null;

      if (!response.ok || isBackendErrorEnvelope(rawValue)) {
        const failure = toBackendErrorResponse(
          response.status,
          rawValue,
          "Transaction service returned an unexpected response.",
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
            "Transaction service returned an unexpected response.",
          ),
          {
            status: HTTP_STATUS.BAD_GATEWAY,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }

      const backendPayload = unwrapBackendPayload(raw.value);
      const parsedResponse =
        payload.intent === "submit"
          ? transactionPendingPayloadSchema.safeParse(backendPayload)
          : transactionQuotePayloadSchema.safeParse(backendPayload);

      if (!parsedResponse.success) {
        return NextResponse.json(
          errorResponse(
            ERROR_CODE.BACKEND_ERROR,
            "Transaction service returned an unexpected response.",
          ),
          {
            status: HTTP_STATUS.BAD_GATEWAY,
            headers: { "Cache-Control": "no-store" },
          },
        );
      }

      return NextResponse.json(successResponse(parsedResponse.data), {
        status: HTTP_STATUS.OK,
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error) {
      if (error instanceof ServerFetchTimeoutError) {
        return NextResponse.json(
          errorResponse(
            ERROR_CODE.SERVICE_UNAVAILABLE,
            "Transaction service timed out. Please try again.",
          ),
          { status: HTTP_STATUS.REQUEST_TIMEOUT },
        );
      }

      const message =
        error instanceof Error ? error.message : "Backend request failed";

      return NextResponse.json(
        errorResponse(
          ERROR_CODE.BACKEND_ERROR,
          "Transaction service temporarily unavailable",
          { details: message },
        ),
        { status: HTTP_STATUS.SERVICE_UNAVAILABLE },
      );
    }
  }

  // Local mock path: validation already done above

  if (payload.intent === "submit") {
    const outcome = payload.simulation === "failure" ? "failure" : "success";

    return NextResponse.json(
      successResponse({
        pending: buildPendingTransaction(
          kind,
          values,
          tDomain.pending,
          tDomain.context,
          outcome,
        ),
      }),
    );
  }

  return NextResponse.json(
    successResponse({
      quote: buildTransactionQuote(kind, values, tDomain.context),
    }),
  );
}
