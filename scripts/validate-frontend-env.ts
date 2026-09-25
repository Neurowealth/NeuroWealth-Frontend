import { getEnv } from "../src/lib/env";

try {
  getEnv();
  console.log("Frontend environment variables valid ✅");
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
