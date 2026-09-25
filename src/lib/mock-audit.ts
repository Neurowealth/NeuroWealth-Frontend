"use client";

import { random, randomItem } from "./seeded-rng";
import { scrubPII } from "./logger";

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
    return "evt_" + random().toString(36).substring(2, 11);
}

export interface AuditService {
    logEvent(eventType: AuditEvent["eventType"], metadata?: Record<string, unknown>): Promise<AuditEvent>;
    getEvents(): Promise<AuditEvent[]>;
    clearEvents(): Promise<void>;
    exportAsCSV(): Promise<string>;
}

const EVENT_TYPES: AuditEvent["eventType"][] = [
    "login", "logout", "signup", "profile_update", "password_change",
    "settings_change", "transaction", "export",
];
const ACTORS = ["alice", "bob", "charlie", "current_user", "admin", "system"];
const IP_ADDRESSES = ["192.168.1.1", "10.0.0.1", "203.0.113.42", "198.51.100.7", "172.16.0.1"];

function generateMockEvents(count: number): AuditEvent[] {
    const events: AuditEvent[] = [];
    const baseTime = Date.now();
    for (let i = 0; i < count; i++) {
        events.push({
            id: generateId(),
            eventType: randomItem(EVENT_TYPES),
            actor: randomItem(ACTORS),
            timestamp: new Date(baseTime - i * random() * 86400000),
            metadata: {},
            ipAddress: randomItem(IP_ADDRESSES),
            userAgent: "Mozilla/5.0 (Mock)",
        });
    }
    return events;
}

let devMockEvents: AuditEvent[] | null = null;

export const mockAuditService: AuditService = {
    logEvent: async (eventType: AuditEvent["eventType"], metadata: Record<string, unknown> = {}): Promise<AuditEvent> => {
        const event: AuditEvent = {
            id: generateId(),
            eventType,
            actor: "current_user",
            timestamp: new Date(),
            metadata: scrubPII(metadata) as Record<string, unknown>,
            ipAddress: "192.168.1.1",
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
        };

        const events = await mockAuditService.getEvents();
        events.unshift(event);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 100)));

        return event;
    },

    getEvents: async (): Promise<AuditEvent[]> => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored).map((e: AuditEvent) => ({
                    ...e,
                    timestamp: new Date(e.timestamp),
                }));
            }
        } catch { }

        if (process.env.NODE_ENV === "development" && !devMockEvents) {
            devMockEvents = generateMockEvents(250);
        }

        return devMockEvents ?? [];
    },

    clearEvents: async (): Promise<void> => {
        localStorage.removeItem(STORAGE_KEY);
    },

    exportAsCSV: async (): Promise<string> => {
        const events = await mockAuditService.getEvents();
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
