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
export type SandboxScenario =
  | "live"
  | "empty"
  | "loading"
  | "partial-failure"
  | "timeout";

/** The set of non-live sandbox scenarios (convenience for type narrowing). */
const SANDBOX_SCENARIOS = new Set<SandboxScenario>([
  "empty",
  "loading",
  "partial-failure",
  "timeout",
]);

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
  // In production, ignore all scenario overrides and return "live"
  if (process.env.NODE_ENV === "production") {
    return "live";
  }

  if (value === "empty") return "empty";
  if (value === "loading") return "loading";
  if (value === "partial-failure") return "partial-failure";
  if (value === "timeout") return "timeout";
  return "live";
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
