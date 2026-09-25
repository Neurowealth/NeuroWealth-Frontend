/**
 * Next.js instrumentation hook — runs once when the server starts.
 *
 * We use this to validate environment variables at startup so the
 * dev server fails fast with a clear error instead of crashing later
 * at an unpredictable point.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only validate on the Node.js server runtime (not Edge, not browser).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic import keeps the module out of Edge/browser bundles.
    const { getEnv } = await import("@/lib/env");
    getEnv(); // throws with a clear message if required vars are missing
  }
}
