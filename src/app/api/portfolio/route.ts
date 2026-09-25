import {
  buildScenarioPayload,
  normalizePortfolioPayload,
} from "@/lib/portfolio";
import { isSandboxScenario, parseSandboxScenario } from "@/lib/sandbox-scenario";
import {
  ERROR_CODE,
  HTTP_STATUS,
  errorResponse,
  successResponse,
} from "@/lib/api-response";
import { portfolioQuerySchema, zodErrorToDetails } from "@/lib/validation/api";
import { createServerFetcher } from "@/lib/api-client";
import { requireAuth } from "@/lib/api-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const parsedQuery = portfolioQuerySchema.safeParse({
    scenario: request.nextUrl.searchParams.get("scenario") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      errorResponse(
        ERROR_CODE.VALIDATION_ERROR,
        "Query validation failed.",
        zodErrorToDetails(parsedQuery.error),
      ),
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const scenario = parseSandboxScenario(parsedQuery.data.scenario);
  const portfolioPath =
    process.env.NEUROWEALTH_PORTFOLIO_PATH ?? "/portfolio/overview";

  // Handle all sandbox scenarios
  if (isSandboxScenario(scenario)) {
    return NextResponse.json(successResponse(buildScenarioPayload(scenario)), {
      headers: {
        "Cache-Control": "no-store",
        "x-neurowealth-source": "demo",
      },
    });
  }

  const fetchBackend = createServerFetcher();

  if (!fetchBackend) {
    return NextResponse.json(successResponse(buildScenarioPayload("live")), {
      headers: {
        "Cache-Control": "no-store",
        "x-neurowealth-source": "demo",
      },
    });
  }

  try {
    const response = await fetchBackend(portfolioPath, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Portfolio endpoint returned ${response.status}`);
    }

    const payload = normalizePortfolioPayload(await response.json(), "api");

    return NextResponse.json(successResponse(payload), {
      headers: {
        "Cache-Control": "no-store",
        "x-neurowealth-source": payload.source,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch portfolio data";

    return NextResponse.json(
      errorResponse(
        ERROR_CODE.SERVICE_UNAVAILABLE,
        "Portfolio service temporarily unavailable.",
        { details: message },
      ),
      {
        status: HTTP_STATUS.SERVICE_UNAVAILABLE,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
