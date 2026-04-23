import {
  buildScenarioPayload,
  normalizePortfolioPayload,
  parseScenario,
} from "@/lib/portfolio";
import { NextRequest, NextResponse } from "next/server";

function resolveEndpoint(baseUrl: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl.slice(1)
    : pathOrUrl;

  return new URL(normalizedPath, normalizedBase).toString();
}

export async function GET(request: NextRequest) {
  const scenario = parseScenario(request.nextUrl.searchParams.get("scenario"));
  const apiBaseUrl = process.env.NEUROWEALTH_API_BASE_URL;
  const portfolioPath =
    process.env.NEUROWEALTH_PORTFOLIO_PATH ?? "/portfolio/overview";

  // Handle all sandbox scenarios
  if (scenario !== "live") {
    return NextResponse.json(buildScenarioPayload(scenario), {
      headers: {
        "Cache-Control": "no-store",
        "x-neurowealth-source": "demo",
      },
    });
  }

  if (!apiBaseUrl) {
    return NextResponse.json(buildScenarioPayload("live"), {
      headers: {
        "Cache-Control": "no-store",
        "x-neurowealth-source": "demo",
      },
    });
  }

  try {
    const response = await fetch(resolveEndpoint(apiBaseUrl, portfolioPath), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Portfolio endpoint returned ${response.status}`);
    }

    const payload = normalizePortfolioPayload(await response.json(), "api");

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
        "x-neurowealth-source": payload.source,
      },
    });
  } catch {
    const fallbackPayload = buildScenarioPayload("live", {
      source: "fallback",
      notice: "Backend endpoint unavailable, showing preview data instead.",
    });

    return NextResponse.json(fallbackPayload, {
      headers: {
        "Cache-Control": "no-store",
        "x-neurowealth-source": fallbackPayload.source,
      },
    });
  }
}
