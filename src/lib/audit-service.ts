// #338 — typed domain event service accessor.
// AuditTrail and other consumers call getAuditService() instead of importing
// the mock singleton directly, so the implementation can be swapped without
// touching UI components.

export type { AuditEvent, AuditService } from "@/lib/mock-audit";

import { AuditService, mockAuditService } from "@/lib/mock-audit";

const activeAuditService: AuditService = mockAuditService;

export function getAuditService(): AuditService {
  return activeAuditService;
}
