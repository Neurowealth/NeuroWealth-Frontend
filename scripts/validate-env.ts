import { validateServerEnv } from "./lib/server-env";

try {
  validateServerEnv();
  console.log("Server environment variables valid ✅");
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
