import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/api-auth";
import { getRateLimitKey } from "@/lib/rate-limit";

export function resolveTransactionClientId(request: NextRequest): string | null {
  const session = getSessionFromRequest(request);
  const ip = getRateLimitKey(request);
  return ip ?? (session?.token ? `session:${session.token}` : null);
}
