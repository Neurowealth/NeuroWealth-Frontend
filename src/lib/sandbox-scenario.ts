import { portfolioQuerySchema, portfolioScenarioSchema } from "./validation/api";

/**
 * Shared sandbox scenario parsing utilities.
 *
 * Persistence approach: scenario is passed as a URL query parameter (?scenario=<value>)
 * from the client and read in the API route handlers. This keeps the server routes
 * stateless — no module-level variable or server-side storage is required.
 *
 * Both the portfolio and transactions routes import from this module so that the
 * valid scenario set and the fallback ("live") live in exactly one place.
 */

/** Recognised mock scenarios that alter API route behaviour. */
export type SandboxScenario = (typeof portfolioScenarioSchema.options)[number];

/** The set of non-live sandbox scenarios. */
const SANDBOX_SCENARIOS = new Set<SandboxScenario>(
  portfolioScenarioSchema.options.filter((scenario) => scenario !== "live"),
);

/**
 * Parse a raw query-parameter or localStorage value into a typed SandboxScenario.
 *
 * Unknown / missing values fall back to `"live"` so that routes behave normally
 * when no sandbox override is active.
 *
 * In production, scenario overrides are always ignored and "live" is returned
 * to prevent sandbox scenarios from being triggered in deployed environments.
 *
 * @param value - Raw string from a URL search param or null/undefined when absent.
 * @returns A validated SandboxScenario value.
 */
export function parseSandboxScenario(
  value: string | null | undefined,
): SandboxScenario {
  const result = parseSandboxScenarioQuery(value ?? null);
  return result.success ? result.scenario : "live";
}

/** Strict URL query validation for API routes that support sandbox overrides. */
export function parseSandboxScenarioQuery(value: string | null) {
  if (process.env.NODE_ENV === "production") {
    return { success: true, scenario: "live" } as const;
  }

  const result = portfolioQuerySchema.safeParse({
    scenario: value ?? undefined,
  });
  if (!result.success) return result;

  return { success: true, scenario: result.data.scenario ?? "live" } as const;
}

/**
 * Returns `true` when the scenario represents an active sandbox override (i.e. not
 * "live"). Use this as a guard before returning mock data from an API route.
 *
 * @param scenario - A SandboxScenario produced by `parseSandboxScenario`.
 */
export function isSandboxScenario(scenario: SandboxScenario): boolean {
  return SANDBOX_SCENARIOS.has(scenario);
}
