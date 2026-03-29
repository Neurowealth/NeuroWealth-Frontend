"use client";

export interface AuditEvent {
    id: string;
    eventType: "login" | "logout" | "signup" | "profile_update" | "password_change" | "settings_change" | "transaction" | "export";
    actor: string;
    timestamp: Date;
    metadata: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

const STORAGE_KEY = "nw_audit_trail";

function generateId(): string {
    return "evt_" + Math.random().toString(36).substring(2, 11);
}

export const mockAudit = {
    logEvent: (eventType: AuditEvent["eventType"], metadata: Record<string, unknown> = {}): AuditEvent => {
        const event: AuditEvent = {
            id: generateId(),
            eventType,
            actor: "current_user",
            timestamp: new Date(),
            metadata,
            ipAddress: "192.168.1.1",
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        };

        const events = mockAudit.getEvents();
        events.unshift(event);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 100)));

        return event;
    },

    getEvents: (): AuditEvent[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored).map((e: AuditEvent) => ({
                    ...e,
                    timestamp: new Date(e.timestamp),
                }));
            }
        } catch { }
        return [];
    },

    clearEvents: () => {
        localStorage.removeItem(STORAGE_KEY);
    },

    exportAsCSV: (): string => {
        const events = mockAudit.getEvents();
        const headers = ["Event ID", "Event Type", "Actor", "Timestamp", "IP Address", "Metadata"];
        const rows = events.map((e) => [
            e.id,
            e.eventType,
            e.actor,
            e.timestamp.toISOString(),
            e.ipAddress || "N/A",
            JSON.stringify(e.metadata),
        ]);

        const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
        return csv;
    },
};
