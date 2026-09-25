/**
 * Re-exports from src/lib/sandbox-scenario.ts for backwards compatibility.
 *
 * Previously this file delegated to portfolio.ts. It now uses the dedicated
 * sandbox-scenario module so that no unrelated portfolio logic is imported by
 * the transactions route (or any other sandbox-aware route).
 */
export {
  type SandboxScenario,
  parseSandboxScenario,
  parseSandboxScenario as resolveSandboxScenario,
  isSandboxScenario,
} from "@/lib/sandbox-scenario";
